#!/usr/bin/env bash
# Remove the display from this Pi: stops and deletes the two services, then deletes this directory
# (code, settings, browser profile). System packages (git, cage, chromium) are left installed.
# Run on the Pi:  ./uninstall.sh   (-y skips the prompt)
set -euo pipefail
APP_DIR=$(cd "$(dirname "$0")" && pwd)

if [ "${1:-}" != "-y" ]; then
  read -r -p "Remove the services and delete $APP_DIR? [y/N] " ans
  [ "$ans" = y ] || { echo "Cancelled."; exit 1; }
fi

sudo systemctl disable --now home-display-kiosk home-display-server 2>/dev/null || true
sudo rm -f /etc/systemd/system/home-display-kiosk.service /etc/systemd/system/home-display-server.service
sudo systemctl daemon-reload
sudo systemctl start getty@tty1 || true  # console login back on the HDMI screen

cd ~ && rm -rf "$APP_DIR"
echo "Removed."
