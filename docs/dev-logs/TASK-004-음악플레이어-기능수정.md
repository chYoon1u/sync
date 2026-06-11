# Task Log — [TASK-004] 음악 플레이어 기능 수정

**날짜:** 2026-05-18 
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> Spotify 로그인 연결을 복구하고 재생바, 마지막 곡 복원, 플레이리스트 팝업 동작을 요구사항에 맞게 수정한다.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/services/spotifyAuth.ts` | 수정 | 로그인 설정 검증, PKCE state 검증, 인증 콜백 오류 전달 |
| `src/services/spotify.ts` | 수정 | 마지막 재생 위치를 포함한 재생 요청, 검색 상한 10개 적용 |
| `src/store/useAuthStore.ts` | 수정 | 인증 오류 상태 추가 |
| `src/store/usePlayerStore.ts` | 수정 | 마지막 곡·위치·실제 재생 이력 영속화 |
| `src/hooks/useSpotifyPlayer.ts` | 수정 | SDK 준비 후 마지막 곡 자동 복원, SDK 오류 및 진행 위치 주기 동기화 |
| `src/components/player/*` | 수정 | 플레이리스트 팝오버와 새 곡 추가 모달 분리 |
| `src/App.tsx`, `src/index.css` | 수정 | 전체 화면 레이아웃과 전체 너비 하단 재생바 |
| `.env.example`, `.env.local`, `package.json`, `electron/main.cjs` | 수정 | Spotify 허용 주소인 `127.0.0.1`로 URL 통일, 배포 앱 로컬 정적 서버 추가 |
| `docs/report/specs/feature-spec.md` | 수정 | P-04, P-11~P-14 기능 명세 갱신 |
| `tests/unit/services/*`, `tests/component/player/*` | 신규 / 수정 | OAuth state, 검색 상한, 팝업 동작 회귀 테스트 |

### 주요 결정 사항

- Spotify 공식 Redirect URI 정책에 따라 `localhost` 대신 `http://127.0.0.1:5173`을 사용한다.
- OAuth 요청과 콜백의 `state` 값을 비교해 다른 로그인 요청의 콜백을 거부한다.
- 2026년 Spotify 개발 모드의 검색 API 상한에 맞춰 요청 결과 수를 10개로 제한한다.
- Electron 배포 앱도 loopback 정적 서버에서 실행해 Spotify 인증 콜백을 받을 수 있게 한다.
- 실제로 재생한 이력이 있을 때만 앱 재실행 후 마지막 곡과 위치를 자동 복원한다.
- SDK 상태를 1초 간격으로 동기화해 하단 진행 바와 복원 위치를 갱신한다.
- 플레이리스트 조회는 작은 목록 팝오버, 곡 검색·추가는 별도 모달로 분리한다.
- 팝업 목록은 스크롤 가능하지만 브라우저 스크롤바는 표시하지 않는다.

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 빌드 | `npm run build` | 통과 |
| 유닛·컴포넌트 | `npm run test` | 55개 전체 통과 |
| 정적 분석 | `npm run lint` | 통과 |
| 브라우저 UI | 인앱 브라우저 검증 | Windows 샌드박스 초기화 오류로 미실행 |

## 스크린샷

> 해당 없음

## 이슈 / 메모

- Spotify Developer Dashboard의 Redirect URI도 `http://127.0.0.1:5173`으로 동일하게 등록해야 한다.
- 개발 모드 앱 소유자는 Spotify Premium 계정이어야 하며, 사용할 계정은 Dashboard의 허용 사용자에 등록해야 한다.
- SDK `ready` 이벤트 전에 플레이어 브리지를 등록해 마지막 재생 곡 복원 시점의 경쟁 조건을 방지했다.
