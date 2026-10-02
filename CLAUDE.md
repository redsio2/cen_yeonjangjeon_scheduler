# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server on http://localhost:3000 (also defined as `cen-scheduler` in `.claude/launch.json`; start it via the preview tools, not Bash)
- `npm run build` — production build (also the type-check step; there is no separate `tsc` script)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`)

No test framework is set up yet.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4 (configured via `@import "tailwindcss"` / `@theme` in `src/app/globals.css`, no `tailwind.config`). Per AGENTS.md, check `node_modules/next/dist/docs/` before using Next.js APIs — e.g. `layout.tsx` uses the global `LayoutProps<"/">` type helper rather than a hand-written props type.

Import alias: `@/*` → `src/*`.

## Architecture

A Korean-language schedule manager for a video production team (촬영/편집/미팅/납품 = shoot/edit/meeting/delivery).

- `src/types/schedule.ts` is the single source of truth for the data model. `SCHEDULE_TYPES` is a `const` tuple; `ScheduleType` is derived from it, and `ScheduleList`'s `TYPE_BADGE_STYLE` is a `Record<ScheduleType, string>` — so adding a type requires adding a badge style or the build fails. `ScheduleFormValues` = `Schedule` minus `id`/`createdAt`.
- Dates/times are stored as plain strings (`YYYY-MM-DD`, `HH:mm`) straight from `<input type="date|time">`; validation compares them lexically (`startTime >= endTime`), and `formatDate` parses them as local dates.
- `src/app/page.tsx` is a client component that owns all state (`useState<Schedule[]>`), assigns `id` (`crypto.randomUUID()`) and `createdAt`, and passes data down to `ScheduleForm` (controlled form + validation, emits `ScheduleFormValues`) and `ScheduleList` (presentational). There is no persistence or backend yet — data is lost on reload.

## Conventions

- UI text is Korean; keep new user-facing strings in Korean.
- Styling is Tailwind utility classes on a zinc palette with explicit `dark:` variants on every colored element.
