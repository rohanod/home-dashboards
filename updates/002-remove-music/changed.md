# Changed

Done:
- `server.py`: back to a plain static server (still no-cache; binds 127.0.0.1 by default, the Pi unit passes `--bind 0.0.0.0`).
- `js/components.js`: removed `nowplaying`, the artwork backdrop helpers and the now-unused icon imports. `js/icons.js`: removed `play.fill`, `pause.fill`, `backward.fill`, `forward.fill`.
- `css/app.css`: removed now-playing, controls, backdrop and compact-card styles. `index.html`: removed `#backdrop`.
- `config/pages.js`: removed the Sonos entry; layout back to two rows (`2fr 3fr`) with 5 departures per stop.
- `tests/` removed (only held the Sonos parsing test). `AGENTS.md` and `deploy/setup-kiosk.sh` text cleaned.
- Tested locally (800×480 and 1920×1080): all four cards render, no overflow, only Transitous API calls, no `/api/sonos` requests.
- Removed code archived in `removed/`.

Not done:
- The Pi still runs the previous build (with the Sonos bar; it hides itself when the speaker is unreachable). Redeploy it when the Pi is reachable: see the deploy command in `AGENTS.md`, then `sudo systemctl restart home-display-server home-display-kiosk` (or `pkill -u pi -x cage`).
