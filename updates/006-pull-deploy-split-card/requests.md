# Requests

## Initial prompt
- HDMI output showed "Weather unavailable".
- Stop pushing files to the Pi; push to GitHub and have the Pi pull when asked (`./update.sh`).
- Add a one-script install.

## Follow-ups
- Use the SF Symbols CLI for the washer and dryer icons (a washer and a dryer symbol exist).
- Washer and dryer take only a small section: one card cut in half with a gap and square inner edges, so they clearly read as combined. Changes update 005, where they were two separate cards.
- Remove sensitive info: a local git-ignored config file for location and similar; make the repo public; remove sensitive things from the history.
- Chose to delete and recreate the repo (public) so old objects are really gone.
- Use the real washer symbol (the exported SVG filled the gap around the basket); only add colour, do not modify the glyph. Rebuilt `sfsymbols-mcp` gave the same path, so: "do the manual swift export".
- Visiting the Pi's IP must work (no port) and show the Home Assistant data; HA data goes to the Pi, which serves any web client.
- Always show the dryer's remaining time; cards smaller.
- No hardcoded location: detect it, else get it from Home Assistant.
- Later (ask first): text looks different in weight on different screens/aspect ratios; make it properly responsive.
