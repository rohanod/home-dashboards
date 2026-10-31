# Requests

## Initial prompt
- Remove the transport cards, in config only, so they can be added back.
- In their place add laundry from Home Assistant at `<ha>`. Prefer no credentials: HA is set up with `trusted_networks` for the Pi (`<pi>/32`, `allow_bypass_login`).

## Follow-ups
- Home Assistant is on https (port 8123).
- User is home; HA trusted user was recreated (old id deleted) and HA restarted; later cleared an IP ban on the Pi.
