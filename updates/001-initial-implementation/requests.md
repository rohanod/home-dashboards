# Requests

## Initial prompt
- Build a lightweight, standalone, multi-page home information display for a Raspberry Pi Zero 2 W with a connected display.
- Minimal, modern Google Material 3 / Material You visual style, consistent across pages.
- Read-only: no touch, buttons or interactive controls.
- Multiple independent pages that switch automatically.
- Reusable components: clocks, dates, calendars, weather, transport.
- Customisable directly in code by a coding agent; no graphical editor.
- Standalone: no Home Assistant. No rooting or OS modification of the Pi.
- Research these repos before building, using the `repo-explorer` skill: home-screens/home-screens, FrameOS/frameos, MichMich/MagicMirror, material-components/material-web. Clocks, info widgets, layouts and page systems are the focus. Existing code may be adapted where licences allow.
- Agent config: copy the `repo-explorer` skill into `.agents/skills/repo-explorer/`; symlink `.claude/skills/repo-explorer` to it; create/update root `AGENTS.md`; symlink root `CLAUDE.md` to `AGENTS.md`; preserve relevant existing instructions.
- `AGENTS.md` must document: use `repo-explorer` for external repos (list the reference repos); maintain `updates/`; summarised per-request bullets; `research.md` and `changed.md` per change; refer to earlier updates.
- Maintain `updates/` with one subdirectory per distinct change, each holding `requests.md`, `research.md`, `changed.md`.
- Pi access given: `pi@<pi>`, key `<key>`.

## Follow-up 1
- Trust the new host key for `<pi>` and deploy the display to the Pi.

## Follow-up 2
- User pasted the output of `sudo apt install chromium` (installed) and a failed `chromium --kiosk` (no X server). Asked to "just do temp for now": no permanent kiosk setup yet.

## Follow-up 3
- Show bus times for <town>, two stops using Transitous.
- Show weather for the user's home address.
- Show the time.

## Follow-up 4
- Correction: the exact stop names are "<stop name>" and "<stop name>".

## Follow-up 5
- Change to follow-up 3: do not use Transitous for the home address; use Transitous only for the <neighbourhood> stops, and some other weather API for the address.

## Follow-up 6
- Use `tpg-lines.info.json` (TPG line data).
- Make the display visually more appealing, with more graphics.
- Light/dark mode by time: light 06:00–18:00; dark after, warm red/yellow tint to help with sleep.
- Show proper TPG line colours.
- One page only: weather, time and bus times together; no multiple pages (changes the earlier multi-page requirement for the current config).
- Use `jq` on the file to extract just the lines and their colours into a compact JSON file for the client.

## Follow-up 7
- Weather: show a temperature graph instead of single points if the API supports it; otherwise show points, but focus on today's weather. (Open-Meteo has hourly data, so a graph is used.)
- Go back to the plain Material look from before; only add pictogram-style visuals like the supplied reference (flat sun disc, two-tone grey cloud, blue drops). Changes follow-up 6's coloured hero/sky cards.
- No red anywhere (changes follow-up 6's red/amber dark theme to yellow/amber only).
- Question: why is the jq command in `AGENTS.md`? It only needs to run once, so remove it from there.

## Follow-up 8
- Remove the colour fade-in when the page loads.
- Make rows consistent in size and spacing; numerals (line pills, minutes) must look centred.
- Replace "Due" with a flashing tram icon (SF Symbol `lightrail`): on 1.5 s, off 1.5 s, repeating.
- Start the persistent startup, with the page output on the HDMI display.
- Weather card: the low temperature must not sit with the x-axis labels.
- Use SF Symbols (via `sfsymbols-mcp export`) to replace custom icons such as the weather and other glyphs.
- One single icon next to the stop name (a bus, or the TPG logo), not a bus and a tram.
- Follow-up to the flashing icon: use `lightrail` for the flashing, not the old bus/tram glyphs.

## Follow-up 9
- Weather card still looks off: fade the light-purple area under the line out towards the sides; tidy the text, cloud, temperature and graph details.
- Help turning on passwordless sudo on the Pi.
- Later: use a Sonos integration to show what music is playing on <sonos>. Do the weather/kiosk work first, then ask before starting Sonos.
- User ran the kiosk setup script. The Pi had been rebooting repeatedly because of a weak power supply; fixed by the user.

## Follow-up 10
- Add a Sonos integration that shows what music is playing on <sonos> (user confirmed after being asked).
- User opened a firewall rule so the Pi can reach the Sonos.

## Follow-up 11
- Change the flashing tram icon timing from 1.5 s to 1 s (1 s on, 1 s off). Changes follow-up 8.
- Theme the display to the album art's colours, but keep light/dark mode somewhat (still follows the 06:00/18:00 switch).
- Use a blurred version of the artwork as the page background.
- Help enabling passwordless sudo on the Pi (asked again).
- User re-ran `setup-kiosk.sh` on the Pi (server unit now runs `server.py`).

## Follow-up 12
- The blurred background and art theming were not showing; wanted the colours of the artwork as the Material theme. Also: make the display available on the LAN.
- Then changed: do not theme the whole thing from the art; just use purple, with the blurred artwork as the background. Replaces the art-derived palette from follow-up 11.
- User enabled passwordless sudo on the Pi.

## Follow-up 13
- No dark mode: light mode only. Removes the 06:00/18:00 light/dark switch and warm dark theme from follow-up 6 and the dark palettes from follow-ups 7 and 11.
- Shared a screenshot of the router firewall rules ("Dashboard to Sonos" and its return rule).
