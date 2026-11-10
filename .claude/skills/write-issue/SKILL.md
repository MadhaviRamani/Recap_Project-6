---
name: write-issue
description: Write one new GitHub issue (user story) for this repo from a short feature idea — next number, Value Proposition, Acceptance Criteria, Tasks and Hint in the repo's format — and create it with gh. Only writes the issue, never the code. Use when the user runs /write-issue <idea>.
argument-hint: <what the feature should do>
disable-model-invocation: true
---

# Write an issue: $ARGUMENTS

Turn the idea **"$ARGUMENTS"** into one GitHub issue that `/solve-issue <number>` can later build. `CLAUDE.md` is the rulebook (stack, conventions, off limits); the issue must fit it.

If `$ARGUMENTS` is empty, ask what the feature should do and stop.

**Only write the issue.** Do not change code, do not create a branch, do not commit.

## 1. Understand the idea

- The idea may be short or informal. Work out what the user wants to see and do in the app.
- If it contains **several separate features**, write one issue per feature (ask first if unsure).
- If it is a **bug** ("… does not work", "… is gone"), first reproduce or explain it from the code, so the issue describes the real cause.

## 2. Read what exists

- `gh issue list --state all --limit 30 --json number,title,state` to see the latest issues.
- Read the code the feature touches (start with `src/App.tsx`, then the components, their `.css` files and tests), so the Tasks name real files, components, props and CSS classes.
- Check the **open** issues for overlap or conflicts with the new one. If an open issue already plans something different for the same part of the app, tell the user and suggest how to split it (and offer to edit the other issue).

## 3. Decide the open points

- If a choice **changes what the user gets** (e.g. which icon, which pages, where something goes), ask with `AskUserQuestion` (2–4 concrete options, the recommended one first).
- Small choices with a sensible default (breakpoints, animation length, exact colors): decide yourself and list them in the report at the end.

## 4. Number and title

- The number is the highest `NN:` prefix in the issue titles plus one.
- Title: `NN: <Short Feature Name in Title Case>`, e.g. `27: Search Bar in the Navigation With a Magnifying Glass Button`.

## 5. Write the body

Use exactly these sections. Plain, simple English; every criterion must be checkable (by a test, a route, a file or a look in the browser).

```markdown
## Value Proposition

As a user,

I want <what I can see or do>,

so that <why it helps me>.

## Acceptance Criteria

### <Group 1, e.g. the main feature>

- [ ] …

### <Group 2, …>

- [ ] …

### Keep what works

- [ ] <existing features this touches still work: name them>
- [ ] Works in the light and the dark theme with enough contrast (at least 4.5:1 for text, 3:1 for icons).
- [ ] Works on small screens without horizontal scrolling.
- [ ] Keyboard: everything is reachable with `Tab`, focus is visible.
- [ ] No animation for users who prefer reduced motion. (only if the feature animates)

## Tasks

- [ ] <concrete steps naming real files: components, props, state, utils>
- [ ] Create a separate stylesheet `src/components/<Component>.css` for the new styles and import it in `<Component>.tsx`; do not put them into `src/styles.css` (only theme custom properties go there, for `:root` and `[data-theme="dark"]`).
- [ ] Tests: `<Component>.test.tsx` next to the component (`MemoryRouter` around links), `src/utils/<helper>.test.ts` for helpers; name what each test checks.

## Hint

- <1–4 tips: the tricky part, a useful API, a trap in this codebase>
```

Follow the conventions of `CLAUDE.md` in the Tasks: data fetched once in `App.tsx`, user data in `ArtPieceInfo` keyed by `slug` and never mutating fetched data, types in `src/types.ts`, a single `Navigation`, tests next to their component. Never plan to change a test just to make it pass; if existing tests must change because the feature replaces something, say which and why.

## 6. Create the issue

1. Write the body to a file in the scratchpad directory.
2. Show the user the title and a short summary of the criteria (not the whole body) and create it right away:
   ```bash
   gh issue create --title "NN: <Title>" --label enhancement --body-file <file>
   ```
   Use `--label bug` instead for a bug fix. Without `gh` login, give the user the title and body to paste at `https://github.com/MadhaviRamani/Recap_Project-6/issues/new`.

## 7. Report

- The issue link and title.
- What it asks for, in a few bullets.
- The decisions you made yourself (step 3) and any overlap with open issues (step 2).
- The next step: `/solve-issue <number>`.
