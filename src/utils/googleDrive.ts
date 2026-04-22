/**
 * Google Drive appData 연동 유틸리티
 * appData 스코프: 앱이 만든 파일만 접근하는 숨김 공간
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const BACKUP_FILENAME = 'backup.json'

/** GIS 스크립트가 로드될 때까지 대기 */
export function waitForGoogleIdentityServices(): Promise<void> {
  // 이미 로드된 경우 즉시 resolve
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    // 기존 스크립트 태그를 찾아 onload에 연결
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="accounts.google.com/gsi/client"]'
    )

    let settled = false

    const onLoad = () => {
      if (settled) return
      settled = true
      existingScript?.removeEventListener('load', onLoad)
      existingScript?.removeEventListener('error', onError)
      if (window.google?.accounts?.oauth2) {
        resolve()
      } else {
        reject(new Error('Google Identity Services 로드 실패'))
      }
    }

    const onError = () => {
      if (settled) return
      settled = true
      existingScript?.removeEventListener('load', onLoad)
      existingScript?.removeEventListener('error', onError)
      reject(new Error('GIS 스크립트 로드 오류'))
    }

    if (existingScript) {
      if (existingScript.dataset['loaded']) {
        onLoad()
      } else {
        existingScript.addEventListener('load', onLoad)
        existingScript.addEventListener('error', onError)
      }
    } else {
      // 스크립트가 없으면 직접 삽입
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true

      const onNewLoad = () => {
        if (settled) return
        settled = true
        script.removeEventListener('load', onNewLoad)
        script.removeEventListener('error', onNewError)
        script.dataset['loaded'] = 'true'
        if (window.google?.accounts?.oauth2) {
          resolve()
        } else {
          reject(new Error('Google Identity Services 로드 실패'))
        }
      }

      const onNewError = () => {
        if (settled) return
        settled = true
        script.removeEventListener('load', onNewLoad)
        script.removeEventListener('error', onNewError)
        reject(new Error('GIS 스크립트 로드 오류'))
      }

      script.addEventListener('load', onNewLoad)
      script.addEventListener('error', onNewError)
      document.head.appendChild(script)
    }

    // 10초 타임아웃
    setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('GIS 로드 타임아웃 (10초)'))
    }, 10_000)
  })
}

/** OAuth 액세스 토큰 요청 (팝업) */
export function requestAccessToken(prompt?: '' | 'consent'): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(`인증 오류: ${response.error}`))
          return
        }
        if (!response.access_token) {
          reject(new Error('액세스 토큰을 받지 못했습니다.'))
          return
        }
        resolve(response.access_token)
      },
      error_callback: (error) => {
        if (error.type === 'popup_closed' || error.type === 'popup_blocked') {
          reject(
            new Error(
              'POPUP_BLOCKED: 팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해 주세요.',
            ),
          )
        } else {
          reject(new Error(`인증 오류: ${error.type}${error.message ? ` - ${error.message}` : ''}`))
        }
      },
    })

    client.requestAccessToken(prompt !== undefined ? { prompt } : undefined)
  })
}

/** 토큰 폐기 (로그아웃) */
export function revokeToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    window.google?.accounts.oauth2.revoke(token, () => {
      resolve()
    })
  })
}

/** Drive API 응답 에러 처리 */
async function handleDriveError(response: Response): Promise<never> {
  let message = `Drive API 오류 (HTTP ${response.status})`
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    if (body.error?.message) {
      message = `Drive API 오류: ${body.error.message}`
    }
  } catch {
    // JSON 파싱 실패 시 기본 메시지 사용
  }
  throw new Error(message)
}

/** appData 폴더에서 backup.json 파일 ID 조회 (없으면 null) */
export async function findBackupFileId(accessToken: string): Promise<string | null> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${BACKUP_FILENAME}'`,
    fields: 'files(id,name,modifiedTime,size)',
  })

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) await handleDriveError(response)

  const data = (await response.json()) as { files: Array<{ id: string }> }
  return data.files[0]?.id ?? null
}

/** appData에 백업 업로드 (기존 파일 덮어쓰기 or 새로 생성) */
export async function uploadBackup(
  accessToken: string,
  jsonContent: string,
): Promise<{ fileId: string; modifiedTime: string }> {
  const existingFileId = await findBackupFileId(accessToken)

  if (existingFileId) {
    // 기존 파일 덮어쓰기 (PATCH + media upload)
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media&fields=id,modifiedTime`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: jsonContent,
      },
    )

    if (!response.ok) await handleDriveError(response)

    const data = (await response.json()) as { id: string; modifiedTime: string }
    return { fileId: data.id, modifiedTime: data.modifiedTime }
  }

  // 새 파일 생성 (multipart upload)
  const metadata = JSON.stringify({
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    parents: ['appDataFolder'],
  })

  const boundary = 'boss_accounting_boundary'
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    jsonContent,
    `--${boundary}--`,
  ].join('\r\n')

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  )

  if (!response.ok) await handleDriveError(response)

  const data = (await response.json()) as { id: string; modifiedTime: string }
  return { fileId: data.id, modifiedTime: data.modifiedTime }
}

/** appData에서 백업 다운로드 */
export async function downloadBackup(
  accessToken: string,
  fileId: string,
): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  if (!response.ok) await handleDriveError(response)

  return response.text()
}

/** 백업 파일 메타데이터 조회 */
export async function getBackupMetadata(
  accessToken: string,
  fileId: string,
): Promise<{ modifiedTime: string; size: string } | null> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=modifiedTime,size`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  if (response.status === 404) return null
  if (!response.ok) await handleDriveError(response)

  const data = (await response.json()) as { modifiedTime: string; size: string }
  return { modifiedTime: data.modifiedTime, size: data.size }
}
