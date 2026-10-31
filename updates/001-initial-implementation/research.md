# Research

Method: `repo-explorer` skill. Clones are in `~/.explore/repos/` (shallow, `--depth 1`), not in the project.

## home-screens/home-screens (MIT)
- Next.js smart-display system for Pi in Chromium kiosk mode. Screens hold modules; multi-screen rotation with transitions; touch swipe; per-module scheduling; JSON data store.
- Relevant: screen rotation model (screens of modules, timed rotation), per-module options, clock/calendar/weather/date module set.
- Not adopted: Next.js, editor UI, cloud/Google/iCloud integrations, big dependency tree. Too heavy for Pi Zero 2 W (512 MB RAM) and conflicts with the "code-only, no editor" requirement.

## FrameOS/frameos (AGPL-3.0)
- Nim-based frame OS for e-ink/LCD frames with a scene/node graph and a web editor.
- Relevant: idea of scenes as independent pages; device-level service setup.
- Not adopted: AGPL licence (no code copied), node-editor complexity, Nim/Buildroot toolchain.

## MichMich/MagicMirror (MIT)
- Electron-based modular mirror. Each module is a self-contained folder (`defaultmodules/clock`, `calendar`, `weather`, …) with a DOM region and a refresh cycle.
- Clock: timers aligned to second/minute boundaries with drift correction. Adopted in simplified form: `setInterval` at 1 s for clock, 60 s for date and calendar.
- Module-per-component with one refresh interval each → adopted as the component contract `{ node, refresh, every }`.
- Not adopted: Electron, node_helper backend, moment.js, module loader config.

## material-components/material-web (Apache-2.0)
- Lit-based M3 web components and design tokens (`tokens/`, `md-sys-color-*`, typescale, shape).
- Adopted: M3 token naming (`--md-sys-color-*`, `--md-sys-shape-corner-*`) and the type-scale role names (display, headline, title, body, label). Values are the M3 baseline dark scheme, hand-written.
- Not adopted: the `@material/web` package. A Lit runtime is unnecessary for read-only text cards and adds a build/bundle cost on the Pi.

## Decisions
- Stack: plain HTML + CSS + ES modules. No build step, no npm dependencies. Runs on any browser on the Pi.
- Pages are data (`config/pages.js`); components are functions (`js/components.js`); one page engine (`js/app.js`).
- Data: Open-Meteo for weather (free, keyless, CORS-enabled). Transport: initially a generic JSON endpoint; replaced by Transitous (see below).
- Calendar: static event list in config. ICS parsing deferred until needed (ponytail: skipped, add when a real calendar feed is required).
- Serving: `python3 -m http.server` (stdlib). ES modules need HTTP, not `file://`.
- Open items: clock drift correction not implemented (1 s `setInterval`); fine for a display, add timer alignment if visible jitter appears.

## Transport and weather (follow-ups 3–5)
- Transitous runs MOTIS v2.11 at `https://api.transitous.org/api/v1/`. CORS is open, no key. `geocode?text=` finds stops; `stoptimes?stopId=&n=` returns departures with `routeShortName`, `headsign`, realtime `place.departure`.
- Stops resolved (official spelling has an "s"): `<stop name>` = `<stop-id>`; `<stop name>` = `<stop-id>`. Parent IDs cover both directions.
- <stop> is served by trams 14 and 18, not buses; the other has buses 10 and 53. Both shown.
- Address: per follow-up 5 the home address was geocoded once with OpenStreetMap Nominatim instead of Transitous. The precise coordinates were later replaced by town-level ones (see `../004-privacy-and-polish`).
- Weather stays on Open-Meteo (not Transitous; free, keyless, uses MeteoSwiss data in Switzerland). Interpretation of follow-up 5: "other weather API" = anything but Transitous. Switch if a specific API was meant.

## TPG line colours and redesign (follow-up 6)
- `tpg-lines.info.json` (1.1 MB): top-level `lines[]` (79 entries: `number`, `vehicle`, `colour` hex, plus large `directions[]` with stop lists), `directions`, `sources`, `schema`. Only `number` + `colour` are needed.
- Compact file: `jq -c '[.lines[] | select(.colour != null) | {key: .number, value: .colour}] | from_entries' tpg-lines.info.json > data/lines.json` → 1173 bytes, 79 lines. Our lines: 10 `#006E3D`, 14 `#5A1E82`, 18 `#B82F89`, 53 `#89CBBE`.
- Pill text colour is computed in the client from the hex brightness (dark text on light colours such as 53).
- Theme: dark is the CSS default so a night boot never flashes light; `data-theme="light"` is set between `theme.lightFrom` and `theme.darkFrom`. Dark palette is amber/red with no blue. `?theme=light|dark` overrides for previews.
- Weather icons are inline SVG coloured with theme tokens; Open-Meteo `is_day` switches sun/moon.
- Layout designed on a 2×2 grid (`rows: 2fr 3fr`) for 800×480; sizes are in `vmin` so it scales up.

