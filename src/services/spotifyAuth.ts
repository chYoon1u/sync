const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined)
  ?? window.location.origin
const PKCE_VERIFIER_KEY = 'spotify_pkce_verifier'
const AUTH_STATE_KEY = 'spotify_auth_state'

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ')

// ── PKCE 유틸 ─────────────────────────────────────────────

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain))
}

function base64urlencode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join('')
}

// ── 공개 API ──────────────────────────────────────────────

/** Spotify 로그인 페이지로 리디렉션 */
export async function initiateLogin(): Promise<void> {
  if (!CLIENT_ID?.trim()) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is missing.')
  }

  if (!REDIRECT_URI?.trim()) {
    throw new Error('VITE_SPOTIFY_REDIRECT_URI is missing.')
  }

  let redirectUrl: URL
  try {
    redirectUrl = new URL(REDIRECT_URI)
  } catch {
    throw new Error('VITE_SPOTIFY_REDIRECT_URI must be a valid URL.')
  }

  if (redirectUrl.hostname === 'localhost') {
    throw new Error('Spotify redirect URI must use 127.0.0.1 instead of localhost.')
  }

  const isLoopback =
    redirectUrl.hostname === '127.0.0.1' || redirectUrl.hostname === '[::1]'
  if (redirectUrl.protocol !== 'https:' && !(redirectUrl.protocol === 'http:' && isLoopback)) {
    throw new Error('Spotify redirect URI must use HTTPS or an explicit loopback IP.')
  }

  const verifier = randomString(64)
  const state = randomString(32)
  const challenge = base64urlencode(await sha256(verifier))
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(AUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
    state,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export interface TokenResult {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/** 인가 코드 → 토큰 교환 */
export async function exchangeCodeForToken(code: string): Promise<TokenResult> {
  if (!CLIENT_ID?.trim()) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is missing.')
  }

  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  if (!verifier) {
    throw new Error('로그인 세션이 만료되었습니다. Spotify 로그인을 다시 시도해 주세요.')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${body}`)
  }

  const data = await res.json()
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

/** 액세스 토큰 갱신 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<Pick<TokenResult, 'accessToken' | 'expiresAt'>> {
  if (!CLIENT_ID?.trim()) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is missing.')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  const data = await res.json()

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

/** URL에서 인가 코드를 추출하고 URL을 정리 */
export interface AuthCallback {
  code: string | null
  error: string | null
}

export function extractAuthCallback(): AuthCallback {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  let error = params.get('error')
  const returnedState = params.get('state')

  if (code || error) {
    const expectedState = sessionStorage.getItem(AUTH_STATE_KEY)
    sessionStorage.removeItem(AUTH_STATE_KEY)
    if (!expectedState || returnedState !== expectedState) {
      error = 'Spotify 로그인 요청을 확인할 수 없습니다. 다시 로그인해 주세요.'
    }
    window.history.replaceState({}, '', window.location.pathname)
  }

  return { code: error ? null : code, error }
}
