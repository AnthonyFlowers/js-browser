# ADR-024: Import Monaco `editor.api` with selected contributions (amends ADR-011)

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-020

**Context:** ADR-011 bundles Monaco locally, but `import * as monaco from "monaco-editor"` loads `editor.main`, which registers
every contribution, every basic language and the css/html/json language features and workers. Visitors only edit JavaScript/JSX.

**Decision:** `src/monaco-setup.ts` imports `monaco-editor/editor/editor.api` plus an explicit list of contribution modules
(find, bracket matching, clipboard, comment, hover, suggest, parameter hints, snippets, code actions, rename, go to error,
multicursor, word and line operations, links, context menu, the command palette and go-to-line quick access, go to definition,
copy/paste, tab focus mode and font zoom, among others), the
`javascript` language definition and the TypeScript feature `register` module. The ADR-011 worker wiring is unchanged: the
`typescript`/`javascript` labels get `ts.worker`, everything else `editor.worker`. Shiki still supplies tokenization and the theme (ADR-013).
The codicon modifiers CSS is imported by relative `node_modules` path because the package `exports` map appends `.js`.
Prettier, `streamsaver` and the markdown editor are loaded on demand rather than from the entry chunk.

**Consequences:** The first load fell from 706 to 319 KB gzip (mostly from lazy markdown); the editor path shrank by about 170 KB
gzip. Contributions not listed (diff editor, colour picker, code lens, inlay hints, inline completions, peek and reference
widgets, sticky scroll, go to symbol outline) are not available; the release review restored go to line (Ctrl+G), tab focus mode
(Ctrl+M, accessibility), go to definition, the copy/paste contribution and font zoom (JSB-028; net size change about -0.1 KB raw
because those modules were already shared with the TypeScript client chunk); add the matching module import to `monaco-setup.ts` to restore one. Importing
by deep path depends on Monaco's internal `esm/vs` layout, so a Monaco upgrade needs the list rechecked (a missing module is a build error).
