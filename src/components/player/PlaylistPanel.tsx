import { useState } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'

function msToTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function PlaylistPanel() {
  const {
    playlist,
    savedPlaylists,
    currentIndex,
    playerState,
    playAt,
    removeTrack,
    clearPlaylist,
    reorderQueue,
    createSavedPlaylist,
    renameSavedPlaylist,
    deleteSavedPlaylist,
    loadSavedPlaylist,
    reorderSavedPlaylist,
    reorderSavedPlaylistTrack,
  } = usePlayerStore()
  const [tab, setTab] = useState<'queue' | 'saved'>('queue')
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const selectedPlaylist =
    savedPlaylists.find((item) => item.id === selectedPlaylistId) ?? null

  const saveCurrentQueue = () => {
    if (createSavedPlaylist(newPlaylistName)) {
      setNewPlaylistName('')
      setTab('saved')
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-2 rounded-lg bg-zinc-100 p-1 text-xs dark:bg-zinc-900">
        <button
          onClick={() => setTab('queue')}
          className={`rounded-md px-2 py-1.5 transition ${
            tab === 'queue' ? 'bg-white font-medium shadow-sm dark:bg-zinc-700' : 'text-zinc-400'
          }`}
        >
          현재 재생 목록
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`rounded-md px-2 py-1.5 transition ${
            tab === 'saved' ? 'bg-white font-medium shadow-sm dark:bg-zinc-700' : 'text-zinc-400'
          }`}
        >
          저장 플레이리스트
        </button>
      </div>

      {tab === 'queue' ? (
        <>
          <div className="flex gap-1.5">
            <input
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveCurrentQueue()
              }}
              placeholder="플레이리스트 이름"
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none dark:border-zinc-600 dark:bg-zinc-900"
            />
            <button
              onClick={saveCurrentQueue}
              disabled={!newPlaylistName.trim() || playlist.length === 0}
              className="accent-bg rounded-lg px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              저장
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">{playlist.length}곡 · 드래그로 순서 변경</p>
            {playlist.length > 0 && (
              <button
                onClick={clearPlaylist}
                className="text-xs text-zinc-400 hover:text-red-500"
              >
                전체 삭제
              </button>
            )}
          </div>

          {playlist.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-xs text-zinc-400">
              현재 재생 목록이 비어 있습니다
            </div>
          ) : (
            <ul className="scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto">
              {playlist.map((track, index) => {
                const isCurrent = index === currentIndex
                const isPlaying = isCurrent && playerState === 'playing'

                return (
                  <li
                    key={track.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null) reorderQueue(dragIndex, index)
                      setDragIndex(null)
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    onClick={() => void playAt(index)}
                    className={`group flex cursor-grab items-center gap-2 rounded-lg p-2 transition active:cursor-grabbing ${
                      isCurrent ? 'accent-soft border' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                    }`}
                  >
                    <span className={`w-4 text-center text-xs ${isCurrent ? 'accent-text' : 'text-zinc-400'}`}>
                      {isPlaying ? '▶' : index + 1}
                    </span>
                    <img
                      src={track.albumArt}
                      alt={track.albumName}
                      className="h-8 w-8 rounded-md bg-zinc-200 object-cover dark:bg-zinc-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{track.title}</p>
                      <p className="truncate text-[10px] text-zinc-400">{track.artist}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400">{msToTime(track.durationMs)}</span>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        removeTrack(track.id)
                      }}
                      className="text-zinc-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                      aria-label={`${track.title} 제거`}
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : selectedPlaylist ? (
        <>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setSelectedPlaylistId(null)
                setEditingName('')
              }}
              className="rounded-lg border border-zinc-200 px-2 text-xs dark:border-zinc-600"
            >
              ←
            </button>
            <input
              value={editingName || selectedPlaylist.name}
              onChange={(event) => setEditingName(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none dark:border-zinc-600 dark:bg-zinc-900"
            />
            <button
              onClick={() => {
                renameSavedPlaylist(selectedPlaylist.id, editingName || selectedPlaylist.name)
                setEditingName('')
              }}
              className="rounded-lg border border-zinc-200 px-2 text-xs dark:border-zinc-600"
            >
              이름 저장
            </button>
          </div>
          <button
            onClick={() => {
              loadSavedPlaylist(selectedPlaylist.id)
              setTab('queue')
            }}
            className="accent-bg rounded-lg py-1.5 text-xs font-medium text-white"
          >
            현재 재생 목록으로 불러오기
          </button>
          <p className="text-xs text-zinc-400">
            {selectedPlaylist.tracks.length}곡 · 드래그로 순서 변경
          </p>
          <ul className="scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto">
            {selectedPlaylist.tracks.map((track, index) => (
              <li
                key={track.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) {
                    reorderSavedPlaylistTrack(selectedPlaylist.id, dragIndex, index)
                  }
                  setDragIndex(null)
                }}
                onDragEnd={() => setDragIndex(null)}
                className="flex cursor-grab items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 active:cursor-grabbing dark:hover:bg-zinc-700/50"
              >
                <span className="w-4 text-center text-xs text-zinc-400">{index + 1}</span>
                <img
                  src={track.albumArt}
                  alt={track.albumName}
                  className="h-8 w-8 rounded-md bg-zinc-200 object-cover dark:bg-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{track.title}</p>
                  <p className="truncate text-[10px] text-zinc-400">{track.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="text-xs text-zinc-400">
            {savedPlaylists.length}개 · 드래그로 순서 변경
          </p>
          {savedPlaylists.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-xs text-zinc-400">
              현재 재생 목록에 곡을 넣고<br />이름을 지정해 저장하세요
            </div>
          ) : (
            <ul className="scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto">
              {savedPlaylists.map((savedPlaylist, index) => (
                <li
                  key={savedPlaylist.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) reorderSavedPlaylist(dragIndex, index)
                    setDragIndex(null)
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className="group flex cursor-grab items-center gap-2 rounded-lg border border-zinc-100 p-2.5 active:cursor-grabbing dark:border-zinc-700"
                >
                  <button
                    onClick={() => {
                      setSelectedPlaylistId(savedPlaylist.id)
                      setEditingName('')
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{savedPlaylist.name}</p>
                    <p className="text-[10px] text-zinc-400">{savedPlaylist.tracks.length}곡</p>
                  </button>
                  <button
                    onClick={() => {
                      loadSavedPlaylist(savedPlaylist.id)
                      setTab('queue')
                    }}
                    className="rounded-md border border-zinc-200 px-2 py-1 text-[10px] dark:border-zinc-600"
                  >
                    불러오기
                  </button>
                  <button
                    onClick={() => deleteSavedPlaylist(savedPlaylist.id)}
                    className="text-zinc-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
                    aria-label={`${savedPlaylist.name} 삭제`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
