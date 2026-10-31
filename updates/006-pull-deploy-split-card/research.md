# Research
- Weather: Open-Meteo is reachable from the Pi (200 in 0.2 s). The kiosk's `weather` refresh failed once (cold start, slow Pi, 10 s timeout) and stayed "unavailable" for the full 10 min interval. Fix: 20 s fetch timeout and a retry after 30 s.
- Icons: `sfsymbols-mcp search` shows `washer.fill` and `dryer.fill`; both were exported with `sfsymbols-mcp export` in update 005.
- A force-push does not delete old commits on GitHub (reachable by SHA, and by forks once public). Making the repo public safely means deleting and recreating it.
- Public repo means the Pi can clone over https; no deploy key needed.
- Personal values: config is split into a committed generic `config/pages.js` and git-ignored `config/local.js` (dynamic import with fallback to `config/local.example.js`) plus git-ignored `local.env` (read by the systemd unit via `EnvironmentFile`).
- `sfsymbols-mcp export washer.fill` (also after the rebuild to v6.4.2) is one flat path where the basket overlaps the body: nonzero fill merges them, evenodd checkers them. The real symbol has a knockout gap that the flat export does not carry. AppKit renders it correctly, so `washer.fill`/`dryer.fill` are rendered once with a small Swift/AppKit script to PNG (`img/`) and tinted in CSS with `mask`.
- Browsers cannot read geolocation on plain http, so the location comes from HA's `/api/config` (home latitude/longitude), rounded to 2 decimals (~1 km).
- Port 80 for the server needs `AmbientCapabilities=CAP_NET_BIND_SERVICE` since it runs as the normal user.
