# Sync — 다기능 통합 생산성 플랫폼

## 프로젝트 개요

투두리스트 + 캘린더 + Spotify 음악 플레이어를 통합한 데스크톱 앱.
프론트엔드 포트폴리오 및 대학 연구 보고서 제출용. 타겟: PC 웹 브라우저 / Electron 데스크톱.

## 기술 스택

- **Vite** + **React 19** + **TypeScript**
- **Electron** (데스크톱 빌드)
- **Tailwind CSS v4** (`@tailwindcss/vite` 플러그인)
- **Zustand v5** + **immer** (상태 관리 + persist 미들웨어)
- **Spotify Web API** + **Spotify Web Playback SDK** (음악 플레이어, Premium 필요)
- **localStorage** via Zustand persist

## 폴더 구조

```
src/
├── components/
│   ├── todo/        # TodoView, TodoInput, TodoItem, TodoFilter, TodoList
│   ├── calendar/    # CalendarView, CalendarHeader, CalendarGrid, CalendarDay, DayDetail
│   ├── player/      # PlayerView, PlayerBar, SearchPanel, PlaylistPanel
│   └── ui/          # 공통 UI 컴포넌트
├── hooks/
│   └── useSpotifyPlayer.ts   # SDK 초기화 + Zustand 동기화 (App 루트에서 1회 마운트)
├── services/
│   ├── spotifyAuth.ts        # PKCE 인증 흐름 (initiateLogin, exchangeCodeForToken, refresh)
│   └── spotify.ts            # Spotify API 호출 (search, play, volume, repeat, shuffle)
├── store/
│   ├── useAuthStore.ts       # Spotify 토큰 관리 (persist, 자동 갱신)
│   ├── useCalendarStore.ts   # 캘린더 이벤트 + 선택 날짜
│   ├── usePlayerStore.ts     # 플레이리스트 + SDK 브릿지 액션
│   └── useTodoStore.ts       # 투두 + 필터
├── types/
│   ├── calendar.ts
│   ├── player.ts             # PlaylistTrack, SpotifySDKPlayer, Window 타입 확장
│   ├── spotify.ts            # Spotify API/SDK 응답 타입
│   └── todo.ts
└── utils/
    └── date.ts               # buildCalendarGrid, formatYearMonth 등
electron/
├── main.cjs                  # Electron 메인 프로세스
└── preload.cjs
```

## 환경 변수 설정

`.env.local` 파일을 루트에 생성 (`.env.example` 참고):

```bash
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173
```

Spotify Developer Dashboard 설정:
1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) 에서 앱 생성
2. **Redirect URIs** 에 `http://localhost:5173` 추가
3. Client ID를 `.env.local`에 설정

## 개발 명령어

```bash
npm run dev              # Vite 개발 서버 (브라우저)
npm run electron:dev     # Electron 개발 모드 (앱)
npm run build            # 프로덕션 빌드
npm run electron:build   # Electron 배포 빌드 (.exe)
```

## 테스트

```bash
npm run test             # 유닛 + 컴포넌트 테스트 (1회)
npm run test:watch       # 감시 모드
npm run test:coverage    # 커버리지 리포트 → docs/report/coverage/
npm run test:e2e         # E2E (Playwright, 개발 서버 필요)
npm run test:e2e:ui      # Playwright UI 모드
npm run test:all         # 전체 테스트
```

### 테스트 파일 위치

```
tests/
├── setup.ts
├── unit/
│   ├── store/           # useTodoStore, useCalendarStore, usePlayerStore
│   └── utils/           # date, youtube→spotify utils
├── component/
│   ├── todo/
│   ├── calendar/
│   └── player/
└── e2e/
```

## 문서

```
docs/
├── dev-logs/                   # 태스크별 개발 로그
└── report/
    ├── specs/feature-spec.md   # 기능 명세서
    ├── screenshots/
    ├── coverage/               # (git 제외)
    └── e2e-html/               # (git 제외)
```

## 주요 규칙

- 경로 별칭: `@/` → `src/`
- 상태는 반드시 Zustand 스토어로 관리; 로컬 UI 상태만 `useState` 허용
- `useSpotifyPlayer` 훅은 `App.tsx`에서만 마운트 — SDK는 싱글톤
- Spotify 인증: PKCE flow (Client Secret 불필요, 브라우저 전용)
- `usePlayerStore._sdkPlayer`는 persist 제외 (런타임 전용)
- 모바일 대응 불필요 (PC 전용, min-width: 1280px)
