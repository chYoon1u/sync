# 기능 명세서 — Sync 생산성 플랫폼

## 1. 투두리스트

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|---------|
| T-01 | 투두 추가 | 제목, 우선순위(low/medium/high), 마감일 입력 | High |
| T-02 | 완료 토글 | 체크박스로 완료 상태 전환 | High |
| T-03 | 투두 삭제 | 개별 삭제 | High |
| T-04 | 투두 수정 | 인라인 편집 | Medium |
| T-05 | 필터링 | 전체/미완료/완료/우선순위별 | Medium |
| T-06 | 데이터 영속 | localStorage persist | High |

## 2. 캘린더

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|---------|
| C-01 | 월별 그리드 | 해당 월 날짜 표시 | High |
| C-02 | 오늘 하이라이트 | 오늘 날짜 강조 | High |
| C-03 | 이벤트 추가 | 날짜 클릭 → 제목/시간 입력 | High |
| C-04 | 이벤트 삭제 | 이벤트 클릭 → 삭제 | High |
| C-05 | 월 이동 | 이전/다음 월 네비게이션 | High |
| C-06 | 데이터 영속 | localStorage persist | High |

## 3. Spotify 음악 플레이어

> **전제**: Spotify Premium 계정 필요. PKCE OAuth 인증(백엔드 불필요).

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|---------|
| P-01 | Spotify 로그인 | PKCE OAuth → 액세스/리프레시 토큰 저장 | High |
| P-02 | 트랙 검색 | 제목/아티스트 검색 → 결과 20개 표시 | High |
| P-03 | 바로 재생 | 검색 결과에서 즉시 재생 | High |
| P-04 | 플레이리스트 추가 | 검색 결과 → 플레이리스트 추가 (중복 방지) | High |
| P-05 | 재생/일시정지 | Web Playback SDK togglePlay | High |
| P-06 | 다음/이전 트랙 | 순환 재생, 3초 이내 이전은 seek(0) | High |
| P-07 | 볼륨 조절 | 슬라이더 0~100, 음소거 토글 | High |
| P-08 | 진행 바 | 재생 위치 표시 + 클릭/드래그로 seek | High |
| P-09 | 반복 재생 | track 반복 모드 (Spotify API) | Medium |
| P-10 | 셔플 | 랜덤 순서 (Spotify API) | Medium |
| P-11 | 현재 재생곡 표시 | PlayerBar에 앨범아트 + 제목 + 아티스트 | High |
| P-12 | 플레이리스트 관리 | 트랙 삭제, 전체 삭제 | Medium |
| P-13 | 데이터 영속 | 플레이리스트 localStorage persist | High |
| P-14 | 전역 상태 유지 | PlayerBar가 App 루트에 마운트 → 탭 이동 시 재생 유지 | High |
| P-15 | 토큰 자동 갱신 | 만료 5분 전 refresh_token으로 자동 갱신 | High |
