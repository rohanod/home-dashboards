# Changed

Done:
- `css/app.css`: arriving icon now pulses (`pulse`, 2 s cycle, opacity 1 → 0.2 → 1, ease-in-out) instead of a hard blink. Verified in the browser: animation runs and opacity oscillates.
- `config/pages.js`: weather location is now town-level (lat <lat>, lon <lon>, label "<town>"); address and precise coordinates removed from the code and docs (also from `updates/002-remove-music/removed/pages.js.with-sonos`). Pi MAC address removed from `updates/001-initial-implementation/research.md`.
- Git history replaced by one commit and force-pushed; GitHub repository description now starts with "[AI GENERATED]".

Not done:
- Pi not redeployed (user away); it still runs the previous build.
- The Pi's LAN IP (<pi>), the Sonos LAN IP in archived files and the <neighbourhood> stop names remain in the repo. Say if those should go too.
