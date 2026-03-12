# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

i18n-doctor is a web app that scans public GitHub repos for broken/missing/incomplete translations and offers one-click fixes via Lingo.dev. Users paste a GitHub repo URL and get a localization health report with per-locale coverage, missing keys, untranslated strings, and orphan keys.

## Monorepo Structure

This is a pnpm workspaces + Turborepo monorepo. Packages:

- **`apps/www`** — Next.js 15 app (App Router, Turbopack, Tailwind CSS v4). The main web application with pages, API routes, and app-specific components.
- **`packages/ui`** (`@workspace/ui`) — Shared UI primitives (Base UI, Radix, shadcn-style components). Exports via subpath: `@workspace/ui/ui/*`, `@workspace/ui/components/*`, `@workspace/ui/lib/*`, `@workspace/ui/hooks/*`.
- **`packages/eslint-config`** (`@workspace/eslint-config`) — Shared ESLint flat configs.
- **`packages/typescript-config`** (`@workspace/typescript-config`) — Shared tsconfig bases.

## Commands

```sh
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in dev mode (Turbopack)
pnpm build            # Build all packages/apps
pnpm lint             # Lint all packages/apps
pnpm format           # Prettier format (ts, tsx, md)
```

Single-app dev: `cd apps/www && pnpm dev`

Type-check www: `cd apps/www && pnpm typecheck`

Lint uses `--max-warnings 0` — all warnings are errors.

## Tech Stack Details

- **Runtime**: Node >= 20, pnpm 10.4.1
- **Framework**: Next.js 15.5 with App Router, React 19, Turbopack for dev and build
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Database**: Supabase (PostgreSQL + RLS policies). Use `@supabase/ssr` + `createServerClient` in Route Handlers, `createClient` from `lib/supabase/client.ts` in client components.
- **Auth**: Supabase GitHub OAuth (`supabase.auth.signInWithOAuth`). Requests `public_repo` scope for PR creation. `provider_token` available via `session.provider_token` on the client.
- **Data fetching**: TanStack React Query (`@tanstack/react-query`) — `useQuery` for reads, `useMutation` for actions.
- **Translation**: Lingo.dev SDK (`@lingo.dev/_sdk`, `LingoDotDevEngine`) — used server-side in `/api/fix`.
- **UI Libraries**: Base UI, Radix UI, shadcn-pattern components in `packages/ui`
- **Fonts**: Fustat (sans + heading), Geist Mono

## Key Conventions

- The `@workspace/ui` package uses raw TypeScript source exports (no build step) — the www app transpiles it via `transpilePackages: ["@workspace/ui"]` in next.config.ts.
- Environment variables go in `apps/www/.env.local`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Optional: `GITHUB_TOKEN`, `LINGODOTDEV_API_KEY`.
- Turbo tasks: `build`, `dev`, `lint`, `check-types`. The `build` task depends on `DATABASE_URL` env var.

## API & Data Fetching Architecture

All data fetching follows a strict three-layer pattern. **Never** put `fetch()` or Supabase calls directly in components.

### Layer 1 — API functions (`apps/www/lib/api/`)

Pure async functions, no React. Each file maps to a domain:

- `lib/api/reports.ts` — Supabase queries: `fetchReportById`, `fetchRecentPublicReports`, `fetchUserReports`, `fetchUserLeaderboard`, `getCurrentUserId`, `getCurrentUser`
- `lib/api/fix.ts` — fetch wrappers: `fixLocale`, `createPR`

### Layer 2 — Hooks (`apps/www/hooks/`)

React Query wrappers. `useQuery` for reads, `useMutation` for writes:

- `hooks/use-reports.ts` — `useReport`, `useRecentPublicReports`, `useUserReports`, `useUserLeaderboard`, `useCurrentUser`
- `hooks/use-fix.ts` — `useFixLocale` (mutation), `useCreatePR` (mutation)

```ts
// lib/api/fix.ts — pure function
export async function fixLocale(reportId: string, targetLocale: string): Promise<FixResult> {
  const res = await fetch("/api/fix", { method: "POST", ... })
  return data
}

// hooks/use-fix.ts — React Query mutation
export function useFixLocale() {
  return useMutation({ mutationFn: ({ reportId, targetLocale }) => fixLocale(reportId, targetLocale) })
}

// Component — only consumes the hook
const { mutate, isPending, isError, data } = useFixLocale()
```

### Layer 3 — Components

Only call hooks. Never call `fetch()` or `createClient()` directly in a component.

### API Routes (`apps/www/app/api/`)

- `POST /api/scan` — SSE stream: GitHub scan → report → save to Supabase
- `POST /api/fix` — translate missing keys via Lingo.dev, return merged locale JSON
- `POST /api/pr` — create branch + commit + PR on GitHub (forks if no write access)
