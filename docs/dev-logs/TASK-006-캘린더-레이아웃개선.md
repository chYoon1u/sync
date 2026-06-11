# Task Log — [TASK-006] 캘린더 레이아웃 개선

**날짜:** 2026-06-11  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> 캘린더를 투두리스트 우측의 넓은 구글 캘린더형 보드로 배치하고, 날짜별 투두 정보와 접기 기능 및 과거 날짜 표현을 개선한다.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/App.tsx` | 수정 | 투두-캘린더-플레이어 열 순서 유지, 캘린더 가변 확장 및 접힘 열 적용 |
| `src/store/useCalendarStore.ts` | 수정 | 캘린더 접기 상태와 액션 추가 |
| `src/components/calendar/CalendarHeader.tsx` | 수정 | 년/월 중앙 배치, 오늘 버튼 제거, 접기 버튼 추가 |
| `src/components/calendar/CalendarGrid.tsx` | 수정 | 가로형 7열 6주 일정 보드 레이아웃 |
| `src/components/calendar/CalendarDay.tsx` | 수정 | 우선순위 점, 투두 제목 6글자, 과거 날짜 회색 처리 |
| `src/components/calendar/CalendarView.tsx` | 수정 | 접기/펼치기와 날짜 상세 팝오버 |
| `tests/component/calendar/CalendarGrid.test.tsx` | 수정 | 일정 제목, 우선순위 점, 과거 날짜 테스트 |
| `docs/report/specs/feature-spec.md` | 수정 | C-01, C-02, C-07 명세 반영 |

### 주요 결정 사항

- 기본 열은 투두 340px, 플레이어 300px로 두고 남은 너비를 캘린더가 사용한다.
- 날짜 셀에는 최대 3개의 투두를 표시하고 초과 항목은 개수로 요약한다.
- 투두 제목은 한 줄에 최대 6글자만 표시하며 전체 이름은 툴팁으로 확인한다.
- 기존 날짜별 빠른 추가와 완료 기능은 우측 하단 팝오버로 유지한다.

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛·컴포넌트 | 전체 테스트 | 50개 전체 통과 |
| 빌드 | TypeScript + Vite | 통과 |
| 정적 분석 | ESLint | 통과 |

## 스크린샷

> 해당 없음

## 이슈 / 메모

- 캘린더 접기 상태는 Zustand persist로 저장된다.
- 검증 중 일시적인 파일 동기화 지연이 있었으나 정상화 후 전체 빌드와 테스트를 다시 통과했다.
