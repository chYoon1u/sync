import { useTodoStore } from '@/store/useTodoStore'
import type { Todo, Priority } from '@/types/todo'

interface Props {
  todo: Todo
  onOpen: (todo: Todo) => void
  onDragStart: (id: string) => void
  onDrop: (id: string) => void
}

const PRIORITY_BADGE: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
}

export function TodoItem({ todo, onOpen, onDragStart, onDrop }: Props) {
  const { toggleTodo, deleteTodo } = useTodoStore()

  return (
    <li
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(todo.id)}
      className={`group flex min-w-0 items-start gap-2 rounded-xl border p-3 transition ${
        todo.completed
          ? 'border-zinc-100 bg-zinc-50 opacity-60 dark:border-zinc-700/50 dark:bg-zinc-800/50'
          : 'border-zinc-100 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800'
      }`}
    >
      <span className="mt-1 cursor-grab text-zinc-300 active:cursor-grabbing dark:text-zinc-600" aria-hidden="true">
        <svg className="h-4 w-3" viewBox="0 0 12 18" fill="currentColor">
          <circle cx="3" cy="3" r="1.2" /><circle cx="9" cy="3" r="1.2" />
          <circle cx="3" cy="9" r="1.2" /><circle cx="9" cy="9" r="1.2" />
          <circle cx="3" cy="15" r="1.2" /><circle cx="9" cy="15" r="1.2" />
        </svg>
      </span>

      <button
        onClick={() => toggleTodo(todo.id)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? 'accent-bg accent-border'
            : 'border-zinc-300 dark:border-zinc-500'
        }`}
        aria-label={todo.completed ? '완료 취소' : '완료로 표시'}
      >
        {todo.completed && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        )}
      </button>

      <button onClick={() => onOpen(todo)} className="min-w-0 flex-1 text-left">
        <p className={`break-words text-sm leading-snug ${todo.completed ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
          {todo.title}
        </p>
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[todo.priority]}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          {todo.dueDate && <span className="truncate text-[10px] text-zinc-400">{formatDueDate(todo.dueDate)}</span>}
          {todo.memo && <span className="truncate text-[10px] text-zinc-400">메모 있음</span>}
        </div>
      </button>

      {todo.dueTime && (
        <time className="shrink-0 pt-0.5 text-[11px] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
          {todo.dueTime}
        </time>
      )}

      <button
        onClick={() => deleteTodo(todo.id)}
        className="shrink-0 rounded-lg p-1 text-zinc-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 dark:text-zinc-600 dark:hover:bg-red-900/30"
        aria-label="삭제"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}

function formatDueDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
