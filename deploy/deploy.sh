#!/usr/bin/env bash
# Builds the site here and ships it to the server. The server can't reach npm,
# so it only runs Next's self-contained build (.next/standalone).
# Usage: deploy/deploy.sh [user@host]
set -euo pipefail

HOST="${1:-root@37.152.182.49}"
cd "$(dirname "$0")/.."

npm run build
# the standalone server doesn't carry public/ and the static chunks: they go next to it
cp -R public .next/standalone/
cp -R .next/static .next/standalone/.next/

rsync -az --delete .next/standalone/ "$HOST:/srv/gandomrunners/app/"
ssh "$HOST" 'chown -R gandomrunners:gandomrunners /srv/gandomrunners/app && systemctl restart gandomrunners && sleep 2 && systemctl is-active gandomrunners'
