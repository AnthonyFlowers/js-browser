# JSB-022: TypeScript in code cells

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-017

## Description

As a user, I want to write TypeScript in code cells so that I can try typed APIs and packages.

## Acceptance Criteria

- [ ] Decision recorded: a per-cell language toggle or a new cell type versus treating all code cells as TSX (affects `CellTypes` in `src/state/cell.ts` and persisted books)
- [ ] Cells marked TypeScript are bundled with esbuild's `tsx`/`ts` loader (entry loader in `fetch-plugin.ts`; `.ts`/`.tsx` files fetched from unpkg use the matching loader in `loaderFor`)
- [ ] Monaco uses the TypeScript language for those cells and the Shiki highlighting in `monaco-setup.ts` covers TS/TSX (add the grammar lazily)
- [ ] Existing books and `.book` files still load; JS cells behave as before, including cumulative scope across mixed cells
- [ ] Type errors are not required to block running (esbuild strips types); whether to show diagnostics from the TS worker is decided and documented
- [ ] Tests for loader selection and cumulative code with mixed cells; Format button works for TS; docs updated

## Notes

Roadmap, after the stability sweep. JSX is already supported via the `jsx` loader. Mind the bundle size impact on Monaco (JSB-020) when adding grammars.
