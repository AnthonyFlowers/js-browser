# ADR-013: Highlight JSX in Monaco with Shiki (TextMate) instead of monaco-jsx-highlighter

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** Monaco's built-in JavaScript tokenizer (Monarch) does not understand JSX. `monaco-jsx-highlighter` 0.0.15 is
unmaintained, peers on `monaco-editor` ^0.21, parses with jscodeshift/Babel on every edit and depends on `window.monaco`.

**Decision:** Use `shiki` + `@shikijs/monaco` with the `dark-plus` theme and the `javascript` grammar (which includes JSX)
on the pure-JS regex engine (no oniguruma wasm). `src/monaco-setup.ts` creates the highlighter and calls `shikiToMonaco`;
the editor theme is `dark-plus`. `jscodeshift`, `monaco-jsx-highlighter`, `assert`, `lodash` and `syntax.css` were removed.

**Consequences:** Tokenization is TextMate-based and correct for JSX, with no per-edit AST parsing. Only one theme and one
grammar are bundled, loaded with dynamic imports. The module uses top-level await, so it is loaded lazily with the editor.
