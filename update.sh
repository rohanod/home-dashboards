#!/usr/bin/env bash
# Pull the latest display from GitHub and reload it. Run on the Pi:  ./update.sh
set -euo pipefail
cd "$(dirname "$0")"

old=$(git rev-parse --short HEAD)
git fetch --quiet origin main
git reset --hard --quiet origin/main
new=$(git rev-parse --short HEAD)

if [ "$old" = "$new" ]; then echo "Already up to date ($new)."; else git log --oneline "$old..$new"; fi

sudo systemctl restart home-display-server
pkill -u "$USER" -x cage || true  # systemd restarts the kiosk, which reloads the page
echo "Reloaded."
