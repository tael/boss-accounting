/**
 * Google Identity Services 타입 선언
 * https://developers.google.com/identity/oauth2/web/reference/js-reference
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
            error_callback?: (error: { type: string; message?: string }) => void
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void }
          revoke: (token: string, callback?: () => void) => void
        }
      }
    }
  }
}

export {}
