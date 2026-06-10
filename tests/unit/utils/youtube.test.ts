import { describe, it, expect } from 'vitest'
import { extractVideoId, getThumbnailUrl } from '@/utils/youtube'

describe('youtube utils', () => {
  it('extractVideoId — watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extractVideoId — short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extractVideoId — embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extractVideoId — 유효하지 않은 URL', () => {
    expect(extractVideoId('https://example.com')).toBeNull()
  })

  it('getThumbnailUrl', () => {
    expect(getThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
    )
  })
})
