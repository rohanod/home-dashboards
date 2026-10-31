#!/usr/bin/env bash
# One-script Pi install: dependencies, checkout from GitHub, server + kiosk units on HDMI.
# On the Pi, as the normal user (it uses sudo):
#   curl -fsSL https://raw.githubusercontent.com/rohanod/home-dashboards/main/install.sh | bash
# or, from a checkout:  bash install.sh   (HA_URL=https://... bash install.sh to preset Home Assistant)
# Everything lives in ~/home-display (code, settings, browser profile) plus two systemd units.
# Safe to re-run. Later updates: ./update.sh   Remove everything: ./uninstall.sh
set -euo pipefail

REPO=https://github.com/rohanod/home-dashboards.git
APP_USER=$USER
APP_DIR=$HOME/home-display
URL=http://localhost:8080/

[ "$(id -u)" -ne 0 ] || { echo "run as the normal user, not root"; exit 1; }

sudo apt-get update -qq
sudo apt-get install -y git cage chromium curl

# Checkout in place (keeps an existing ~/home-display; files from the repo win; ignored local files stay).
mkdir -p "$APP_DIR" && cd "$APP_DIR"
[ -d .git ] || git init -q -b main
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$REPO"
git fetch --quiet origin main
git checkout -q -f -B main origin/main

# Personal settings (git-ignored, never overwritten): copy the templates, edit them later.
[ -f config/local.js ] || cp config/local.example.js config/local.js
if [ ! -f local.env ]; then
  cp local.env.example local.env
  [ -z "${HA_URL:-}" ] || sed -i "s|^HA_URL=.*|HA_URL=$HA_URL|" local.env
fi

sudo tee /etc/systemd/system/home-display-server.service >/dev/null <<UNIT
[Unit]
Description=Home display server (static files, Home Assistant proxy)
After=network.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=-$APP_DIR/local.env
ExecStart=/usr/bin/python3 $APP_DIR/server.py --port 8080 --bind 0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
UNIT

sudo tee /etc/systemd/system/home-display-kiosk.service >/dev/null <<UNIT
[Unit]
Description=Home display kiosk (cage + chromium on tty1)
After=systemd-user-sessions.service getty@tty1.service home-display-server.service
Wants=home-display-server.service
Conflicts=getty@tty1.service

[Service]
User=$APP_USER
PAMName=login
TTYPath=/dev/tty1
TTYReset=yes
TTYVHangup=yes
TTYVTDisallocate=yes
StandardInput=tty-fail
StandardOutput=journal
StandardError=journal
UtmpIdentifier=tty1
UtmpMode=user
ExecStartPre=/bin/sh -c 'until curl -sf $URL >/dev/null; do sleep 1; done'
ExecStart=/usr/bin/cage -s -- /usr/bin/chromium --kiosk --ozone-platform=wayland --noerrdialogs --disable-infobars --disable-session-crashed-bubble --no-first-run --password-store=basic --user-data-dir=$APP_DIR/.chromium $URL
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable home-display-server.service
sudo systemctl restart home-display-server.service
sudo systemctl enable --now home-display-kiosk.service

echo "Done. The display should appear on HDMI."
echo "Edit $APP_DIR/config/local.js (location, entities) and $APP_DIR/local.env (Home Assistant URL), then run $APP_DIR/update.sh to reload."
echo "Logs: journalctl -u home-display-kiosk -f"
