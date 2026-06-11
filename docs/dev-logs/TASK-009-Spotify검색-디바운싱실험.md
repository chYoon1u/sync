# Task Log — [TASK-009] Spotify 검색 디바운싱 실험

**날짜:** 2026-06-04  
**담당:** 조윤주  
**상태:** `완료`

## 작업 목표

> Spotify 곡 검색에 디바운싱을 적용하고, 미적용/300ms/500ms 조건의 API 호출 횟수와 체감 응답 시간을 비교한다.

## 실험 코드

### 1. 디바운싱 미적용

```tsx
useEffect(() => {
  const searchQuery = query.trim()
  if (searchQuery) void runSearch(searchQuery)
}, [query, runSearch])
```

입력값이 바뀔 때마다 effect가 실행되므로 입력 10회 기준 최대 10회의 API 요청이 발생한다.

### 2. 300ms 디바운싱

```tsx
const debouncedQuery = useDebounce(query, 300)

useEffect(() => {
  const searchQuery = debouncedQuery.trim()
  if (searchQuery) void runSearch(searchQuery)
}, [debouncedQuery, runSearch])
```

### 3. 500ms 디바운싱

```tsx
const debouncedQuery = useDebounce(query, 500)

useEffect(() => {
  const searchQuery = debouncedQuery.trim()
  if (searchQuery) void runSearch(searchQuery)
}, [debouncedQuery, runSearch])
```

### 4. 공통 훅

```tsx
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (delayMs === 0) return
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [delayMs, value])

  return delayMs === 0 ? value : debouncedValue
}
```

## 콘솔 측정 방법

1. 개발자 도구 Console에서 `Preserve log`를 켠다.
2. 미적용/300ms/500ms 코드를 각각 적용한 빌드에서 동일한 10글자를 동일한 속도로 입력한다.
3. 각 빌드 측정 전에 `console.clear()`를 실행한다.
4. `[Spotify Search][...ms] API calls`의 최종 카운트와 각 `response: ...ms` 로그를 기록한다.
5. Network 탭의 `/v1/search` 요청 수로 콘솔 카운트를 교차 확인한다.

응답 시간 로그는 디바운스 대기 시간을 제외한 실제 토큰 확인 및 REST 요청 시간을 측정한다. 사용자가 마지막 글자를 입력한 시점부터 결과가 표시되는 체감 시간은 `디바운스 시간 + 로그 응답 시간`이다.

실제 배포 앱은 사용자가 실험값을 변경할 수 없도록 `SEARCH_DEBOUNCE_MS = 300`으로 고정한다. 0ms와 500ms는 보고서 측정용 코드 버전에서만 사용한다.

## 비교 표

입력 간격이 디바운스 시간보다 짧은 연속 10회 입력을 기준으로 한다. `T_api`는 콘솔에서 측정한 실제 REST 응답 시간이다.

| 버전 | 입력 10회 기준 API 호출 | API 응답 시간 | 마지막 입력 후 체감 시간 | 평가 |
|------|------------------------:|--------------:|----------------------:|------|
| 미적용 (0ms) | 최대 10회 | 약 `T_api` | 약 `T_api` | 즉각 반응하지만 호출량과 경합이 큼 |
| 300ms | 1회 | 약 `T_api` | 약 `300ms + T_api` | 호출량과 반응성의 균형이 좋음 |
| 500ms | 1회 | 약 `T_api` | 약 `500ms + T_api` | 호출량은 같지만 체감 지연이 더 큼 |

실제 수치는 네트워크 상태와 Spotify 서버 응답에 따라 달라지므로 제출용 최종 표에는 동일 환경에서 3회 이상 측정한 평균값을 사용한다.

## 구현 내역

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/hooks/useDebounce.ts` | 신규 | 제네릭 디바운스 훅 |
| `src/components/player/SearchPanel.tsx` | 수정 | 300ms 고정 자동 검색, 콘솔 계측 |
| `src/services/spotify.ts` | 수정 | 검색 요청 `AbortSignal` 지원 |
| `tests/unit/hooks/useDebounce.test.tsx` | 신규 | 0ms/지연 동작 검증 |
| `tests/unit/services/spotify.test.ts` | 수정 | 취소 신호 전달 검증 |

## 주요 결정 사항

- 실제 앱은 호출 절감과 반응성의 균형이 좋은 300ms로 고정했다.
- 0ms와 500ms는 보고서 비교용 구현이며 사용자 선택 UI에는 노출하지 않는다.
- 새 검색이 시작되면 이전 요청을 취소해 늦게 도착한 응답이 최신 결과를 덮어쓰지 않게 했다.
- API 호출 횟수와 요청 시간을 동일한 콘솔 라벨로 출력해 조건별 비교가 가능하게 했다.
