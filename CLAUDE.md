# Sync — 다기능 통합 생산성 플랫폼

## 프로젝트 개요

투두리스트 + 캘린더 + 유튜브 음악 플레이어를 통합한 데스크톱 앱.
프론트엔드 포트폴리오 및 대학 연구 보고서 제출용. 타겟: PC 웹 브라우저 / Electron 데스크톱.

## 기술 스택

- **Vite** + **React 19** + **TypeScript**
- **Electron** (데스크톱 빌드)
- **Tailwind CSS v4** (`@tailwindcss/vite` 플러그인)
- **Zustand v5** + **immer** (상태 관리 + persist 미들웨어)
- **YouTube IFrame API** (플레이어)
- **localStorage** via Zustand persist

## 폴더 구조

```
src/
├── components/
│   ├── todo/        # TodoList, TodoItem, TodoForm
│   ├── calendar/    # CalendarGrid, CalendarEvent, EventForm
│   ├── player/      # Player, Playlist, TrackItem
│   ├── layout/      # AppLayout, Sidebar, Panel
│   └── ui/          # Button, Input, Modal 등 공통 컴포넌트
├── hooks/           # 커스텀 훅 (useYouTubePlayer, useCalendar 등)
├── store/           # Zustand 스토어 (useTodoStore, useCalendarStore, usePlayerStore)
├── types/           # TypeScript 타입 정의 (todo.ts, calendar.ts, player.ts)
└── utils/           # 유틸 함수 (date.ts, youtube.ts)
electron/
├── main.cjs         # Electron 메인 프로세스
└── preload.cjs      # Preload 스크립트
```

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
├── setup.ts                    # jest-dom, localStorage, crypto mock
├── unit/
│   ├── store/                  # 스토어 로직 단위 테스트
│   └── utils/                  # 유틸 함수 단위 테스트
├── component/                  # RTL 컴포넌트 테스트 (구현 후 활성화)
│   ├── todo/
│   ├── calendar/
│   └── player/
└── e2e/                        # Playwright E2E (test.fixme → 구현 후 활성화)
```

### 테스트 작성 규칙

- 유닛/컴포넌트: `tests/unit/`, `tests/component/` — Vitest + RTL
- E2E: `tests/e2e/` — Playwright, `test.fixme`로 마킹 후 컴포넌트 구현 시 활성화
- 컴포넌트 미구현 상태는 `it.todo()` 또는 `test.fixme()`로 유지
- 커버리지 리포트는 `docs/report/coverage/`에 생성됨 (git 제외)

## 문서

```
docs/
├── dev-logs/                   # 태스크별 개발 로그 (TEMPLATE.md 참고)
└── report/
    ├── specs/feature-spec.md   # 기능 명세서
    ├── screenshots/            # 기능별 스크린샷
    ├── coverage/               # 테스트 커버리지 (생성물, git 제외)
    └── e2e-html/               # Playwright HTML 리포트 (생성물, git 제외)
```

태스크 완료 시 `docs/dev-logs/TASK-NNN-기능명.md`를 TEMPLATE.md 기반으로 작성.

## 주요 규칙

- 경로 별칭: `@/` → `src/`
- 상태는 반드시 Zustand 스토어로 관리; 로컬 UI 상태만 `useState` 허용
- 스토어 파일명: `use{Feature}Store.ts`
- 컴포넌트 파일명: PascalCase
- 모바일 대응 불필요 (PC 전용, min-width: 1280px)
- YouTube IFrame API는 `src/utils/youtube.ts`의 `loadYouTubeAPI()`로 초기화
