# Changed

Done:
- Initialised git in the project folder (`main`), added `.gitignore`, committed all 31 files with git's default identity and no co-author line.
- Created the private repository https://github.com/rohanod/home-dashboards (`gh repo create --private`) and pushed `main`; `origin` tracks it.
- The dashboard in this folder matches what was tested locally (800×480 and 1920×1080, no console errors from the app, only Transitous API calls).

Not done:
- The Pi was unreachable (user away), so it still runs the previous build with the Sonos bar. Redeploy later with the command in `AGENTS.md` and restart the services.
- The repo is private because it contains home coordinates and the Pi's LAN IP; change visibility on GitHub if that is not wanted.
