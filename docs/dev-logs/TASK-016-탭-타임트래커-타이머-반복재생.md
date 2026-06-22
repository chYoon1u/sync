# Task Log — [TASK-016] 탭·타임 트래커·타이머·반복 재생

**날짜:** 2026-06-22  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> 상단 탭별 화면 전환, 홈 타임 트래커, 알림/루틴 타이머와 Spotify 반복 재생 개선을 구현한다.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/store/usePlayerStore.ts` | 수정 | 반복 모드 3단계와 진행률 범위 제한 |
| `src/hooks/useSpotifyPlayer.ts` | 수정 | SDK 연결 시 반복·셔플 상태 재적용 |
| `src/components/player/PlayerBar.tsx` | 수정 | 반복 상태 표시 및 진행률 UI 오버플로 방지 |
| `src/store/useUIStore.ts` | 수정 | 활성 탭 상태 저장 |
| `src/App.tsx` | 수정 | 탭별 단일 화면과 작은 다크 모드 토글 |
| `src/store/useTimeTrackerStore.ts` | 신규 | 10분 단위 계획 블록과 목표 저장 |
| `src/components/tracker/TimeTrackerView.tsx` | 신규 | Daily/Weekly 타임라인 플래너 |
| `src/store/useTimerStore.ts` | 신규 | 타이머와 다단계 반복 루틴 상태 |
| `src/components/timer/TimerView.tsx` | 신규 | 알림 시계, 뽀모도로, 예약 루틴 UI |

### 주요 결정 사항

- 반복 버튼은 `꺼짐 → 목록 반복 → 한 곡 반복 → 꺼짐` 순서로 전환한다.
- SDK 연결 시 저장된 반복·셔플 설정을 Spotify 장치에 다시 적용한다.
- 재생 진행 시간과 표시 너비는 duration을 초과하지 않도록 제한한다.
- Schedule 화면은 오전 4시부터 다음 날 오전 4시까지 10분 단위 계획을 제공한다.
- 첫 클릭은 시작 시각, 두 번째 클릭은 종료 시각으로 사용하고 목표명을 입력해 블록을 저장한다.
- Daily에는 목표 체크리스트와 메모 그리드를 함께 표시하고 Weekly에는 7일 열을 표시한다.
- 축소 상태에서는 Daily만 표시한다.
- 타이머 실행 상태는 종료 시각을 저장해 렌더링 지연이나 앱 일시 중단의 영향을 줄인다.
- 타이머 루틴은 여러 분 단위 단계를 저장하고 마지막 단계 이후 선택적으로 반복한다.
- 알림 권한은 사용자가 타이머를 직접 시작할 때 요청한다.

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛 | Player, Timer, TimeTracker store | ✅ |
| 컴포넌트 | PlayerBar 진행률 | ✅ |
| UI | 탭 단독 표시, 축소형 Daily 구성 | ✅ |
| 빌드/린트 | TypeScript + Vite, ESLint | ✅ |
