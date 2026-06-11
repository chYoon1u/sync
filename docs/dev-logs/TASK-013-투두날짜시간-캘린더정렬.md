# Task Log — [TASK-013] 투두 날짜·시간 및 캘린더 정렬

**날짜:** 2026-06-12  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> 투두 날짜와 시간 입력을 같은 가로줄에 유지하고, 캘린더 날짜와 요일 헤더 정렬을 수정한다.

## 구현 내역

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/components/todo/TodoInput.tsx` | 수정 | 날짜·시간 입력을 별도 가로 그룹으로 분리 |
| `src/components/calendar/CalendarDay.tsx` | 수정 | 날짜를 셀 상단에 고정 |
| `src/components/calendar/CalendarGrid.tsx` | 수정 | 요일 헤더와 날짜 셀에 동일한 열 간격 적용 |

## 주요 결정 사항

- 날짜와 시간은 `flex-nowrap` 성격의 단일 행으로 유지한다.
- 캘린더 셀은 세로 flex와 `justify-start`를 사용해 Todo 유무와 관계없이 날짜를 상단에 배치한다.
- 요일 헤더에도 날짜 그리드와 동일한 `gap-1`을 적용해 각 열 중심을 일치시킨다.
