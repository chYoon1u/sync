# Task Log — [TASK-001] 투두리스트 기능 구현

**날짜:** 2026-05-11  
**상태:** `완료`

## 작업 목표

투두 추가 / 수정 / 삭제 / 완료 체크, 우선순위, 카테고리 필터, 마감일, localStorage 자동 저장 구현.

## 구현 내역

### 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/types/todo.ts` | 수정 | `FilterStatus` 타입 추가 |
| `src/store/useTodoStore.ts` | 수정 | `filter` 상태 + `setFilter` 액션 추가, `unshift`로 최신 항목 상단 배치 |
| `src/components/todo/TodoInput.tsx` | 신규 | 할 일 추가 폼 (제목 + 우선순위 + 마감일) |
| `src/components/todo/TodoItem.tsx` | 신규 | 개별 항목 (체크/수정/삭제, 인라인 편집) |
| `src/components/todo/TodoFilter.tsx` | 신규 | 전체/진행중/완료 필터 탭 + 카운트 뱃지 |
| `src/components/todo/TodoList.tsx` | 신규 | 필터링 + 정렬된 목록 렌더링 |
| `src/components/todo/TodoView.tsx` | 신규 | 투두 섹션 최상위 컨테이너 |
| `src/App.tsx` | 수정 | TodoView 연결 |

### 주요 결정 사항

- 정렬: 미완료 → 완료 순, 같은 상태 내에서 우선순위(높음→중간→낮음) 순
- `filter` 상태는 persist에서 제외 (`partialize`) — 새로고침 시 항상 '전체'로 시작
- 마감일이 오늘 이전이고 미완료인 경우 빨간색으로 강조
- 편집 모드: 인라인 방식, Enter 저장 / Escape 취소

## 테스트 결과

| 구분 | 항목 | 결과 |
|------|------|------|
| 유닛 | useTodoStore (7개) | ✅ |
| 컴포넌트 | TodoItem (6개) | ✅ |
| E2E | todo.spec.ts | 🔜 (test.fixme, 활성화 대기) |

**전체: 31 passed / 10 todo**
