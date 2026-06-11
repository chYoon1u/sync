import type { SpotifyTrack, SpotifySearchResponse } from '@/types/spotify'

const BASE = 'https://api.spotify.com/v1'

async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 401) throw new Error('SPOTIFY_UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

/** 트랙 검색 */
export async function searchTracks(
  query: string,
  token: string,
  signal?: AbortSignal
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({ q: query, type: 'track', limit: '10', market: 'KR' })
  const data = await apiFetch<SpotifySearchResponse>(`/search?${params}`, token, { signal })
  return data.tracks.items
}

/** 특정 디바이스에서 트랙 재생 */
export async function playTracks(
  deviceId: string,
  uris: string[],
  token: string,
  offsetPosition = 0,
  positionMs = 0
): Promise<void> {
  await apiFetch(`/me/player/play?device_id=${deviceId}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      uris,
      offset: { position: offsetPosition },
      position_ms: Math.max(0, positionMs),
    }),
  })
}

/** 재생 장치 전환 (SDK 디바이스로 이전) */
export async function transferPlayback(deviceId: string, token: string): Promise<void> {
  await apiFetch('/me/player', token, {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  })
}

/** 반복 모드 설정 */
export async function setRepeatMode(
  state: 'track' | 'context' | 'off',
  token: string
): Promise<void> {
  await apiFetch(`/me/player/repeat?state=${state}`, token, { method: 'PUT' })
}

/** 셔플 설정 */
export async function setShuffleMode(shuffle: boolean, token: string): Promise<void> {
  await apiFetch(`/me/player/shuffle?state=${shuffle}`, token, { method: 'PUT' })
}

/** 볼륨 설정 (0~100) */
export async function setVolume(volumePercent: number, token: string): Promise<void> {
  await apiFetch(`/me/player/volume?volume_percent=${Math.round(volumePercent)}`, token, {
    method: 'PUT',
  })
}
