import { useEffect, useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import type { Todo, Priority } from '@/types/todo'

interface Props {
  todo: Todo
  onClose: () => void
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '중간' },
  { value: 'low', label: '낮음' },
]

export function TodoDetailModal({ todo, onClose }: Props) {
  const updateTodo = useTodoStore((state) => state.updateTodo)
  const [title, setTitle] = useState(todo.title)
  const [memo, setMemo] = useState(todo.memo ?? '')
  const [priority, setPriority] = useState(todo.priority)
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '')
  const [dueTime, setDueTime] = useState(todo.dueTime ?? '')

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const save = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    updateTodo(todo.id, {
      title: trimmed,
      memo: memo.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="todo-detail-title" className="w-[520px] max-w-full rounded-3xl border border-white/60 bg-white p-6 text-left shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 id="todo-detail-title" className="truncate text-lg font-semibold text-zinc-900 dark:text-white">투두 상세</h3>
          <button onClick={onClose} aria-label="상세 창 닫기" className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <label className="block text-xs font-semibold text-zinc-500">
          이름
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="accent-focus mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100" />
        </label>

        <label className="mt-4 block text-xs font-semibold text-zinc-500">
          메모
          <textarea value={memo} onChange={(event) => setMemo(event.target.value)} rows={7} placeholder="세부 내용이나 기억할 내용을 적어두세요" className="accent-focus mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm leading-relaxed text-zinc-800 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100" />
        </label>

        <div className="mt-4 grid grid-cols-[1fr_150px_110px] gap-3">
          <div className="min-w-0">
            <p className="mb-1.5 text-xs font-semibold text-zinc-500">우선순위</p>
            <div className="flex gap-1.5">
              {PRIORITIES.map((item) => (
                <button key={item.value} type="button" onClick={() => setPriority(item.value)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium ${priority === item.value ? 'accent-bg text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <label className="min-w-0 text-xs font-semibold text-zinc-500">
            날짜
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300" />
          </label>
          <label className="min-w-0 text-xs font-semibold text-zinc-500">
            완료 시간
            <input type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl bg-zinc-100 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300">취소</button>
          <button onClick={save} disabled={!title.trim()} className="accent-bg accent-bg-hover rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">저장</button>
        </div>
      </section>
    </div>
  )
}
