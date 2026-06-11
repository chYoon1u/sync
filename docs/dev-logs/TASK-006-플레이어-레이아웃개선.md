# Task Log - [TASK-006] 음악 플레이어 UX 수정

**날짜:** 2026-05-24  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> Spotify 로그인 경로를 점검하고, 재생바/플레이리스트 팝업/재실행 복원 동작을 요구사항에 맞게 수정한다.

## 구현 내역

### 변경한 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/services/spotifyAuth.ts` | 수정 | 로그인 시작 전 환경값 검증을 정리하고, 인증 오류 메시지를 명확하게 정리 |
| `src/store/usePlayerStore.ts` | 수정 | 마지막 재생 곡 ID와 재생 이력 상태를 persist하여 재실행 복원 기준 보강 |
| `src/hooks/useSpotifyPlayer.ts` | 수정 | SDK 준비 후 마지막 재생 곡과 재생 위치를 기준으로 자동 복원 재생 |
| `src/components/player/PlayerView.tsx` | 수정 | 플레이리스트 목록은 작은 팝업으로, 곡 추가는 별도 모달로 분리 유지 |
| `src/components/player/PlaylistPanel.tsx` | 수정 | 스크롤 가능한 목록 팝업 UI와 숨김 스크롤바 정리 |
| `src/components/player/SearchPanel.tsx` | 수정 | 곡 추가/바로 재생 흐름과 검색 UI 문구 정리 |
| `src/components/player/PlayerBar.tsx` | 수정 | 하단 PlayerBar 진행 바가 전체 가로 폭을 더 넓게 사용하도록 레이아웃 조정 |
| `tests/component/player/Player.test.tsx` | 수정 | 로그인/곡 추가 모달/플레이리스트 팝업 동작 검증 |
| `tests/unit/store/usePlayerStore.test.ts` | 수정 | 재생 이력 복원 상태와 다음 곡 전환 시 마지막 곡 정보 갱신 검증 |
| `docs/report/specs/feature-spec.md` | 수정 | 플레이어 로그인, 팝업, 하단 재생바, 재실행 복원 요구사항 반영 |

### 주요 결정 사항

- 로그인 실패 원인 중 코드 차단 로직은 줄이고, 실제 환경 변수 누락과 인증 세션 문제를 우선 드러내도록 정리했다.
- 마지막 재생 곡 복원은 `currentIndex`만 믿지 않고 `lastPlayedSpotifyId`도 함께 저장해서 플레이리스트 변경 후에도 복원 기준이 남도록 했다.
- `플레이리스트` 버튼은 작은 팝업 목록만 열고, `곡 추가` 버튼만 별도 모달을 열도록 역할을 분리했다.
- PlayerBar의 중앙 진행 영역 폭을 키워 하단바의 가로 공간을 더 직접적으로 쓰도록 조정했다.

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 단위/컴포넌트 | `npm run test -- tests/unit/store/usePlayerStore.test.ts tests/component/player/Player.test.tsx` | 통과 |
| 빌드 | `npm run build` | 통과 |
| E2E | 실행하지 않음 | 개발 서버/실브라우저 검증 미실행 |

## 스크린샷

> 해당 없음

## 이슈 / 메모

- Spotify Developer Dashboard의 Redirect URI는 실제 실행 주소와 정확히 일치해야 한다.
- 이번 작업에서는 로컬 코드 경로와 UI 동작을 정리했지만, Spotify 계정 권한이나 대시보드 설정이 틀리면 브라우저 인증은 계속 실패할 수 있다.
