# js-browser

[![CI](https://github.com/AnthonyFlowers/js-browser/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/AnthonyFlowers/js-browser/actions/workflows/ci.yml)
[![Deploy](https://github.com/AnthonyFlowers/js-browser/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/AnthonyFlowers/js-browser/actions/workflows/deploy.yml)

An in-browser JavaScript/JSX notebook. Write code and markdown cells, bundle the code in the browser, and see the result next to each cell. No backend required.

A personal tool for quickly trying JS and npm packages, built to work well on desktop and mobile.

**Live demo:** https://anthonyflowers.github.io/js-browser/

## Features

- Code cells with the Monaco editor (syntax highlighting, JSX support, Format button)
- Markdown cells for notes and documentation
- In-browser bundling with esbuild-wasm
- `import` npm packages by name; they are resolved from [unpkg](https://unpkg.com) and cached in IndexedDB
- CSS imports from packages
- Cumulative scope: each code cell sees the code of the cells above it
- Sandboxed preview: each cell runs in its own `sandbox="allow-scripts"` iframe
- `show()` helper to display values, HTML or JSX in the cell preview
- Save a book to a file and load it back with Save Book / Load Book
- Your book is persisted in the browser between visits

## Usage

Add a code cell and call `show()` to display something in its preview:

```jsx
import { useState } from "react";

show("<h1>Hello</h1>"); // strings are rendered as HTML
show({ answer: 42 }); // objects are shown as JSON

const Counter = () => {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Clicked {n} times</button>;
};

show(<Counter />); // JSX is rendered with React
```

Later cells can use anything declared in earlier cells. Any package on npm can be imported, for example `import axios from "axios";`.

## Getting started

Requires Node 24 (see `.nvmrc`) and npm.

```
npm ci
npm run dev
```

Then open http://localhost:5173/js-browser/.

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the Vite dev server             |
| `npm run build`        | Production build into `dist/`         |
| `npm run preview`      | Serve the production build locally    |
| `npm run lint`         | Run ESLint                            |
| `npm run format`       | Format the code with Prettier         |
| `npm run format:check` | Check formatting (used in CI)         |
| `npm run typecheck`    | Type-check with `tsc --noEmit`        |
| `npm test`             | Run the Vitest test suite             |

## Tech stack

React, Redux Toolkit, TypeScript, Vite, Monaco Editor, esbuild-wasm, Bulma, and Vitest, with ESLint and Prettier for code quality.

## Deployment and workflow

GitHub Actions builds the site and publishes it to GitHub Pages whenever `main` changes. CI (lint, format check, typecheck, tests, build) runs on pull requests.

- Work is done on story branches that are merged into `dev` once checks pass.
- Releases are `dev` to `main` pull requests, reviewed before the owner merges.
- Work is tracked as stories in [`docs/`](docs/README.md); see also [architecture](docs/architecture.md), [decisions](docs/decisions.md) and [CLAUDE.md](CLAUDE.md) for contributor and AI-assistant conventions.

## Roadmap

- [Switch between named local books](docs/stories/JSB-010-switch-named-local-books.md) (JSB-010)
- [Save an individual cell as a file](docs/stories/JSB-011-save-cell-as-file.md) (JSB-011)
- [CSS cell type](docs/stories/JSB-012-css-cell-type.md) (JSB-012)

## License

[MIT](LICENSE)
