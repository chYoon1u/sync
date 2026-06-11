import { useMemo, useState } from 'react'
import { useTodoStore } from '@/store/useTodoStore'
import { TodoItem } from './TodoItem'
import { TodoDetailModal } from './TodoDetailModal'
import type { Todo } from '@/types/todo'

function localDateKey(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function TodoList() {
  const { todos, filter, reorderTodo } = useTodoStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'today') {
      const today = localDateKey()
      return todos.filter((todo) => todo.dueDate === today)
    }
    return todos
  }, [todos, filter])

  const handleDrop = (targetId: string) => {
    if (draggedId) reorderTodo(draggedId, targetId)
    setDraggedId(null)
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-zinc-400 dark:text-zinc-500">
        <svg className="mb-3 h-11 w-11 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
        <p className="text-sm">{filter === 'today' ? '오늘 등록된 할 일이 없습니다' : '할 일이 없습니다'}</p>
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2">
        {filtered.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onOpen={setSelectedTodo}
            onDragStart={setDraggedId}
            onDrop={handleDrop}
          />
        ))}
      </ul>
      {selectedTodo && (
        <TodoDetailModal
          todo={todos.find((todo) => todo.id === selectedTodo.id) ?? selectedTodo}
          onClose={() => setSelectedTodo(null)}
        />
      )}
    </>
  )
}
