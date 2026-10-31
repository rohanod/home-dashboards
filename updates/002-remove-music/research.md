# Research

- Nothing new to research. Decision: archive instead of just deleting, so the work can be restored. The removed code is in `removed/` (server with the Sonos proxy and control endpoint, parsing test, the `nowplaying` component and backdrop code, the CSS, and copies of `pages.js` and `icons.js` as they were).
- To restore: copy `server.py.with-sonos` back to `server.py`, re-add the component excerpts to `js/components.js`, the CSS to `css/app.css`, a `#backdrop` div to `index.html`, the SF Symbols (`play.fill`, `pause.fill`, `backward.fill`, `forward.fill`) to `js/icons.js`, and the `nowplaying` entry (host <sonos>) to `config/pages.js`.
- Background: the Pi could not reach the speaker for most of the work (firewall/VLAN) until late; it then returned a live track and artwork. Controls (POST `/api/sonos/control`, same-origin check) were written but never exercised against the speaker.
