# Research

- Why the icon looked odd: it used a hard on/off blink (`step-end`), so the right side of the row went empty each second and the time text had already been replaced by the icon. A soft fade (never fully transparent) avoids content vanishing; the slot keeps its width so nothing shifts.
- Location: weather only needs a forecast cell, so town-level coordinates are enough. Using <town> rounded to two decimals (about 1 km): <lat>, <lon>. Forecast values are the same for the display's purposes.
- Where the precise coordinates, the street address and the Pi's MAC address appeared: `config/pages.js`, the `001` request/research/changed docs, and the archived `002` copy of `pages.js`. All replaced with generic wording. The bus stops (<neighbourhood>) remain in the config because the departures need them; they are public stop names.
- They had also been committed and pushed. The repo is private and only had 2 commits, so the history was replaced with a single clean commit and force-pushed. GitHub may keep the old commits reachable by SHA for a while until it garbage-collects them.
