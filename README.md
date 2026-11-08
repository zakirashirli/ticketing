# Lumen Cinema — course-style edition

The same modern 132-seat cinema application, reorganized as a simple course-style frontend. Adapted from the Lumen project in `zakirashirli/event_management`.

## Timestamp simulation disclosure

These twelve incremental commits were created during a Git learning experiment in November 2026. Their author and committer dates are simulated and are not evidence of work performed on those dates. The approved October 18–November 8 interval uses four milestone periods, not four full weeks. Nothing in the course slides changes this disclosure.

| Milestone | Three simulated dates (+04:00) |
| --- | --- |
| 1 | October 18, 21, 24 |
| 2 | October 25, 28, 31 |
| 3 | November 1, 2, 4 |
| 4 | November 5, 7, 8 |

## Structure

`index.html` supplies semantic regions and accessible controls. `styles.css` supplies presentation, Flexbox/Grid layout and media queries. `app.js` is an external deferred classic script with numbered sections for venue objects, storage helpers, navigation, DOM references and named rendering functions. No imports, framework or build step is needed.

This organization follows the supplied Week 1/3 separation of HTML, CSS and JavaScript, Week 5 deferred scripts, Week 6 named functions/objects/array methods, Week 7 createElement/textContent/event delegation, and Week 8 JSON localStorage patterns. The slides do not mandate one exact directory tree for this project; this is an application of those examples.

## Run and verify

Open `index.html` directly in a browser, or run `node server.mjs` and visit http://127.0.0.1:4174. Port 4174 avoids the earlier project’s preview on 4173. Node is only a convenience for serving and tests; the app itself is plain browser code. Run `node --test tests/state.test.cjs` for domain/storage tests. Optional Edge integration tests use Playwright (`node tests/browser.cjs`, with PLAYWRIGHT_MODULE pointing to an existing installation if needed).

Classic deferred scripts also work without a server. Browser policy may limit localStorage on file URLs; HTTP is recommended when testing persistence. Google Fonts is optional and fallback fonts work offline.

## Functionality

Classic AZN 12, Prime AZN 18, Lounge AZN 26; explicit seat inspection before adding; four seat states; duplicate prevention; removal and totals; storage restoration; all seven map controls; wheel zoom and drag pan; responsive desktop/tablet/mobile layouts. Cart storage is an object with `seatIds` and `updatedAt`, following the Week 8 example. Stored IDs are validated against venue data.

No backend, payments, real availability or multi-user locking. The personally narrated video, public video URL and identity-dependent submission PDF are separate deliverables and have not been created or uploaded.
