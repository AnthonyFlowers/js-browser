# JSB-020: Reduce bundle size (Monaco and other heavy dependencies)

- **Type:** Task
- **Priority:** High
- **Depends on:** none

## Description

As a user (especially on mobile data), I want the app to load fewer bytes so that it starts quickly.

`src/monaco-setup.ts` does `import * as monaco from "monaco-editor"`, which pulls in every language, contribution and worker.

## Acceptance Criteria

- [ ] Baseline recorded in Notes before changes: `npm run build` output sizes (per chunk, gzip) and transferred bytes for first load of the app and of opening the first code cell
- [ ] `monaco-setup.ts` imports `monaco-editor/esm/vs/editor/editor.api` plus only the needed contributions (e.g. find, bracket matching, clipboard, hover, suggest, folding, comment, multicursor) and only the JavaScript language support; unused basic languages are not bundled (markdown is handled by md-editor, not Monaco)
- [ ] The TypeScript/JavaScript worker is still used for the `javascript` label and the editor worker for everything else; editing, completion and Format still work
- [ ] Other heavy dependencies reviewed (`@uiw/react-md-editor`, `prettier/standalone` plugins, Shiki, `streamsaver`, Font Awesome, Bulma/bulmaswatch) and each loaded lazily or trimmed where cheap; findings listed in Notes
- [ ] After numbers recorded next to the baseline; the reduction is stated and no feature regressed (checked by the e2e suite once JSB-017 exists)
- [ ] `docs/architecture.md` Editor section updated; ADR added if Monaco import strategy changes materially (amends ADR-011)

## Notes

Part of the stability sweep. Consider `rollup-plugin-visualizer` as a temporary tool for measuring (not necessarily kept). Do not remove features to save bytes without asking the owner.
