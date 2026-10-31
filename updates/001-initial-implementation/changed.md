# Changed

## Done
- `index.html` — shell, loads CSS and `js/app.js` as a module.
- `css/theme.css` — M3 colour roles (dark scheme), shape tokens, font token. Single place to restyle.
- `css/app.css` — page grid (`--columns`), card, type-scale classes, row list, forecast strip, kiosk cursor hidden.
- `js/app.js` — page engine: builds page, runs component `refresh` + intervals, rotates on `seconds`, `?page=<id>` preview.
- `js/components.js` — `clock`, `date`, `weather` (Open-Meteo), `calendar` (static events), `transport` (JSON endpoint + mapping), `note`.
- `config/pages.js` — three example pages: `today`, `transport`, `note`.
- `AGENTS.md` — project rules: layout, component contract, repo-explorer rule, updates/ rules, licence notes.
- `CLAUDE.md` → `AGENTS.md` (symlink).
- `.agents/skills/repo-explorer/` — full copy of the skill (`SKILL.md`, `.DS_Store`).
- `.claude/skills/repo-explorer` → `../../.agents/skills/repo-explorer` (symlink; created with out-of-sandbox approval).
- `.claude/launch.json` — `display` preview server config (python http.server on 8080).
- `updates/001-initial-implementation/` — this change's requests, research, changed files.

## Verified
- Served locally on port 8080 and opened in the in-app browser. `today` page renders the clock, date, live Open-Meteo weather (London) and calendar. Console: no errors.
- `?page=transport` renders its "set a url" message when no URL is configured.

## Deployed to Pi (pi@<pi>)
- Host key: user approved trusting the new key. Fingerprint `SHA256:ejVLcAH7…` matched the scan. Stale entry removed from `~/.ssh/known_hosts` (backup at `known_hosts.old`).
- Files copied to `/home/pi/home-display/` (`index.html`, `css/`, `js/`, `config/`). macOS `._*` metadata files removed.
- Server: `python3 -m http.server 8080 --bind 0.0.0.0`, started with nohup, log `/home/pi/home-display.log`. Autostart via user crontab `@reboot`.
- Verified: `http://<pi>:8080/` returns 200 and renders the `today` page from the Mac's in-app browser.
- Pi OS: Debian 13 (trixie), kernel 6.18 rpi-v8, Python 3.13, 415 MB RAM, 26 GB free. No Chromium installed. No display session (SSH only).
- Did not use systemd: `sudo` needs a password, so a system service could not be installed.

## Pi follow-up (temporary kiosk check)
- Installed `chromium` 154 on the Pi via apt (user ran it).
- No X/Wayland session, so `chromium --kiosk` cannot start yet. Checked the page with `chromium --headless=new --screenshot` at 800×480 instead.
- Layout fix for 800×480: `css/app.css` sizes reduced (clock, date, forecast); `config/pages.js` `today` page changed to 3 columns (clock span 2 + date; weather + calendar span 2). Bottom cards no longer clipped.
- Pi system clock reads 2026-10-06 (Mac: 2026-10-24). Date on the display follows it. Fix needs NTP or a manual clock set (root).

## Not done / unfinished
- Kiosk mode: no Chromium on the Pi and no X/Wayland session. Needs `sudo apt install chromium` plus an autostart (e.g. `chromium --kiosk http://localhost:8080`), run by the user with sudo.
- Pi server is not a systemd unit (see above); reboot persistence relies on crontab.
- Pi display test (Chromium kiosk, resolution, performance on Zero 2 W): not run.
- Calendar: static events only; no ICS/Google feed.
- Clock: no drift-aligned timer (see research.md).

## Transport and weather (follow-ups 3–5) — done
- `js/components.js`: `transport` now reads Transitous `stoptimes` for a `stopId` (line pill, headsign, minutes or HH:MM when ≥ 60 min, cancelled trips skipped). Removed the generic `url`/`map` option and the TfL default.
- `css/app.css`: `.row .line` pill; destination text flexes and truncates.
- `config/pages.js`: replaced sample pages. `today` = clock, date, weather (Open-Meteo, town-level <lat/lon>, label "<town>"). `buses` = one card each for <stop> and <stop>. Sample calendar and note pages removed from the config (components remain).
- Redeployed to `/home/pi/home-display/`. Headless screenshots on the Pi show both pages rendering live data. Pi clock now reads correct time.
- Not done: kiosk autostart (still temporary, per follow-up 2).

