# Task Log — [TASK-015] 투두 루틴·기간·이월

**날짜:** 2026-06-22  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> 반복 투두 템플릿, 기간별 투두 생성, 마감 후 다음 날 이월 및 투두 요약 UI를 구현한다.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/types/todo.ts` | 수정 | 루틴 및 기간 식별자 타입 추가 |
| `src/utils/todo.ts` | 신규 | 로컬 날짜, 날짜 범위, 이월 가능 여부 계산 |
| `src/store/useTodoStore.ts` | 수정 | 루틴 생성·동기화, 기간 생성, 다음 날 이월 구현 |
| `src/components/todo/RoutinePanel.tsx` | 신규 | 날짜/요일 기반 루틴 템플릿 UI |
| `src/components/todo/TodoInput.tsx` | 수정 | 기간 종료일 및 동일 너비 날짜/시간 입력 |
| `src/components/todo/TodoItem.tsx` | 수정 | 기한 경과 시 다음 날 이월 버튼 표시 |
| `src/components/todo/TodoFilter.tsx` | 수정 | 완료/전체 카운트와 연한 탭 배경 |
| `src/components/todo/TodoView.tsx` | 수정 | 상단 남은 개수 제거 및 루틴 동기화 |
| `tests/unit`, `tests/component` | 수정 / 신규 | 신규 상태 로직과 UI 테스트 |

### 주요 결정 사항

- 요일 루틴은 오늘부터 90일 범위를 미리 생성하며 루틴 ID와 날짜로 중복을 방지한다.
- 사용자가 삭제한 루틴 발생 항목은 예외 목록에 기록해 자동 동기화 시 복원하지 않는다.
- 시간이 없는 투두는 지정 날짜 다음 날 00:00, 시간이 있으면 지정 시각을 이월 기준으로 사용한다.
- 기간 투두는 시작일과 종료일을 모두 포함해 날짜별 독립 항목으로 생성한다.

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛 | Todo store 및 날짜/이월 유틸 | ✅ |
| 컴포넌트 | TodoItem, TodoFilter, TodoDetailModal | ✅ |
| 빌드/린트 | TypeScript + Vite, ESLint | ✅ |

## 이슈 / 메모

- 전체 테스트 중 Player 접근성 이름 기대값이 실제 UI 문구와 달라 기존 테스트 2건이 실패한다.
