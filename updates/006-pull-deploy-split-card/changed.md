# Changed
- `install.sh` (new, replaces `deploy/setup-kiosk.sh`): one script for a Pi: apt deps, https clone to `~/home-display`, creates `config/local.js` and `local.env` if missing, writes and enables the server and kiosk units. Safe to re-run.
- `update.sh` (new): `git fetch` + reset to `origin/main`, restart the server unit, reload the kiosk. Ignored local files are kept.
- `server.py`: `--ha` defaults to `$HA_URL`; unit reads `local.env`.
- `config/pages.js` is generic; `config/local.example.js`, `local.env.example` committed; `config/local.js`, `local.env` ignored.
- `laundry` component now takes `machines: [...]` and draws one split card (`bare` cards skip the card chrome in `js/app.js`); layout rows `5fr 2fr`.
- `js/components.js`: fetch timeout 20 s; weather retries after 30 s on failure.
- Docs and archive scrubbed of IPs, stop names, town, coordinates, paths and key paths. `AGENTS.md` deploy section rewritten.
- Repo deleted and recreated public with one clean commit (see end of this entry for status).
- Follow-up: laundry halves stacked vertically (rows `3fr 2fr`). `install.sh` now copies `local.env.example` to `local.env` and `config/local.example.js` to `config/local.js` by default (`HA_URL=… bash install.sh` presets it); Chromium profile moved into `~/home-display/.chromium`; new `uninstall.sh` (disables and deletes the two units, restores the tty1 login, deletes the directory; apt packages stay).
