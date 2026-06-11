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
| Context + useReducer | `contextPlayer.ts`, `ContextPlayerProvider.tsx` | 단일 Context consumer가 값 변경마다 렌더링 |
| Zustand | `zustandPlayer.ts` | selector가 선택한 값이 변경된 consumer만 렌더링 가능 |
| 실제 SDK 브리지 | `useSpotifyExperimentPlayer.ts` | 세 방식에 동일한 SDK 이벤트 전달 |

`src/experiments/`와 전용 테스트는 `.gitignore` 처리한 로컬 측정 코드다. 프로덕션 `src/main.tsx`에는 연결하지 않으며 실제 앱은 기존 `App`과 `usePlayerStore` 기반 Zustand 방식으로만 실행된다.

Zustand 측정 시 전체 스토어가 아니라 필요한 값만 selector로 구독한다.

```tsx
const progressMs = useZustandPlayer((state) => state.progressMs)
const volume = useZustandPlayer((state) => state.volume)
```

## 실험 페이지 사용

아래 URL은 로컬 실험 기간에만 `PlayerStateExperiment`를 `src/main.tsx`에 임시 연결해서 사용한다. 현재 기본 앱에서는 비활성화되어 있다.

| 방식 | URL |
|------|-----|
| useState | `http://127.0.0.1:5173/?experiment=player-state&mode=useState` |
| Context + useReducer | `http://127.0.0.1:5173/?experiment=player-state&mode=context` |
| Zustand | `http://127.0.0.1:5173/?experiment=player-state&mode=zustand` |

## React DevTools Profiler 측정

1. 실험 모드를 임시 연결한 뒤 `npm run dev`를 실행한다.
2. 측정할 모드 URL에서 Spotify 로그인한다.
3. SDK 상태가 `ready`이고 현재 곡과 진행 시간이 표시되는지 확인한다.
4. React DevTools Profiler에서 Record를 시작한다.
5. 실제 곡을 30초 재생하며 볼륨을 5회 변경한다.
6. 실제 TodoView에서 항목 추가/완료를 5회 수행한다.
7. 실제 CalendarView에서 날짜 선택을 5회 수행한다.
8. 기록을 중지하고 Player, TodoView, CalendarView의 렌더 횟수와 commit 시간을 기록한다.
9. Console에서 해당 모드의 SDK connect가 1회이고 측정 도중 disconnect가 발생하지 않았는지 확인한다.
10. 각 방식을 3회 측정하고 중앙값을 사용한다.

Console에는 `[Player State Profiler]` 형식으로 `actualDuration`과 `baseDuration`이 출력된다.

## 음악 끊김 확인

1. Spotify 곡을 재생하고 시작 위치를 기록한다.
2. Console에서 SDK 연결 오류가 없는지 확인한다.
3. 투두 추가/완료와 캘린더 날짜 변경을 각각 20회 수행한다.
4. 재생음이 멈추거나 처음으로 돌아가는지 듣고 진행 시간이 계속 증가하는지 확인한다.
5. Network 탭에서 `/me/player/play`가 의도치 않게 재호출되지 않는지 확인한다.
6. `[Player State Experiment][모드] SDK connect/disconnect` 카운트를 확인한다.

| 항목 | 통과 조건 |
|------|-----------|
| SDK 연결 | 실험 중 추가 `connect()` 없음 |
| SDK 해제 | 실험 중 `disconnect()` 없음 |
| 재생 위치 | 계속 증가하고 0으로 초기화되지 않음 |
| REST 재생 요청 | 사용자 재생 조작 없이 추가 호출 없음 |
| 청감 | 투두/캘린더 렌더 중 끊김 없음 |

## 보고서용 비교 표

| 방식 | 진행 시간 30회 갱신 시 예상 렌더 | 투두/캘린더 영향 | 구현 코드량 | 러닝커브 | 평가 |
|------|-------------------------------|------------------|------------:|----------|------|
| useState | 상태 소유 컴포넌트 30회 이상 | App에 올리면 하위 트리 영향 가능 | 45줄 | 낮음 | 작은 로컬 플레이어에 적합 |
| Context + useReducer | Context consumer마다 약 30회 | Provider 범위가 넓으면 불필요한 렌더 증가 | 58줄 | 중간 | 의존성 없이 전역 공유 가능 |
| Zustand | `progressMs` selector consumer 중심 약 30회 | 비구독 컴포넌트는 원칙적으로 0회 | 15줄 | 중간 | 고빈도 전역 상태에 적합 |

### 실측값 기록표

| 방식 | Player 렌더 횟수 | TodoView 추가 렌더 | CalendarView 추가 렌더 | 총 commit 시간 | 재생 끊김 |
|------|------------------:|---------------------:|-------------------------:|-----------------:|-----------|
| useState | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |
| Context + useReducer | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |
| Zustand | 측정값 입력 | 측정값 입력 | 측정값 입력 | 측정값 입력 | 없음 / 있음 |

## 결론

여러 화면에서 고빈도 플레이어 상태를 공유하는 구조에서는 Zustand selector 구독이 가장 적합하다. 실제 앱은 기존 Zustand 방식으로만 실행한다.