## Weather graph and pictograms (follow-up 7)
- Open-Meteo `hourly=temperature_2m&forecast_days=1` returns 24 hourly points for today; `daily` gives today's max/min and rain chance; `current.is_day` picks sun/moon.
- Graph is a hand-built inline SVG (quadratic smoothing through midpoints, min/max labels, dashed "now" line and dot). No chart library, to keep the Pi light.
- Reference pictograms: yellow disc sun, light-grey back cloud with a smaller near-white front cloud, small blue drops. Reproduced as flat SVG shapes using theme icon tokens.
- Dark theme recoloured to yellow/amber on warm-neutral greys; light theme back to the baseline M3 purple/neutral. TPG line pills keep their official colours (line 18 is magenta; that is TPG's colour, not theme red).
- `jq` command removed from `AGENTS.md`; it is a one-off and stays documented in this file (above).

## SF Symbols, kiosk (follow-up 8)
- `sfsymbols` CLI exports a large design-template SVG; `sfsymbols-mcp export <name>` (stdout) gives a clean single-path SVG with `fill=currentColor`. Used the latter; `-o` was refused by the sandbox, so output is redirected instead. Exported once to `js/icons.js`: lightrail, bus.fill, sun.max.fill, moon.stars.fill, cloud.sun/moon/fill/fog/rain/snow/bolt.rain.
- Symbols are single-colour, so the weather icons are tinted per kind in CSS. The earlier two-tone pictogram look is gone.
- Licence note: Apple's SF Symbols terms limit use to Apple-platform apps and mockups; using them on a Pi display is outside that. Fine for a private display, not for redistribution.
- Pi: HDMI-A-1 connected, Debian 13, boots to `multi-user.target`, `cage` 0.3.1 available from the Pi apt repo, passwordless sudo is off. Chosen: cage + Chromium (`--kiosk`, Wayland) as a systemd unit on tty1, plus a systemd static server. Needs root, so it is a script for the user to run.
- Not tested on the Zero 2 W: 415 MB RAM is tight for Chromium; watch `journalctl -u home-display-kiosk`.

## Weather card polish, kiosk status (follow-up 9)
- Area fade uses an SVG mask with a horizontal gradient (transparent at both ends), applied to the area only; the curve stays solid.
- Curve range (`top`..`low`) is separate from the axis (`base`) so the min label sits between curve and axis without touching either.
- Kiosk after the user ran the script: `home-display-server` and `home-display-kiosk` enabled and active; `vcgencmd get_throttled` = 0x0 (no under-voltage after the power-supply fix). `sudo` still asks for a password (passwordless sudo not enabled yet).
- Reloading the display without sudo: `pkill -u pi -x cage`; systemd restarts the unit (`Restart=always`).

## Sonos (follow-up 10)
- Sonos speakers expose UPnP/SOAP on port 1400. `AVTransport` `GetTransportInfo` gives `PLAYING`/`PAUSED_PLAYBACK`/`STOPPED`; `GetPositionInfo` gives `TrackMetaData` (DIDL-Lite: title, creator, album, albumArtURI), `TrackDuration`, `RelTime`. Verified against the speaker at <sonos> from the Mac earlier in the session (Spotify track, paused).
- Browsers cannot call it (no CORS), so `server.py` proxies it. Host must be a private IP, so the endpoint is not an open proxy.
- Not handled: speakers that are grouped followers (their `TrackURI` is `x-rincon:`); only the speaker at the configured address is queried. Add ZoneGroupTopology lookup if the speaker is ever a follower.
- The card hides when nothing is playing or paused, or the speaker is unreachable. Page rows are `3fr 4fr auto`; stop cards show 4 departures so everything fits at 800×480 with the bar visible.
- Network: Pi (<pi>) → <sonos>:1400 still timed out (ping too) after the user's firewall rule. The Mac also lost access once it moved to <lan>. Live end-to-end test therefore not possible yet.

## Art theme and backdrop (follow-up 11)
- Colours are read in the browser: the artwork is drawn to a 24×24 canvas; the hue is the circular mean of pixel hues weighted by saturation × mid-lightness, saturation is the weighted mean (clamped 25–70%). That hue drives HSL surfaces in `:root[data-art]` (dark) and `:root[data-art][data-theme="light"]`, so the 06:00/18:00 light/dark switch still applies. Line pill colours (TPG) and weather icon colours are not themed.
- Reading pixels needs a same-origin image, so `server.py` serves artwork at `/api/art?host=…&t=…`, only for the URL the speaker itself reported (http/https only; `file:` and others are dropped), never a caller-supplied URL.
- Backdrop: 64 px canvas copy as `#backdrop`, blurred by CSS (`blur(28px)`), cards slightly translucent. No `backdrop-filter` (too heavy for a Zero 2 W).
- Dev gotcha: the preview browser kept stale CSS from the old server; static responses now send `Cache-Control: no-cache`.
- Pi → Sonos still fails: `/api/sonos` on the Pi returns "No route to host" (errno 113), i.e. the network rejects it; the firewall rule is not yet effective for <pi> → <sonos>:1400.

## Purple + backdrop, LAN (follow-up 12)
- Built a Material You style palette from two dominant artwork hues (per-card tonal containers) and verified it in the browser, then removed it at the user's request: playing now switches to the fixed baseline purple scheme (also at night) with the blurred artwork backdrop; light mode was already purple.
- The backdrop uses the artwork URL directly as a CSS background (blurred with CSS); no canvas or colour extraction, so no CORS/same-origin requirement beyond `/api/art`.
- On the Pi nothing showed because `/api/sonos` fails ("No route to host" to <sonos>:1400), so no track is ever reported; this is the network, not the theme code.
- LAN: server unit binds `0.0.0.0:8080` (Mac → Pi:8080 returns 200). `/api/sonos` only accepts private IPs and `/api/art` only serves the URL the speaker reported, so the LAN exposure is read-only. Passwordless sudo now works, so the setup script was applied directly over SSH.

## Light only (follow-up 13)
- Firewall screenshot: "Dashboard to Sonos" (10001, source a `<client>` client → <sonos>, any port) has 3.9 M hits and sits above the "Isolated Networks" block (30005); its return rule (30003) has 52 hits. A "Family to Rohan Sonos" rule to <lan> exists but is disabled.
- Despite that, from the Pi (wlan0, <pi>) TCP/ping to <sonos> still fails with "No route to host" (an ICMP unreachable reply). Things to check on the router: the rule's source client is this exact Pi, the Sonos is still at <sonos> (DHCP), and the gateway can reach it (ping from the router).
