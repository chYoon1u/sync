import { afterEach, describe, expect, it } from 'vitest'
import { extractAuthCallback } from '@/services/spotifyAuth'

afterEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('extractAuthCallback', () => {
  it('저장된 state와 콜백 state가 일치하면 인가 코드를 반환한다', () => {
    sessionStorage.setItem('spotify_auth_state', 'expected-state')
    window.history.replaceState({}, '', '/?code=auth-code&state=expected-state')

    expect(extractAuthCallback()).toEqual({ code: 'auth-code', error: null })
    expect(window.location.search).toBe('')
    expect(sessionStorage.getItem('spotify_auth_state')).toBeNull()
  })

  it('콜백 state가 일치하지 않으면 인증 오류로 처리한다', () => {
    sessionStorage.setItem('spotify_auth_state', 'expected-state')
    window.history.replaceState({}, '', '/?code=auth-code&state=wrong-state')

    const result = extractAuthCallback()

    expect(result.code).toBeNull()
    expect(result.error).toContain('다시 로그인')
  })
})
