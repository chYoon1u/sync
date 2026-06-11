# Task Log — [TASK-002] 캘린더 기능 구현

**날짜:** 2026-05-11  
**상태:** `완료`

## 작업 목표

월별 달력 렌더링, 이전/다음 달 이동, 오늘 하이라이트, 날짜 클릭 시 투두 표시, 투두 dot 표시 구현.  
외부 라이브러리 없이 Date 객체만 사용.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/utils/date.ts` | 수정 | `buildCalendarGrid`, `formatYearMonth` 추가 |
| `src/components/calendar/CalendarHeader.tsx` | 신규 | 년/월 표시 + 이전/다음/오늘 버튼 |
| `src/components/calendar/CalendarDay.tsx` | 신규 | 날짜 셀 (선택/오늘 하이라이트 + 우선순위 dot) |
| `src/components/calendar/CalendarGrid.tsx` | 수정 | 7×6 그리드, 투두 dotMap 계산 |
| `src/components/calendar/DayDetail.tsx` | 신규 | 선택 날짜의 투두 목록 + 빠른 추가 |
| `src/components/calendar/CalendarView.tsx` | 수정 | 통합 컨테이너 |
| `src/App.tsx` | 수정 | 투두 + 캘린더 2열 레이아웃 |

### 주요 결정 사항

- 그리드는 항상 42칸(6주) 고정 — 레이아웃 안정성
- `data-testid`는 `calendar-day-{dateStr}` 형식 — 이전/다음 달 1일 중복 방지
- 투두 dot: 우선순위별 색상(빨/주황/파랑), 선택된 셀에서는 흰색으로 통일
- 이전/다음 달 셀은 `opacity-25` + 클릭 불가
- `viewDate`(달력 표시 월)와 `selectedDate`(선택 날짜)를 분리 — 다른 달 이동 중에도 선택 유지

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛 | buildCalendarGrid (5개), date utils | ✅ |
| 컴포넌트 | CalendarGrid (4개) | ✅ |
| E2E | calendar.spec.ts | 🔜 (test.fixme) |

**전체: 40 passed / 5 todo**
