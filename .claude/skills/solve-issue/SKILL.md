---
name: solve-issue
description: Solve one GitHub issue of this repo end to end — read the issue, plan, branch, implement with tests, run every check, then commit, push and open a PR that closes the issue. Use when the user runs /solve-issue <number>.
argument-hint: <issue-number>
disable-model-invocation: true
---

# Solve issue #$ARGUMENTS

Work on exactly one issue: **#$ARGUMENTS**. `CLAUDE.md` is the rulebook for every step below — its **Stack**, **Commands**, **Conventions** and **Off limits** apply in full. If this skill and `CLAUDE.md` ever disagree, `CLAUDE.md` wins.

If `$ARGUMENTS` is empty or not a number, ask for the issue number and stop.

## 1. Preflight

1. `git status --short` must be empty. If it is not, stop and ask the user what to do with the changes — never stash, reset or discard them yourself.
2. `git fetch origin` (this also confirms the SSH connection to GitHub).
3. `gh auth status`. If `gh` is not logged in, continue, but use the fallbacks below and tell the user they can run `! gh auth login` to let this skill open PRs.

## 2. Read the issue

Get the issue text, first source that works:

1. `gh issue view $ARGUMENTS --json number,title,body,state`
2. `curl -s https://api.github.com/repos/MadhaviRamani/Recap_Project-6/issues/$ARGUMENTS` (the repo is public)
3. The matching template in `.github/templates/` (file name starts with the zero-padded number, e.g. `04-gallery-page.md`)

Then:

- If the issue is closed or is a pull request, say so and stop.
- Extract the **Acceptance Criteria**, **Tasks** and **Hint** — together they are the spec.
- Check the order: setup issues 1–3 first, then stories 4–11 in number order, bonus 12–13 last. If an earlier issue is still open, warn the user and ask whether to continue.
- Read the code the issue touches (start with `src/App.tsx`) so the plan builds on what exists.

## 3. Plan and wait for approval

Show a short plan:

- the files to create or change,
- the tests to add,
- each acceptance criterion and how it will be met.

**Stop and wait for the user to approve or adjust the plan.** The user plans, steers and reviews; do not start coding before they agree.

## 4. Branch

```bash
git switch main
git pull --ff-only
git switch -c issue-$ARGUMENTS-<short-kebab-title>
```

One branch per issue, always from the latest `main`.

## 5. Implement

- Follow the **Conventions** in `CLAUDE.md` (data fetched once in `App.tsx`, user data in `ArtPieceInfo` keyed by `slug`, types in `src/types.ts`, single `Navigation`, …).
- Do only what this issue asks: no work from later issues, no unrelated refactors.
- Add tests next to each new or changed component (`Component.test.tsx`), wrapping router components in `MemoryRouter`. The SonarQube Cloud quality gate checks coverage on new code, so untested components will fail the PR.

## 6. Verify

Run every check and fix the code until all pass:

```bash
npm run format
npm run check
npm run lint
npm run coverage
npm run build
```

- `coverage` runs the whole test suite once; for a quick loop use `npm run test:run -- <file>`.
- Never `npm test` (watch mode). Never edit a test, lower a threshold or disable a rule to get green — fix the code, or explain to the user why you cannot.

Then go through the acceptance criteria one by one and state, for each, what proves it is met (a test, a route, a file). If one is not met, go back to step 5.

## 7. Review, commit, push, PR

1. Show `git status --short` and a summary of the diff, and ask the user to confirm before committing.
2. Stage only the files of this issue by name (never `git add -A`; `coverage/` and `dist/` must not be committed).
3. Commit with a message whose first line is `<Issue title> (#$ARGUMENTS)` and whose body lists the changes and ends with `Closes #$ARGUMENTS`.
4. `git push -u origin <branch>`.
5. Open the PR:
   - with `gh`: `gh pr create --base main --title "<Issue title>" --body "<summary>\n\nCloses #$ARGUMENTS"`;
   - without `gh`: give the link `https://github.com/MadhaviRamani/Recap_Project-6/pull/new/<branch>` and the PR text to paste, including `Closes #$ARGUMENTS`.

## 8. Hand over

Report: branch, commit, PR link, the check results, and the acceptance criteria checklist.

**Never merge the PR.** The user merges it after the `ci` check and the SonarQube Cloud quality gate are green. If a check fails on GitHub, read its log (`gh run view --log-failed` when `gh` is logged in) and fix it on the same branch.
