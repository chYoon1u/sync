import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'

const sampleTrack = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up',
  thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
}

beforeEach(() => {
  usePlayerStore.setState({
    playlist: [],
    currentIndex: 0,
    playerState: 'stopped',
    volume: 70,
    isRepeat: false,
    isShuffle: false,
  })
})

describe('usePlayerStore', () => {
  it('트랙 추가', () => {
    act(() => usePlayerStore.getState().addTrack(sampleTrack))
    expect(usePlayerStore.getState().playlist).toHaveLength(1)
  })

  it('트랙 삭제', () => {
    act(() => usePlayerStore.getState().addTrack(sampleTrack))
    const id = usePlayerStore.getState().playlist[0].id
    act(() => usePlayerStore.getState().removeTrack(id))
    expect(usePlayerStore.getState().playlist).toHaveLength(0)
  })

  it('다음 트랙 (순환)', () => {
    act(() => {
      usePlayerStore.getState().addTrack(sampleTrack)
      usePlayerStore.getState().addTrack({ ...sampleTrack, title: 'Track 2' })
    })
    act(() => usePlayerStore.getState().playNext())
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    act(() => usePlayerStore.getState().playNext())
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('볼륨 설정', () => {
    act(() => usePlayerStore.getState().setVolume(50))
    expect(usePlayerStore.getState().volume).toBe(50)
  })

  it('반복/셔플 토글', () => {
    act(() => usePlayerStore.getState().toggleRepeat())
    expect(usePlayerStore.getState().isRepeat).toBe(true)
    act(() => usePlayerStore.getState().toggleShuffle())
    expect(usePlayerStore.getState().isShuffle).toBe(true)
  })
})
