export function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    const w = window as Window & { YT?: unknown; onYouTubeIframeAPIReady?: () => void }
    if (w.YT) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
    w.onYouTubeIframeAPIReady = () => resolve()
  })
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}
