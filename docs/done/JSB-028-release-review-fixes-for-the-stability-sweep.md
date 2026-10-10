# JSB-028: Release review fixes for the stability sweep

- **Type:** Bug
- **Priority:** High
- **Depends on:** JSB-020

## Description

As a user, I want the findings of the Opus release review of `origin/main...origin/dev` fixed so that the stability sweep ships without regressions.

## Acceptance Criteria

- [x] A failed lazy chunk (text or code editor) shows a message with a Reload button in its cell instead of blanking the app; `vite:preloadError` reloads once (sessionStorage guard); e2e scenario covers the text editor chunk failing
- [x] Format surfaces load failures and Prettier syntax errors inline instead of failing silently; e2e covers both
- [x] Go to line, tab focus mode, go to definition, copy/paste and font zoom restored in Monaco; size delta recorded in JSB-020 and ADR-024
- [x] README link to JSB-020 fixed; markdown link check clean for the whole repo
- [x] `useMediaQuery` memoizes its subscribe function per query
- [x] `scripts/claude/session-start.sh` also runs `npm ci` when `package-lock.json` changed (hash stamp in `node_modules/.package-lock-hash`)

## Notes

- Error UI: `src/components/error-boundary.tsx`; format errors are an inline alert in `code-editor.tsx`. Scenarios in `e2e/features/resilience.feature` (the text editor scenario pre-sets the reload guard so the page does not reload mid-test).
- Monaco size delta: see JSB-020 follow-up. `.claude/settings.json` untouched (allowlist question is the owner's).
