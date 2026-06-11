# Task Log — [TASK-003] Spotify 음악 플레이어 구현

**날짜:** 2026-05-18  
**상태:** `완료`

## 작업 목표

YouTube IFrame API 방식을 Spotify Web API + Web Playback SDK로 전면 교체.
노래 검색 → 재생, 플레이리스트 관리, 볼륨/진행 바 제어, 탭 이동해도 재생 유지.

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/services/youtube.ts` | **삭제** | YouTube 서비스 제거 |
| `src/utils/youtube.ts` | **삭제** | YouTube 유틸 제거 |
| `src/types/player.ts` | 수정 | YouTube 타입 → Spotify SDK 타입 (`SpotifySDKPlayer`, `PlaylistTrack`, `spotifyTrackToPlaylistTrack`) |
| `src/types/spotify.ts` | **신규** | Spotify API/SDK 응답 타입 전체 |
| `src/services/spotifyAuth.ts` | **신규** | PKCE OAuth flow (initiateLogin, exchangeCodeForToken, refreshAccessToken, extractAuthCode) |
| `src/services/spotify.ts` | **신규** | Spotify Web API 호출 (search, playTracks, transferPlayback, repeat, shuffle, volume) |
| `src/store/useAuthStore.ts` | **신규** | 토큰 관리 (persist, 만료 5분 전 자동 갱신) |
| `src/store/usePlayerStore.ts` | 수정 | Spotify SDK 브릿지 액션, `_sdkPlayer` 런타임 상태, persist 분리 |
| `src/hooks/useSpotifyPlayer.ts` | **신규** | SDK 스크립트 로드 + Player 초기화 + 상태 동기화 |
| `src/components/player/SearchPanel.tsx` | **신규** | 검색 입력 → 결과 목록 → 바로재생/추가 |
| `src/components/player/PlaylistPanel.tsx` | **신규** | 플레이리스트 목록, 재생 인디케이터, 삭제 |
| `src/components/player/PlayerView.tsx` | **신규** | 로그인 유도 / 검색·플레이리스트 탭 컨테이너 |
| `src/components/player/PlayerBar.tsx` | **신규** | 하단 고정 컨트롤러 (현재 곡, 진행 바, 볼륨) |
| `src/App.tsx` | 수정 | 3열 레이아웃, PlayerBar 하단 고정, PKCE 콜백 처리, SDK 마운트 |
| `CLAUDE.md` | 수정 | YouTube → Spotify, 환경변수 설정 안내 추가 |
| `docs/report/specs/feature-spec.md` | 수정 | P-01~P-15 Spotify 기능 명세로 전면 교체 |
| `.env.example` | **신규** | VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_REDIRECT_URI |

## 주요 결정 사항

- **인증**: PKCE flow — Client Secret 불필요, 순수 브라우저 구현
- **SDK 싱글톤**: `useSpotifyPlayer` 훅은 `App.tsx`에서만 마운트. `sdkLoaded` 모듈 변수로 중복 로드 방지
- **탭 이동 시 재생 유지**: `PlayerBar`가 App 루트에 마운트되어 언마운트되지 않음. Zustand 전역 상태가 React 트리 전체 유지
- **persist 분리**: `_sdkPlayer`·`deviceId`·`playerState`·`progressMs` 등 런타임 상태는 `partialize`로 제외
- **이전 트랙**: 3초 이상 재생 중이면 seek(0), 미만이면 이전 트랙 (`Spotify 관행`)
- **중복 추가 방지**: `spotifyId` 기준으로 플레이리스트 중복 체크

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛 | usePlayerStore (9개) | ✅ |
| 유닛 | spotifyTrackToPlaylistTrack (4개) | ✅ |
| 컴포넌트 | PlayerView (3개) | ✅ |

**전체: 46 passed**

## 사전 설정 필요

1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) 에서 앱 생성
2. Redirect URIs에 `http://localhost:5173` 추가
3. `.env.local` 생성 후 `VITE_SPOTIFY_CLIENT_ID` 설정
4. **Spotify Premium** 계정 필요 (Web Playback SDK 제한)
