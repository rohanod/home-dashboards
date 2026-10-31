# Changed
- `config/pages.js`: transport cards commented out (paste back to re-enable); added Washer and Dryer `laundry` cards.
- `js/components.js`: new `laundry` component (status text, minutes left, accent when running). `transport` kept.
- `js/icons.js`: `washer.fill`, `dryer.fill`.
- `server.py`: `--ha <url>` and `GET /api/ha?ids=a.b,c.d` returning entity states; logs in via trusted_networks and caches the token; entity ids validated; read-only.
- `deploy/setup-kiosk.sh`: server unit passes `--ha https://<ha>:8123`.
- Deployed to the Pi, server unit updated, kiosk restarted. Verified: `/api/ha` returns live states; display shows both cards ("Idle").
- Not verified: a running cycle (both machines idle during test), so the "Running"/minutes-left display is untested. The page only gets HA data when served from the Pi (the Mac is not a trusted network).
