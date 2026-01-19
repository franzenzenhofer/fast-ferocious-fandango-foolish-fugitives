# Repository Guidelines

## Golden Goal
A cool, fun-to-play arcade chase with great graphics: rams feel satisfying and fair, the ramp keeps players hooked from 1 car to chaos, and the BUSTED loop keeps runs going without frustration.

## Physics Stack
- Primary runtime uses Matter.js directly in `src/main.ts`.
- `src/game/Game.ts` and `src/game/physics.ts` are legacy/experimental until an intentional migration happens.
- `src/engine/physics/` is legacy; avoid new gameplay logic there unless replacing the main stack.

## Project Structure & Module Organization
- `src/main.ts` is the current gameplay entry point.
- `src/engine/` holds reusable engine code (core loop, physics, render, input).
- `src/game/` contains game-specific logic (config, road, vehicles, HUD, state).
- `src/utils/` is for shared helpers.
- `tests/` is reserved for Vitest tests (`tests/**/*.test.ts`).
- `docs/` stores design and implementation plans; `spy_driver_physics.html` is the JS prototype; `index.html` is the Vite entry.

## Build, Test, and Development Commands
- `npm install` install dependencies.
- `npm run dev` start the Vite dev server (auto-opens a browser).
- Add `?seed=1234` to the dev URL to reproduce spawns (e.g., `http://127.0.0.1:5173/?seed=1234`).
- `npm run build` typecheck + Vite production build.
- `npm run preview` serve the built app locally.
- `npm run lint` ESLint on `src/**/*.ts`.
- `npm run lint:fix` auto-fix lint issues where possible.
- `npm run typecheck` run `tsc --noEmit`.
- `npm run test` run Vitest once.
- `npm run test:watch` run Vitest in watch mode.
- `npm run test:coverage` run tests with coverage output.
- `npm run check` run typecheck + lint + tests.

## Coding Style & Naming Conventions
- TypeScript (ESM) with strict compiler options; keep types explicit.
- Indentation: 2 spaces; include semicolons.
- Avoid `any`, unused vars, and `var`; prefer `const` (enforced by ESLint).
- Side-effectful functions should use the `fx_` prefix; keep core logic pure/immutable when possible.
- Use path aliases (`@engine/*`, `@game/*`, `@utils/*`) instead of long relative imports.

## Testing Guidelines
- Framework: Vitest (Node environment).
- Name tests `*.test.ts` under `tests/` (e.g., `tests/engine/vector.test.ts`).
- Target pure functions first; add regression tests for physics changes.
- No coverage thresholds configured; use `npm run test:coverage` for reports.

## Commit & Pull Request Guidelines
- No git history is included here; use short, imperative subjects (e.g., `engine: add AABB resolver`) and keep one logical change per commit.
- PRs should include: summary, rationale, test commands run (or "not run"), and screenshots/gifs for gameplay or rendering changes.
- Link relevant docs or plans when touching core architecture (`briefing.md`, `docs/plans/...`).

## Architecture & References
- `briefing.md` and `docs/plans/` describe the intended engine/game architecture.
- `spy_driver_physics.html` provides the original physics prototype.
