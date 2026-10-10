# JSB-027: Flaky e2e: moving and deleting cells

- **Type:** Bug
- **Priority:** High
- **Depends on:** JSB-026

## Description

As a maintainer, I want the e2e scenario "Moving and deleting cells updates the cumulative scope" to be reliable so that CI failures mean real regressions.

It failed about once in six local runs (waiting 15 s for the cell 3 preview to show "B", which stayed empty); reruns passed.

## Acceptance Criteria

- [x] Root cause identified and recorded
- [x] Fixed at the root (no skip, retry-only or longer timeout)
- [x] `--repeat-each 30 --workers 4` passes for the scenario, and the full suite passes 3 times in a row

## Notes

Root cause (app bug, not the test): `Preview` set `iframe.srcdoc` and posted the bundle after a fixed 200 ms `setTimeout`. If the srcdoc document had not finished loading by then (CPU load, slow runner) the message went to a document without its `message` listener and was lost. The bundle never changes afterwards, so nothing re-posted and the preview stayed blank until the code changed again. Real users on slow devices could hit the same blank preview (relevant to JSB-016).

Evidence: before the fix `--repeat-each 30 --workers 4` failed 2 of 30 (both with `#root` empty for the full 15 s on the first "cell 3 shows B" check); after the fix 30 of 30 passed, and 32 of 32 with 8 workers.

Fix: `Preview` renders `<iframe key={code} srcDoc={html} onLoad={post code}>`; a new bundle remounts the iframe and the code is posted from its `load` event, so there is no timer. `docs/architecture.md` updated.
