import { useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import type { Todo, Priority } from '@/types/todo'

interface Props {
  todo: Todo
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

const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low']

export function TodoItem({ todo }: Props) {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? '')

  const commitEdit = () => {
    const trimmed = editTitle.trim()
    if (!trimmed) return
    updateTodo(todo.id, { title: trimmed, priority: editPriority, dueDate: editDueDate || undefined })
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditTitle(todo.title)
    setEditPriority(todo.priority)
    setEditDueDate(todo.dueDate ?? '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <li className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
      todo.completed
        ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700/50 opacity-60'
        : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:border-violet-200 dark:hover:border-violet-700/50'
    }`}>
      {/* 체크박스 */}
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? 'bg-violet-500 border-violet-500'
            : 'border-zinc-300 dark:border-zinc-500 hover:border-violet-400'
        }`}
        aria-label={todo.completed ? '완료 취소' : '완료로 표시'}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-violet-300 dark:border-violet-600 rounded-lg px-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                      editPriority === p
                        ? PRIORITY_BADGE[p]
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="ml-auto bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 rounded-lg px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={commitEdit} className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded-lg transition">
                저장
              </button>
              <button onClick={cancelEdit} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs rounded-lg transition">
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className={`text-sm leading-snug break-words ${todo.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
              {todo.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_BADGE[todo.priority]}`}>
                {PRIORITY_LABEL[todo.priority]}
              </span>
              {todo.dueDate && (
                <span className={`text-xs ${isDueDatePast(todo.dueDate) && !todo.completed ? 'text-red-500 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {formatDueDate(todo.dueDate)}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition"
            aria-label="수정"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            aria-label="삭제"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </li>
  )
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function isDueDatePast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}
