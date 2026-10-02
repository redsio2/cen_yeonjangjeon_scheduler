# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server on http://localhost:3000 (also defined as `cen-scheduler` in `.claude/launch.json`; start it via the preview tools, not Bash)
- `npm run build` — production build (also the type-check step; there is no separate `tsc` script)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`)
- `npm run db:generate` / `npm run db:migrate` — after editing `drizzle/schema.ts`, generate a SQL migration into `drizzle/migrations/` and apply it (`drizzle.config.ts` reads `DATABASE_URL` from `.env`). Don't use `drizzle-kit push`; it bypasses the migration history.

No test framework is set up yet.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4 (configured via `@import "tailwindcss"` / `@theme` in `src/app/globals.css`, no `tailwind.config`). Per AGENTS.md, check `node_modules/next/dist/docs/` before using Next.js APIs — e.g. `layout.tsx` uses the global `LayoutProps<"/">` type helper rather than a hand-written props type.

Import alias: `@/*` → `src/*`.

## Architecture

A Korean-language schedule manager for a video production team (촬영/편집/미팅/납품 = shoot/edit/meeting/delivery).

- `src/types/schedule.ts` is the single source of truth for the data model. `SCHEDULE_TYPES` is a `const` tuple; `ScheduleType` is derived from it, and `ScheduleList`'s `TYPE_BADGE_STYLE` is a `Record<ScheduleType, string>` — so adding a type requires adding a badge style or the build fails. `ScheduleFormValues` = `Schedule` minus `id`/`createdAt`.
- Dates/times are plain strings (`YYYY-MM-DD`, `HH:mm`) straight from `<input type="date|time">`; validation compares them lexically (`startTime >= endTime`), and `formatDate` parses them as local dates.
- Persistence is Supabase Postgres via Drizzle (`postgres-js` driver, `prepare: false` for the transaction pooler). `drizzle/schema.ts` defines `schedules` (its `schedule_type` enum is built from `SCHEDULE_TYPES`); `src/db/index.ts` is the server-only client and `src/db/schedules.ts` maps rows to `Schedule` (Postgres `time` comes back as `HH:mm:ss` → sliced to `HH:mm`; `created_at` `Date` → ms number). The DB generates `id` and `created_at`.
- `src/app/page.tsx` is a dynamic Server Component (`await connection()`) that reads schedules and passes the `addSchedule` Server Action (`src/app/actions.ts`) to `ScheduleForm` as `onSubmit`. `validateSchedule` (`src/lib/validateSchedule.ts`) runs both in the form and in the action; the action inserts, then calls `refresh()` so the list re-renders. `ScheduleList` is presentational.

## Conventions

- UI text is Korean; keep new user-facing strings in Korean.
- Styling is Tailwind utility classes on a zinc palette with explicit `dark:` variants on every colored element.
