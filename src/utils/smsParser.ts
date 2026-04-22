export interface ParsedTransaction {
  date: string       // YYYY-MM-DD
  amountKRW: number
  memo: string
  type: 'income' | 'expense'
}

/**
 * 주요 한국 카드/은행 알림 문자 패턴 파서
 *
 * 지원 패턴 예시:
 *   "[국민카드] 1,500원 승인 (스타벅스) 2026-04-22"
 *   "[신한카드] 04/22 10:30 스타벅스 1,500원 승인"
 *   "하나은행 출금 2026.04.22 15,000원 GS25편의점"
 *   "우리은행 입금 50,000원 2026-04-22 홍길동"
 *   "04월22일 3,000원 결제 GS칼텍스"
 */
export function parseSmsText(text: string): ParsedTransaction | null {
  if (!text || !text.trim()) return null

  // ── 금액 파싱 ──────────────────────────────────────────────────
  // 패턴: 1,500원 / 1500원 / 1,500,000원
  const amountMatch = text.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)원/)
  if (!amountMatch) return null
  const amountKRW = parseInt(amountMatch[1].replace(/,/g, ''), 10)
  if (isNaN(amountKRW) || amountKRW <= 0) return null

  // ── 날짜 파싱 ──────────────────────────────────────────────────
  const date = parseDate(text)

  // ── 업체명(메모) 파싱 ─────────────────────────────────────────
  const memo = parseMerchant(text, amountMatch[0])

  // ── 거래 유형 판별 ────────────────────────────────────────────
  const type: 'income' | 'expense' = /입금|수신|수령|입력|환급/.test(text) ? 'income' : 'expense'

  return { date, amountKRW, memo, type }
}

/** 텍스트에서 날짜를 추출하여 YYYY-MM-DD 형식으로 반환 */
function parseDate(text: string): string {
  const today = new Date()
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  // 패턴 1: YYYY-MM-DD 또는 YYYY.MM.DD 또는 YYYY/MM/DD
  const fullYearMatch = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  if (fullYearMatch) {
    const y = parseInt(fullYearMatch[1], 10)
    const m = parseInt(fullYearMatch[2], 10)
    const d = parseInt(fullYearMatch[3], 10)
    if (isValidDate(y, m, d)) return formatDate(y, m, d)
  }

  // 패턴 2: YY.MM.DD 또는 YY/MM/DD 또는 YY-MM-DD (2자리 연도)
  const shortYearMatch = text.match(/(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  if (shortYearMatch) {
    const y = 2000 + parseInt(shortYearMatch[1], 10)
    const m = parseInt(shortYearMatch[2], 10)
    const d = parseInt(shortYearMatch[3], 10)
    if (isValidDate(y, m, d)) return formatDate(y, m, d)
  }

  // 패턴 3: MM/DD (월/일만 있는 경우, 예: 카드사 04/22)
  const mdSlashMatch = text.match(/(\d{1,2})\/(\d{1,2})(?!\d)/)
  if (mdSlashMatch) {
    const m = parseInt(mdSlashMatch[1], 10)
    const d = parseInt(mdSlashMatch[2], 10)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return formatDate(today.getFullYear(), m, d)
    }
  }

  // 패턴 4: MM월DD일 (예: 04월22일)
  const koreanDateMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/)
  if (koreanDateMatch) {
    const m = parseInt(koreanDateMatch[1], 10)
    const d = parseInt(koreanDateMatch[2], 10)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return formatDate(today.getFullYear(), m, d)
    }
  }

  return todayStr
}

/** YYYY-MM-DD 형식으로 포맷 */
function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** 날짜 유효성 간단 검증 */
function isValidDate(y: number, m: number, d: number): boolean {
  return y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31
}

/**
 * 텍스트에서 업체명을 추출
 * 우선순위: 괄호 안 > 카드사명 이후 단어 > 앞부분 텍스트
 */
function parseMerchant(text: string, amountToken: string): string {
  // 괄호 안 텍스트: (스타벅스) / [국민카드] 는 제외
  const parenMatch = text.match(/[(\[【]([^)\]】\s][^)\]】]{0,30})[)\]】]/)
  if (parenMatch) {
    const candidate = parenMatch[1].trim()
    // 카드사/은행명이 아닌 경우만 사용
    if (!/(카드|은행|pay|페이|KB|신한|하나|우리|농협|삼성|현대|롯데|씨티|BC)/i.test(candidate)) {
      return candidate
    }
  }

  // 금액 토큰 전후 텍스트에서 업체명 추출
  const amountIdx = text.indexOf(amountToken)

  // 금액 앞 텍스트에서 마지막 의미 있는 단어
  if (amountIdx > 0) {
    const before = text.slice(0, amountIdx).trim()
    // 카드/은행명, 날짜, 시간, 승인코드 제거
    const cleaned = before
      .replace(/\[.*?\]/g, '')
      .replace(/\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}/g, '')
      .replace(/\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}/g, '')
      .replace(/\d{1,2}:\d{2}/g, '')
      .replace(/승인|결제|출금|입금|사용|완료/g, '')
      .trim()
    const words = cleaned.split(/\s+/).filter(Boolean)
    if (words.length > 0) {
      const last = words[words.length - 1]
      if (last && last.length >= 2) return last
    }
  }

  // 금액 뒤 텍스트에서 첫 번째 의미 있는 단어
  if (amountIdx >= 0 && amountIdx + amountToken.length < text.length) {
    const after = text.slice(amountIdx + amountToken.length).trim()
    const cleaned = after
      .replace(/승인|결제|출금|입금|사용|완료|번호|\d+/g, '')
      .trim()
    const words = cleaned.split(/\s+/).filter((w) => w.length >= 2)
    if (words.length > 0 && words[0]) return words[0]
  }

  // 최후 수단: 앞 30자
  return text.slice(0, 30).trim()
}
