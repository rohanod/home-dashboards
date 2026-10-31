# Research
- Weather: Open-Meteo is reachable from the Pi (200 in 0.2 s). The kiosk's `weather` refresh failed once (cold start, slow Pi, 10 s timeout) and stayed "unavailable" for the full 10 min interval. Fix: 20 s fetch timeout and a retry after 30 s.
- Icons: `sfsymbols-mcp search` shows `washer.fill` and `dryer.fill`; both were exported with `sfsymbols-mcp export` in update 005.
- A force-push does not delete old commits on GitHub (reachable by SHA, and by forks once public). Making the repo public safely means deleting and recreating it.
- Public repo means the Pi can clone over https; no deploy key needed.
- Personal values: config is split into a committed generic `config/pages.js` and git-ignored `config/local.js` (dynamic import with fallback to `config/local.example.js`) plus git-ignored `local.env` (read by the systemd unit via `EnvironmentFile`).
