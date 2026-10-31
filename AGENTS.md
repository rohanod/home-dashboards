# Custom Home Display — agent instructions

Standalone multi-page home info display for a Raspberry Pi Zero 2 W in Chromium kiosk mode.
Plain HTML/CSS/ES modules, no build step, no runtime deps. Keep it that way unless a change needs otherwise.

## Layout

- `server.py` — static file server (no-cache) plus `/api/ha` Home Assistant state proxy (`--ha <url>`, trusted_networks login); stdlib only
- `index.html` — shell; loads `css/theme.css`, `css/app.css`, `js/app.js`
- `css/theme.css` — Material 3 colour/shape tokens (baseline purple, light mode only; no dark mode)
- `css/app.css` — layout + type-scale classes (`display-clock`, `headline`, `title`, `body`, `label`, …)
- `js/app.js` — page engine: builds a page, runs component refreshes, rotates pages on timers
- `js/components.js` — reusable components (`clock`, `date`, `weather`, `calendar`, `transport` via Transitous, `laundry` via Home Assistant, `note`)
- `config/pages.js` — the only file a user normally edits: pages, timings, component options; personal values come from git-ignored `config/local.js`
- `install.sh` — one-script Pi install (replaces `deploy/setup-kiosk.sh`); `update.sh` — pull from GitHub and reload; `uninstall.sh` — remove services and the install directory
- `data/lines.json` — TPG line number → colour (static, generated once from the TPG dataset; see `updates/001-initial-implementation/research.md`)
- `js/icons.js` — SF Symbols exported once as inline SVG (`sfsymbols-mcp export <name>`), coloured via CSS `currentColor`
- `updates/` — change history (see below)

## Deploy

The Pi pulls from GitHub; nothing is pushed to it directly.

- First time, on the Pi: `curl -fsSL https://raw.githubusercontent.com/rohanod/home-dashboards/main/install.sh | bash` (or `bash install.sh` from a checkout; `HA_URL=… bash install.sh` presets Home Assistant). Installs deps, clones to `~/home-display`, copies the local templates, writes the server and kiosk units. Everything except the two systemd units and apt packages lives in that directory (including the Chromium profile); `./uninstall.sh` removes it.
- Update: commit and push to `main`, then run `./update.sh` in `~/home-display` on the Pi (from the Mac: `ssh -i $PI_KEY $PI_HOST 'cd ~/home-display && ./update.sh'`). It resets to `origin/main`, restarts the server and reloads the kiosk.
- Personal values are git-ignored and live on each machine: `config/local.js` (location, stops, HA entities; template `config/local.example.js`) and `local.env` (`HA_URL`; on the Mac also `PI_HOST`, `PI_KEY`; template `local.env.example`). `update.sh` never touches them.

## Rules

- Read-only display: no touch/buttons/interactive controls.
- Keep styles on M3 tokens and type-scale classes; keep pages visually consistent.
- New component = factory in `js/components.js` returning `{ node, refresh?, every? }`, registered in `components`.
- Keep the Pi Zero 2 W in mind: no heavy libraries, no per-frame work, timers at ≥1 s.
- Do not add a graphical editor or Home Assistant dependency.
- Preview: `python3 server.py` (port 8080) and open `/`. ES modules do not load from `file://`.

## External repository research

- Use the `repo-explorer` skill (`.agents/skills/repo-explorer`) for every external repository exploration, including the reference repos: `home-screens/home-screens`, `FrameOS/frameos`, `MichMich/MagicMirror`, `material-components/material-web`.
- Clones go in `~/.explore/repos/<owner>__<repo>`; do not clone into the project.
- Respect each repo's licence. FrameOS is AGPL-3.0: learn from it, do not copy its code. MagicMirror and home-screens are MIT; material-web is Apache-2.0. Record any reused code and its licence in the relevant `updates/` entry.

## Update history (`updates/`)

Every distinct change gets `updates/NNN-short-name/` with three files:

- `requests.md` — user requests as bullets. Initial prompt is its own section; each follow-up is its own section, in order. Summarise, keep constraints and corrections, and mark where a follow-up changes an earlier requirement. Do not merge follow-ups.
- `research.md` — research done, findings, decisions.
- `changed.md` — what actually changed (files, components, behaviour). Mark unfinished items clearly as not done.

Rules:

- When a request extends an ongoing change, add a new section to that change's `requests.md`; do not lose earlier requests.
- Refer to relevant earlier updates when touching existing functionality.
- Maintain `research.md` and `changed.md` for each change.

## Session / tooling notes

- Do not commit from the agent sandbox. Do not add co-author lines to commits.
- Use `trash` instead of `rm` for deletes.
- Pi access: `PI_HOST` and `PI_KEY` in the git-ignored `local.env` (never write addresses, keys, locations or entity ids into tracked files).
