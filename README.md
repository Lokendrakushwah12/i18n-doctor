# i18n.doctor

Scan any public GitHub repo for broken, missing, or incomplete translations — and fix them in one click using Lingo.dev.

---

## Overview

Developers ship apps with broken i18n all the time — new UI strings go untranslated, some locales have 90% coverage while others sit at 40%, and unused keys pile up silently. Existing tools are CLI-only, require local setup, and don't fix anything automatically.

**i18n.doctor** is a web dashboard where you paste a GitHub repo URL and instantly get:

1. A **Localization Health Report** — visual breakdown of coverage per locale
2. A **list of issues** — missing keys, untranslated strings, orphan keys
3. A **one-click Fix** — uses Lingo.dev to fill all gaps and optionally opens a GitHub PR

## Features

- **Repo Scanner** — auto-detects locale/translation files (JSON, YAML, `.po`) in common patterns like `locales/`, `i18n/`, `public/locales/`
- **Health Dashboard** — per-locale coverage %, visual progress bars, summary cards (total keys, missing, untranslated, orphan)
- **One-Click Fix** — translates all missing/empty strings via Lingo.dev SDK, shows a live diff, generates downloadable ZIP
- **Shareable Report Card** — every scan generates a unique URL with social-share friendly summary

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend/DB | Supabase |
| Translation | Lingo.dev SDK + CLI |
| Repo Access | GitHub REST API (Octokit) |
| Auth (stretch) | GitHub OAuth via Supabase |
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
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GITHUB_TOKEN=your-github-token (optional, for higher rate limits)
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
- [ ] Store scan results in Supabase `reports` table
- [ ] Leaderboard data from Supabase (populates after reports are stored)
- [ ] Recent scans list on home page (from DB)
- [ ] Shareable report URLs (`/report/[id]`)

### One-Click Fix
- [ ] Lingo.dev SDK integration for translating missing keys server-side
- [ ] "Fix with Lingo.dev" button on report page
- [ ] Live diff preview (before/after)
- [ ] Download fixed locale files as ZIP
- [ ] Open a GitHub PR with fixes (uses GitHub OAuth token + `public_repo` scope)

### Polish & Ship
- [ ] Responsive UI polish & loading states
- [ ] OG image / social share card for reports
- [ ] Error handling & edge cases (rate limits, large repos, malformed files)
- [x] Deploy to Vercel
- [ ] Final README, demo video, hackathon submission

## Socials

- Twitter: [@lokendratwt](https://x.com/lokendratwt)
- GitHub: [i18n-doctor](https://github.com/lokendrakushwah12/i18n-doctor)

---

Built for the Lingo.dev Multilingual Hackathon #3.