## Redesign: single page, themes, line colours (follow-up 6) — done
- `data/lines.json`: generated with the jq command in `research.md`.
- `config/pages.js`: one page `home` (clock+date hero card, weather sky card, two departure cards). New `theme` export with light/dark hours. New page options `rows`, component option `variant`.
- `js/app.js`: applies theme from the hour (rechecked every minute), `?theme=` override, `rows`/`variant` support, no rotation when only one page.
- `js/components.js`: weather icons (sun, moon, partly, cloud, fog, rain, snow, storm), rain chance, `is_day`; `clock` gets `date` option; `transport` shows bus/tram glyph and line pills in real TPG colours.
- `css/theme.css`: light scheme plus warm amber/red dark scheme, icon and sky tokens. `css/app.css`: hero and sky cards, line pills, larger next departure.
- Verified in the in-app browser (light and dark, 800×480) and on the Pi with a headless screenshot; redeployed with `data/`.
- Not done: kiosk autostart; no automated test of the theme boundary (checked via `?theme=`).

## Weather graph, pictograms, plain M3 (follow-up 7) — done
- `js/components.js`: `weather` now shows today only: icon, temperature (1 decimal), condition, hi/lo and rain chance, plus an hourly temperature graph (`tempGraph`). Removed the multi-day strip and `days` option. New pictogram icons (two-tone cloud, plain sun disc, drops).
- `css/theme.css`: dark scheme is yellow/amber with no red; light scheme is baseline M3. New `--icon-cloud-front` token. Removed unused tertiary and container tokens.
- `css/app.css`: removed hero/sky variants and forecast styles; added graph styles; clock sized for a narrower card; next departure no longer has a tonal fill.
- `js/app.js` and `config/pages.js`: removed the unused `variant` option; page is now a 10-column grid (clock 4, weather 6, each stop 5).
- `AGENTS.md`: jq command removed; points to `research.md`.
- Verified in the browser (light and dark, 800×480) and on the Pi (headless screenshot); redeployed.
- Not done: kiosk autostart.

## Polish, SF Symbols, kiosk (follow-up 8)
Done:
- `css/app.css`: removed the page fade-in and colour transitions; uniform row height/spacing; fixed-size, flex-centred line pills; fixed-width right-aligned minutes; `.due` blink 3 s `step-end` (1.5 s on, 1.5 s off); weather icon colours by `data-kind`.
- `js/icons.js` (new): SF Symbols as SVG. `js/components.js`: custom SVG icons removed; weather uses SF Symbols; stop header uses one `bus.fill`; arriving departures show the flashing `lightrail` instead of "Due"; graph baseline raised so the min label no longer touches the x-axis labels.
- `deploy/setup-kiosk.sh` (new): installs `cage`, creates `home-display-server` and `home-display-kiosk` systemd units, removes the old crontab/nohup server. `AGENTS.md` documents it and the deploy command.
- Redeployed app files and copied `setup-kiosk.sh` to `/home/pi/setup-kiosk.sh` (syntax-checked on the Pi). Verified in the in-app browser and by headless screenshot on the Pi.
Not done:
- Kiosk startup is NOT active: `sudo` needs a password, so the script has not been run. Run: `ssh -t -i <key> pi@<pi> 'sudo bash ~/setup-kiosk.sh'`.
- The blink and the kiosk were not seen on real HDMI hardware.

