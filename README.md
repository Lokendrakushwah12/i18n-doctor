# i18n-doctor

Scan any public GitHub repo for broken, missing, or incomplete translations — and fix them in one click using Lingo.dev.

---

## Overview

Developers ship apps with broken i18n all the time - new UI strings go untranslated, some locales have 90% coverage while others sit at 40%, and unused keys pile up silently. Existing tools are CLI-only, require local setup, and don't fix anything automatically.

**i18n-doctor** is a web dashboard where you paste a GitHub repo URL and instantly get:

1. A **Localization Health Report** — visual breakdown of coverage per locale
2. A **list of issues** — missing keys, untranslated strings, orphan keys
3. A **one-click Fix** — uses Lingo.dev to fill all gaps and optionally opens a GitHub PR

## Features

- **Repo Scanner** — auto-detects locale/translation files (JSON, YAML, `.po`) in common patterns like `locales/`, `i18n/`, `public/locales/`
- **Health Dashboard** — per-locale coverage %, visual progress bars, summary cards (total keys, missing, untranslated, orphan)
- **One-Click Fix** — translates all missing/empty strings via Lingo.dev SDK with parallel chunked translation, real-time progress, and live diff preview
- **Draft PR** — creates a GitHub PR with the fixed translations (forks the repo if you don't own it)
- **Download JSON** — export the merged locale file directly
- **Shareable Reports** — every scan generates a unique URL with dynamic OG image for social sharing
- **Leaderboard** — compare translation coverage across repos you've scanned
- **GitHub OAuth** — sign in to access your dashboard, create PRs, and track scans
- **Responsive UI** — mobile bottom nav, skeleton loading states, dark/light mode

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind CSS v4 |
| Backend/DB | Supabase (PostgreSQL + RLS) |
| Translation | Lingo.dev SDK + CLI + GitHub Action |
| Repo Access | GitHub REST API |
| Auth | GitHub OAuth via Supabase |
| Deployment | Vercel |

## Lingo.dev Integration

- **Lingo.dev SDK** — runtime translation of missing keys
- **Lingo.dev CLI** — server-side processing of locale file buckets
- **Lingo.dev Compiler** — the app itself is multilingual (dogfooding)
- **Lingo.dev CI/CD** — GitHub Action for auto-translation on push

## Repository Layout

- `apps/www/` — Next.js web app, API routes, and app-specific code
- `apps/www/app/` — App Router pages and API routes
- `apps/www/components/` — React components
- `apps/www/lib/` — Utility helpers (GitHub API, locale parser, Lingo.dev wrapper)
- `packages/ui/` — Shared UI primitives
- `packages/typescript-config/`, `packages/eslint-config/` — Workspace configuration

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment variables

Create `apps/www/.env.local`:

```ini
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GITHUB_TOKEN=your-github-token (optional, raises rate limit from 60 to 5000 req/h)
LINGODOTDEV_API_KEY=your-lingo-api-key (required for one-click fix)
```

### 3. Start the development server

```sh
pnpm dev
```

The app runs at `http://localhost:3000`.

## Build Plan

### Scaffolding & Integrations
- [x] Next.js monorepo scaffold (Turborepo + pnpm workspaces)
- [x] Supabase project setup (auth + database)
- [x] Set up Lingo.dev CLI and `i18n.json` config (dogfooding the app)
- [x] GitHub Action for Lingo.dev CI/CD auto-translation on push

### Core Scanner
- [x] GitHub API helpers (repo info, tree listing, file content fetching)
- [x] Locale file detector (auto-detect `locales/`, `i18n/`, etc.)
- [x] Locale parser (JSON, YAML, `.po` → flat key map)
- [x] Diff engine (compare source vs target locales)
- [x] `/api/scan` endpoint (full pipeline)
- [x] Report dashboard (`/report?repo=…`) with coverage bars, per-locale cards, expandable issues

### Auth & Persistence
- [x] Enable GitHub OAuth
- [x] Create `reports` table with RLS policies
- [x] Dashboard page (past scans per user)
- [x] Profile page (basic user info)
- [x] Sidebar navigation (Dashboard, New Scan, Leaderboard, Profile)
- [x] `/:owner/:repo` shortcut URL (auto-redirects to scan)
- [x] Leaderboard page UI (benchmark dataset for i18n tooling)
- [x] Store scan results in Supabase `reports` table
- [x] Leaderboard data from Supabase (populates after reports are stored)
- [x] Recent scans list on home page (from DB)
- [x] Shareable report URLs (`/report/[id]`)

### One-Click Fix
- [x] Lingo.dev SDK integration for translating missing keys server-side
- [x] "Fix with Lingo.dev" button on report page
- [x] Download fixed locale files as JSON
- [x] Live diff preview (before/after per key)
- [x] Open a GitHub PR with fixes (uses GitHub OAuth token + `public_repo` scope)

### Polish & Ship
- [x] Responsive UI — mobile bottom nav, skeleton loading states for all pages
- [x] Dynamic OG image — per-report social share cards with coverage stats
- [x] Error handling — rate limit messages with reset timer, repo not found hints, graceful stream errors
- [x] Deploy to Vercel
- [x] Final README & hackathon submission

## Technical Notes

### Scan pipeline — SSE streaming
`/api/scan` uses a `ReadableStream` to push Server-Sent Events to the client as each stage completes (parse URL → fetch tree → detect locale files → compute diff → save to DB). This lets the UI show a live step-by-step loading screen instead of waiting for a single slow response.

### Fix pipeline — parallel chunked translation + SSE
`/api/fix` collects all missing/untranslated keys, strips pure-interpolation tokens (e.g. `{{count}}`), then splits the remainder into chunks of 15. All chunks are translated **in parallel** via `Promise.all` against the Lingo.dev SDK, giving an ~N× speedup over a single sequential call (N = number of chunks). Progress events are streamed back over SSE so the UI shows real-time status ("Fetching source files…", "Translating… 15/73 keys") with a live progress bar.

### Locale normalization — BCP-47
Repos use mixed casing for locale codes (`pt-br`, `zh-hans`, `EN_US`). Lingo.dev requires strict BCP-47 (language lowercase, script TitleCase, region UPPERCASE). A `normalizeLocale()` helper in `lib/lingo.ts` handles this before every SDK call.

### GitHub PR creation — fork-first flow
When the authenticated user doesn't own the scanned repo, the PR flow forks it first (`POST /repos/:owner/:repo/forks`), polls until the fork is ready (up to 12 s with 2 s back-off), creates a branch `i18n-doctor/fix-{locale}-{timestamp}`, commits the fixed file, and opens a **draft PR** against the original repo. The user never has to touch Git.

### Client-side data layer — React Query + localStorage + Supabase
- **React Query** caches all server state (reports, user, leaderboard) in memory so navigating between pages doesn't re-fetch.
- **Fix results** are persisted to `localStorage` keyed by `fix:{reportId}:{locale}` so they survive page refreshes.
- **PR URLs** are persisted both in `localStorage` (`pr:{reportId}:{locale}`) for instant restore and in the Supabase `report` JSON column (`prLinks`) as the authoritative source of truth.
- **GitHub `provider_token`** (ephemeral after Supabase OAuth) is captured in `onAuthStateChange` and stored in `localStorage` so the PR flow works after a page refresh.

### 3-layer API architecture
All data access follows `lib/api/` (pure async fetch functions) → `hooks/` (React Query `useQuery`/`useMutation` wrappers) → components (read from hook return values only). No raw Supabase/fetch calls in `.tsx` files.

## Socials

- Twitter: [@lokendratwt](https://x.com/lokendratwt)
- GitHub: [i18n-doctor](https://github.com/lokendrakushwah12/i18n-doctor)

---

Built for the Lingo.dev Multilingual Hackathon #3.
