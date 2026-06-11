# Task Log — [TASK-011] Spotify SDK Lazy Loading 및 Lighthouse 비교

**날짜:** 2026-06-09  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> 로그인 직후 즉시 연결하던 Spotify Web Playback SDK를 음악 기능 최초 사용 시점에 로드하고, 적용 전후 초기 성능을 Lighthouse로 비교한다.

실제 프로젝트는 `package.json` 기준 React 19를 사용한다.

## 적용 전후 코드

### 적용 전: 인증 직후 즉시 초기화

```tsx
function PlayerSDKMount() {
  useSpotifyPlayer()
  return null
}

useEffect(() => {
  if (!isAuthenticated) return
  void init()
}, [isAuthenticated])
```

로그인 토큰이 저장된 사용자는 앱 시작 시 음악 기능을 사용하지 않아도 SDK 스크립트 다운로드, Player 생성, Connect 장치 등록이 시작된다.

### 적용 후: 사용자 최초 상호작용 시 초기화

```tsx
function PlayerSDKMount() {
  const requested = useUIStore((state) => state.isSpotifySDKRequested)
  useSpotifyPlayer(requested)
  return null
}

export function useSpotifyPlayer(enabled = true) {
  useEffect(() => {
    if (!isAuthenticated || !enabled) return
    void init()
  }, [enabled, isAuthenticated])
}
```

PlayerBar 중앙 재생 버튼 클릭만 최초 로드 트리거다. 음악 패널 열기와
PlayerBar 마우스 호버/키보드 포커스는 SDK를 요청하거나 음악을 재생하지 않는다.

```tsx
const handleTogglePlay = () => {
  if (_sdkPlayer) {
    void togglePlay()
    return
  }

  requestSpotifySDK()
}

<button onClick={handleTogglePlay} aria-label="재생">
  재생
</button>
```

`isSpotifySDKRequested`는 런타임 상태이며 localStorage에는 저장하지 않는다.
첫 재생 클릭에서 SDK가 아직 없다면 SDK를 로드하고, `ready` 이벤트 이후 현재
선택 곡을 재생한다. 이후 클릭은 SDK의 기존 재생/일시정지 동작을 호출한다.

## 네트워크 확인

Chrome DevTools Network에서 캐시를 끄고 로그인 상태로 새로고침한다.

| 시점 | 기대 결과 |
|------|-----------|
| 초기 화면 로드 | `https://sdk.scdn.co/spotify-player.js` 요청 없음 |
| 음악 패널 열기 | SDK 요청 및 재생 없음 |
| PlayerBar 마우스 호버/포커스 | SDK 요청 및 재생 없음 |
| 재생 버튼 첫 클릭 | SDK 스크립트 요청 1회, 준비 후 현재 곡 재생 |
| 재생 버튼 반복 클릭 | 추가 SDK 요청 없이 재생/일시정지 |

## Electron 환경 Lighthouse 측정

Electron DevTools에는 Lighthouse 패널이 제공되지 않을 수 있으므로 Electron이 제공하는 프로덕션 렌더러 URL을 데스크톱 Chrome에서 측정한다.

### 프로덕션 렌더러 실행

```bash
npm run build
npm run electron:preview
```

Electron 메인 프로세스가 `dist`를 `http://127.0.0.1:5173`에서 제공한다.

### Chrome 측정 준비

1. Chrome에서 `http://127.0.0.1:5173`을 연다.
2. Spotify 로그인을 완료해 토큰이 저장된 상태로 만든다.
3. Network에서 `Disable cache`를 켠다.
4. Lighthouse Mode는 `Navigation`, Device는 `Desktop`으로 설정한다.
5. 로그인 상태 유지를 위해 `Clear storage`를 끈다.
6. 같은 PC, Chrome 프로필, 네트워크에서 측정한다.

로그아웃 상태에서는 적용 전 코드도 SDK를 로드하지 않으므로 차이를 비교할 수 없다.

### 적용 전후 측정

1. 적용 전 커밋에서 Performance를 5회 실행한다.
2. FCP, LCP, TBT, 전송 크기를 기록하고 중앙값을 구한다.
3. 적용 후 커밋에서 같은 조건으로 5회 실행한다.
4. 초기 화면 측정 중 재생 버튼을 누르지 않는다.
5. 측정 후 재생 버튼을 눌러 SDK 로드와 재생도 확인한다.

최신 Lighthouse에서는 TTI가 제거되었다. 요청된 TTI 열은 `지원 종료`로 표시하고 TBT를 함께 기록한다.

## 번들 크기 측정

```bash
npm run build
```

Spotify SDK는 외부 스크립트이므로 앱 JS 번들 크기는 거의 줄지 않는다. 핵심은 초기 전송 크기, 요청 수, TBT와 SDK 요청 유무다.

| 버전 | 원본 JS | gzip JS | 변화 |
|------|--------:|--------:|------|
| 적용 전 | 267.58 kB | 80.99 kB | 기준 |
| 적용 후 | 267.86 kB | 81.10 kB | 원본 +0.28 kB |

증가분은 Lazy Loading 요청 상태와 트리거 코드이며 외부 SDK 용량은 포함되지 않는다.

## 보고서용 비교 표

| 버전 | FCP | LCP | TTI | TBT | 앱 JS 번들 | 초기 전송 크기 | 초기 SDK 요청 |
|------|----:|----:|----:|----:|-------------:|---------------:|---------------|
| 적용 전 | 측정값 | 측정값 | 지원 종료 | 측정값 | 267.58 kB | 측정값 | 있음 |
| 적용 후 | 측정값 | 측정값 | 지원 종료 | 측정값 | 267.86 kB | 측정값 | 없음 |
| 변화율 | 계산값 | 계산값 | - | 계산값 | -0.10% | 계산값 | 1회 감소 |

```text
(적용 전 - 적용 후) / 적용 전 × 100
```

## 해석 기준

- FCP/LCP/TBT는 낮을수록 좋다.
- 앱 번들이 비슷해도 초기 제3자 스크립트 요청과 실행이 사라지면 효과가 있다.
- SDK 최초 사용 시 다운로드 및 연결 지연이 추가되므로 재생 버튼 클릭부터 SDK `ready`와 실제 재생 시작까지도 기록한다.
- 초기 로딩 성능과 최초 음악 실행 지연의 trade-off를 함께 보고한다.

## 참고 자료

- https://developer.chrome.com/docs/lighthouse/overview
- https://developer.chrome.com/docs/lighthouse/performance/first-contentful-paint
- https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint
- https://developer.chrome.com/docs/lighthouse/performance/interactive
