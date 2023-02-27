# js-browser

A react app that bundles JavaScript code and runs it within the browser. Valid imports from the npm repository are downloaded and included in execution of the code.
Includes markup text areas for code commenting and documentation

Deployed at: [js-browser](https://anthonyflowers.github.io/js-browser/)

## Features

- Write JavaScript using and have it execute on the right side of each cell
- Can import npm packages from the node repository
- Write comments and documentation using markup cells
- Work persists using the browsers storage features
- Using the `show()` command a user can display data, html, and jsx components on the right pane.

## Project Details

Editor

- The monaco editor is used enable syntax highlighting while writing the JavaScript code

JavaScript Bundling and Execution

- Bundling is handled using esbuild
- Packages are downloaded from the npm repository using axios. Imported packages are downloaded using url parsing/building to find the files that should be included in the build
- Packages are cached on the local system using the browsers storage
- The bundled code is executed in iframes to separate the execution of code from the app

## Future Features

- [ ] There is a save button that saves a book. An option to load from a book file should be added
- [ ] Add feature to switch between differently named local books
- [ ] Add save feature for each markup/code cell. Would save a cell as a js/jsx/md file
- [ ] Add cell for css styling
