# Task Log — [TASK-010] 플레이어 상태 리렌더링 비교

**날짜:** 2026-06-04 
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> Spotify 플레이어의 현재 곡, 재생 여부, 볼륨, 진행 시간을 useState, Context API + useReducer, Zustand로 동일하게 구현하고 리렌더링 범위와 재생 안정성을 비교한다.

실제 프로젝트는 `package.json` 기준 React 19를 사용한다.

## 공통 실험 조건

- 동일 상태: `currentTrack`, `isPlaying`, `volume`, `progressMs`
- 동일 액션: 곡 변경, 재생 토글, 볼륨 변경, 진행 시간 변경, 초기화
- 진행 시간은 1초 간격으로 30회 갱신
- 각 방식은 개발 모드에서 3회 측정하고 중앙값 사용
- 세 방식 모두 같은 StrictMode 설정 사용

## 구현 파일

| 방식 | 파일 | 구독 특성 |
|------|------|-----------|
| useState | `src/experiments/player-state/useStatePlayer.ts` | 훅을 소유한 컴포넌트가 상태 변경마다 렌더링 |
| Context + useReducer | `src/experiments/player-state/contextPlayer.ts`, `ContextPlayerProvider.tsx` | 단일 Context 값을 읽는 모든 consumer가 변경마다 렌더링 |
| Zustand | `src/experiments/player-state/zustandPlayer.ts` | selector가 선택한 값이 변경된 consumer만 렌더링 가능 |
| 공통 타입 | `src/experiments/player-state/types.ts` | 세 구현의 상태와 액션 계약 통일 |

`src/experiments/`는 보고서 측정을 위한 로컬 코드로 `.gitignore` 처리했다.
프로덕션 진입점 `src/main.tsx`에는 연결하지 않으며, 실제 앱은 기존 `App`과
`usePlayerStore` 기반 Zustand 방식으로만 실행된다.

Zustand 측정 시에는 전체 스토어를 구조 분해하지 않고 필요한 값만 selector로 구독해야 한다.

```tsx
const progressMs = useZustandPlayer((state) => state.progressMs)
const volume = useZustandPlayer((state) => state.volume)
```

전체 스토어를 `useZustandPlayer()`로 구독하면 모든 상태 변경에 렌더링되어 selector 방식의 장점이 사라진다.

## React DevTools Profiler 측정

### 실행 URL

아래 URL은 로컬 실험이 필요한 기간에만 `PlayerStateExperiment`를
`src/main.tsx`에 임시 연결해서 사용한다. 현재 기본 앱에서는 비활성화되어 있다.

개발 서버를 실행한다.

```bash
npm run dev
```

다음 URL을 차례로 열면 동일한 실험 화면에서 상태 관리 방식만 교체된다.

| 방식 | URL |
|------|-----|
| useState | `http://127.0.0.1:5173/?experiment=player-state&mode=useState` |
| Context + useReducer | `http://127.0.0.1:5173/?experiment=player-state&mode=context` |
| Zustand | `http://127.0.0.1:5173/?experiment=player-state&mode=zustand` |

화면 상단의 모드 버튼으로도 전환할 수 있다. 모드 전환은 페이지를 새로 로드하므로 이전 방식의 상태와 렌더 카운트가 남지 않는다.

### 측정 순서

1. 측정할 모드 URL을 열고 `Spotify 로그인`을 진행한다.
2. Spotify 앱에서 곡을 재생한 상태로 실험 페이지를 열거나, Spotify Connect 장치에서 `Sync State Experiment`를 선택한다.
3. 화면의 SDK 상태가 `ready`이고 현재 곡과 진행 시간이 표시되는지 확인한다.
4. React DevTools의 **Profiler** 탭에서 `Record`를 누른다.
5. 실제 곡을 30초 동안 재생하며 볼륨 슬라이더를 5회 변경한다.
6. 같은 동안 실제 TodoView에서 항목 추가/완료를 5회 수행한다.
7. 실제 CalendarView에서 날짜 선택을 5회 수행한다.
8. 기록을 중지하고 `Player`, `TodoView`, `CalendarView`의 render 횟수와 commit 시간을 기록한다.
9. Console에서 해당 모드의 `SDK connect`가 1회이고 측정 도중 `SDK disconnect`가 발생하지 않았는지 확인한다.
10. 다음 모드 URL을 열고 같은 순서로 반복한다.
11. 각 방식을 3회 측정하고 중앙값을 최종 표에 입력한다.

