# Research
- HA REST API returns 401 without a bearer token; `trusted_networks` only covers the login flow. From the Pi, `POST /auth/login_flow` (handler `trusted_networks`) returns `create_entry` with a code; `POST /auth/token` exchanges it for a 30 min access token. No stored secret.
- Failed attempts from the Pi earlier triggered an HA IP ban (403 on everything); cleared by the user.
- HA uses a self-signed cert, so the Pi-side server skips verification (LAN only).
- Entities found: washer `input_boolean.washer_running` (on/off); dryer `sensor.dryer_operating_state` (Idle/…) and `sensor.dryer_time_remaining` (min). `input_text.washer_status` exists but its text looked unrelated ("Dryer started at …"), so unused.
