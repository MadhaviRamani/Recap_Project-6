# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Art gallery app (Recap Project 6): four pages — Spotlight, Gallery, Favorites, Details — built from the art API at `https://example-apis.vercel.app/api/art`. Work is driven by GitHub issues created from `.github/templates/` (setup issues 1–3, then user stories 4–13 in order). Each issue's acceptance criteria and hints are the spec.

## Stack

- Vite 5 + React 19 + TypeScript (strict, `tsconfig.json` includes only `src/`)
- React Router 8 (imports from `react-router`, `BrowserRouter` is set up in `src/index.tsx`)
- SWR for data fetching
- Vitest 2 + React Testing Library + jsdom, configured in the `test` block of `vite.config.ts` (globals on: `test`, `expect`, `vi` need no imports; setup file `src/setupTests.ts`)
- Prettier (`.prettierrc.json`: double quotes, semicolons, `trailingComma: "es5"`)
- Deployed on Vercel; `vercel.json` rewrites all paths to `index.html` so client routes survive reloads
- Node.js 22.22 or newer

## Commands

- `npm run dev` — dev server on port 3000
- `npm run build` / `npm run serve` — production build / preview
- `npm run check` — type-check with `tsc --noEmit`
- `npm run test:run` — run all tests once; `npm run test:run -- src/path/File.test.tsx` runs a single file, add `-t "name"` to run a single test
- `npm run coverage` — run tests once with v8 coverage; writes `coverage/lcov.info` (settings in the `coverage` block of `vite.config.ts`)
- `npm run lint` — ESLint 9 flat config in `eslint.config.js`: recommended rules of `@eslint/js`, `typescript-eslint` and `eslint-plugin-sonarjs` for `.ts`/`.tsx`
- `npm run format` / `npm run format:check` — write / check Prettier formatting for the whole repo (files in `.gitignore` are skipped)

## Conventions

- Fetch the art pieces once in `App.tsx` with `useSWR` and pass them down as props. The `fetcher` returns a typed `ArtPiece[]` and throws an `Error` when the response is not `ok` (otherwise SWR never reports an error). Pages show loading and error states.
- `ArtPiece` lives in `src/types.ts` and types only the properties actually used.
- Never mutate fetched art pieces. User data (favorites, comments) is a separate state in `App` (the component that renders `Routes`), keyed by `slug`, e.g. `ArtPieceInfo { slug, isFavorite, comments }`. Comment dates are stored as ISO strings.
- Bonus persistence: only `ArtPieceInfo` goes to `localStorage` (lazy `useState` initializer to read, `useEffect` to write); the app must work with empty storage.
- Navigation is a single `Navigation` component rendered once, using `NavLink` (`end` on the `/` link). Unknown URLs show "Page not found". The gallery route is `/art-pieces`.
- Type all props, state and fetched data.
- Tests sit next to their component (`Navigation.test.tsx`). Wrap components containing `Link`/`NavLink` in `MemoryRouter`. Vitest file patterns must cover `.ts` and `.tsx` (`src/**/*.{ts,tsx}`).
- Keep Vitest config in `vite.config.ts`; do not add a `vitest.config.ts` (it would override the jsdom/setupFiles config).
- One feature branch and one PR per issue; merge only with green CI and quality gate. Solve issues with `/solve-issue <number>` (`.claude/skills/solve-issue/SKILL.md`).

## Off limits

- Never run `npm test` / `npm run test` — it starts Vitest in watch mode and never exits. Use `npm run test:run`.
- Never change a test just to make it pass.
- Never lower a coverage threshold or disable a lint rule/check to make it green.
- Only do what the current issue asks for — no extra features, refactors or files beyond its scope.
