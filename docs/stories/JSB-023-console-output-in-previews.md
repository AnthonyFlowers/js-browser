# JSB-023: Show console output in cell previews

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-017

## Description

As a user, I want `console.log` and friends to appear under the cell so that I can see output on devices without developer tools, such as my phone.

## Acceptance Criteria

- [ ] The preview iframe shell in `preview.tsx` forwards `console.log`, `info`, `warn`, `error` and uncaught errors to the parent via `postMessage`, with values serialised safely (circular references, functions, errors, large objects)
- [ ] `Preview` verifies the message source is its own iframe and renders the entries in a console panel under the preview, with level styling
- [ ] The console panel is cleared when the cell is re-run, can be collapsed, and shows a count of entries
- [ ] Only the cell's own output is shown, not output of earlier cells that run as part of its cumulative code (the earlier cells use a no-op `show` but their `console` calls still execute; decide whether to suppress them)
- [ ] Output volume is capped so a loop of logs cannot freeze the app
- [ ] Sandbox stays `allow-scripts` only; unit tests for the serialiser; works on mobile layout (JSB-019)

## Notes

Roadmap, after the stability sweep. Today runtime errors are rendered into `#root` by `handleError` in the iframe shell; this extends that channel.
