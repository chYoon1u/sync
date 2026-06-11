import { useTodoStore } from '@/store/useTodoStore'
import { TodoInput } from './TodoInput'
import { TodoFilter } from './TodoFilter'
import { TodoList } from './TodoList'

export function TodoView() {
  const { todos, filter, deleteTodo } = useTodoStore()
  const completedCount = todos.filter((t) => t.completed).length

  const clearCompleted = () => {
    todos.filter((t) => t.completed).forEach((t) => deleteTodo(t.id))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">투두리스트</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {todos.filter((t) => !t.completed).length}개 남음
          </p>
        </div>
        {filter === 'completed' && completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition"
          >
            완료 항목 삭제
          </button>
        )}
      </div>

      {/* 입력 폼 */}
      <TodoInput />

      {/* 필터 탭 */}
      <TodoFilter />

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <TodoList />
      </div>
    </div>
  )
}
