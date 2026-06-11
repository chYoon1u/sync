const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined)
  ?? window.location.origin

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
  const verifier = randomString(64)
  const challenge = base64urlencode(await sha256(verifier))
  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
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
  const verifier = sessionStorage.getItem('pkce_verifier')
  if (!verifier) throw new Error('PKCE verifier not found in sessionStorage')

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
  sessionStorage.removeItem('pkce_verifier')

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
export function extractAuthCode(): string | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const error = params.get('error')

  if (error) {
    console.error('Spotify auth error:', error)
    window.history.replaceState({}, '', window.location.pathname)
    return null
  }

  if (code) {
    window.history.replaceState({}, '', window.location.pathname)
  }

  return code
}
