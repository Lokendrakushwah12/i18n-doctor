# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

i18n.doctor is a web app that scans public GitHub repos for broken/missing/incomplete translations and offers one-click fixes via Lingo.dev. Users paste a GitHub repo URL and get a localization health report with per-locale coverage, missing keys, untranslated strings, and orphan keys.

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
- **Database**: Drizzle ORM + PostgreSQL (`DATABASE_URL` env var)
- **Auth**: better-auth
- **API**: tRPC (client + server)
- **UI Libraries**: Base UI, Radix UI, shadcn-pattern components in `packages/ui`
- **Fonts**: Fustat (sans + heading), Geist Mono

## Key Conventions

- The `@workspace/ui` package uses raw TypeScript source exports (no build step) — the www app transpiles it via `transpilePackages: ["@workspace/ui"]` in next.config.ts.
- Environment variables go in `apps/www/.env.local`. Required: `DATABASE_URL`. Optional: `NEXT_PUBLIC_APP_URL`, `GITHUB_TOKEN`.
- Turbo tasks: `build`, `dev`, `lint`, `check-types`. The `build` task depends on `DATABASE_URL` env var.