Profiler의 `Why did this render?` 옵션을 켜면 props, state, hooks 중 어떤 변경이 렌더 원인인지 확인할 수 있다. 콘솔의 `console.count('Component render')`는 보조 지표로만 사용하고 최종 수치는 Profiler 기준으로 기록한다.

실험 화면은 실제 `TodoView`, `CalendarView`, Spotify Web Playback SDK를 사용한다.
React `Profiler`가 Console에 `[Player State Profiler]` 형식으로 각 commit의
`actualDuration`과 `baseDuration`을 출력한다.

### 측정 범위 주의

세 URL은 상태 관리자만 다르고 다음 조건은 동일하다.

- 기존 Spotify PKCE 인증 및 토큰 갱신 사용
- 같은 Web Playback SDK 초기화 코드 사용
- SDK의 `player_state_changed`와 1초 진행 시간 조회를 선택한 상태 관리자에 직접 저장
- 실제 TodoView와 CalendarView 사용
- 모드 전환 시 페이지가 다시 로드되므로 각 측정에서 SDK는 새로 연결

따라서 `disconnect` 카운트는 **모드를 전환할 때 발생하는 1회**가 아니라, 한 모드의
Profiler 기록이 진행되는 도중 추가로 발생하는지를 판정한다.

## 음악 끊김 확인

세 방식 모두 상태 컨테이너보다 SDK 생명주기 배치가 더 중요하다. 실험 페이지는 각 모드에서 SDK 브리지를 한 번만 마운트하고 상태 변경으로 다시 연결하지 않는다.

1. Spotify 곡을 재생하고 시작 위치를 기록한다.
2. DevTools Console에서 `[Spotify SDK]` 연결 오류가 없는지 확인한다.
3. 투두 추가/완료와 캘린더 날짜 변경을 각각 20회 수행한다.
4. 재생음이 멈추거나 처음으로 돌아가는지 듣고, 실험 Player의 진행 시간이 계속 증가하는지 확인한다.
5. Network 탭에서 상태 변경 중 `/me/player/play`가 의도치 않게 재호출되지 않는지 확인한다.
6. Console의 `[Player State Experiment][모드] SDK connect/disconnect` 카운트를 확인한다.

판정 기준:

| 항목 | 통과 조건 |
|------|-----------|
| SDK 연결 | 실험 중 추가 `connect()` 없음 |
| SDK 해제 | 실험 중 `disconnect()` 없음 |
| 재생 위치 | 1초 주기로 계속 증가하고 0으로 초기화되지 않음 |
| REST 재생 요청 | 사용자 재생 조작 없이 추가 `/me/player/play` 없음 |
| 청감 | 투두/캘린더 렌더 중 무음 또는 끊김 없음 |

## 보고서용 비교 표

리렌더링 횟수는 측정 전 예상 경향이며, 최종 보고서에는 Profiler 실측값을 입력한다.

| 방식 | 진행 시간 30회 갱신 시 예상 렌더 | 투두/캘린더 영향 | 구현 코드량 | 러닝커브 | 평가 |
|------|-------------------------------|------------------|--------|----------|------|
| useState | 상태 소유 컴포넌트 30회 이상 | 상태를 App에 올리면 하위 트리 영향 가능 | 45줄 | 낮음 | 작은 로컬 플레이어에 적합 |
| Context + useReducer | 단일 Context consumer마다 약 30회 | Provider 범위가 넓으면 불필요한 렌더 증가 | 58줄 | 중간 | 의존성 없이 전역 공유 가능 |
| Zustand | `progressMs` selector consumer 중심 약 30회 | 비구독 컴포넌트는 원칙적으로 0회 | 15줄 | 중간 | 고빈도 전역 상태에 가장 적합 |

### 실측값 기록표

| 방식 | Player 렌더 횟수 | TodoView 추가 렌더 | CalendarView 추가 렌더 | 총 commit 시간 | 재생 끊김 |
|------|------------------:|---------------------:|-------------------------:|-----------------:|-----------|
| useState | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |
| Context + useReducer | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |
| Zustand | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |

코드량은 공통 타입 파일과 테스트를 제외하고 비어 있지 않은 줄을 계산한 값이다.

## 결론

현재 앱처럼 SDK 진행 시간이 1초마다 갱신되고 여러 화면에서 플레이어 상태를 공유하는 구조에서는 Zustand selector 구독이 가장 적합하다. 다만 현재 `PlayerBar`는 `usePlayerStore()` 전체를 구독하고 있으므로, 최적화 실험에서는 상태별 selector 구독으로 변경한 버전도 함께 측정해야 정확한 Zustand 이점을 확인할 수 있다.