## Weather card polish, kiosk running (follow-up 9)
Done:
- `js/components.js` `tempGraph`: horizontal edge-fade mask on the area, axis line, bolder min/max labels, curve range separated from the axis. `css/app.css`: weather spacing and type tuned (icon 12vmin, temperature 8.5vmin, tighter gaps), graph label sizes.
- Deployed to the Pi and restarted the kiosk (via `pkill -u pi -x cage`). Services active; Chromium running. Not yet seen on the physical HDMI screen by me.
- `AGENTS.md` deploy note: restart with `sudo systemctl restart home-display-kiosk` (or `pkill -u pi -x cage` without sudo).
Not done:
- Sonos "now playing" (asked to confirm before starting).
- Passwordless sudo on the Pi (needs the user to run a command; not required for deploys).

## Sonos now playing (follow-up 10)
Done:
- `server.py` (new): static server plus `/api/sonos` proxy. `tests/test_sonos_parse.py` (new): passes against replies captured from the real speaker.
- `js/components.js`: `nowplaying` component (art, title, artist · album, progress bar, play/pause icon; hides when idle). `js/icons.js`: added `play.fill`, `pause.fill`. `css/app.css`: now-playing and compact card styles. `config/pages.js`: bar added at the bottom (host <sonos>), stops show 4 departures, rows `3fr 4fr auto`.
- `deploy/setup-kiosk.sh`: server unit now runs `server.py`. Files and the script are copied to the Pi.
- UI verified in the browser with a stubbed `/api/sonos` reply (light and dark, 800×480, no overflow) and with the card hidden.
Not done / needs the user:
- The Pi still runs the old `http.server` unit until `sudo bash ~/setup-kiosk.sh` is re-run (restarts the server unit with `server.py`).
- Pi → Sonos is blocked (TCP 1400 and ping time out); no live track has been shown on the Pi yet.

## Art theme, backdrop, 1 s blink (follow-up 11)
Done:
- `css/app.css`: blink is now 2 s `step-end` (1 s on, 1 s off); `#backdrop` blur and translucent cards while art-themed. `index.html`: `#backdrop` element. `css/theme.css`: art palette blocks.
- `js/components.js`: `artHueSat`, `applyArtTheme`, `clearArtTheme`; `nowplaying` rethemes on track change and resets when idle.
- `server.py`: `/api/art` same-origin artwork proxy (URL scheme check), `Cache-Control: no-cache` for static files. `tests/test_sonos_parse.py` updated.
- Verified in the browser with a stubbed Sonos reply: dark and light both take the artwork hue and show the blurred backdrop. Deployed to the Pi; `home-display-server` runs the new code and the kiosk was reloaded.
Not done:
- Live Sonos on the Pi: blocked by the network ("No route to host" to <sonos>:1400). Art theme and backdrop have not been seen with a real track.
- Passwordless sudo is not enabled (instructions given).

## Purple scheme + blurred backdrop, LAN (follow-up 12)
Done:
- `js/components.js`: removed colour extraction; `applyArtTheme` just sets the backdrop image and `data-art`. `css/theme.css`: `:root[data-art]` is the baseline purple scheme (dark and light). `css/app.css`: backdrop blur (30 px), translucent cards while playing. `js/app.js`: removed the per-card `data-type`.
- `deploy/setup-kiosk.sh`: server binds `0.0.0.0`; applied on the Pi (`sudo bash ~/setup-kiosk.sh`, passwordless sudo). Display is reachable at http://<pi>:8080/ from the LAN.
- Verified in the browser with a stubbed track (dark, purple, blurred backdrop); deployed; kiosk reloaded.
Not done:
- Live Sonos on the Pi (network: "No route to host" to <sonos>:1400).

## Light mode only (follow-up 13)
Done:
- `css/theme.css`: single baseline purple light scheme; removed dark and art palettes. `js/app.js`: removed theme switching and `?theme=`. `config/pages.js`: removed `theme`. `js/components.js`/`css/app.css`: the art backdrop stays (blur + translucent cards) with no palette change. `AGENTS.md` updated.
- Verified in the browser at 19:27 (stays light, backdrop shows with a stubbed track); deployed to the Pi, kiosk reloaded.
Not done:
- Live Sonos on the Pi (still "No route to host").

## Superseded later
- The Sonos now-playing bar, controls and artwork backdrop (follow-ups 10–12) were removed in `../002-remove-music`; the code is archived there. Dark mode was removed in follow-up 13 above.
