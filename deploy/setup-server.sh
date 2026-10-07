#!/usr/bin/env bash
# One-time server setup: Node.js and nginx from apt, a system user, the systemd service and the nginx site.
# Usage: deploy/setup-server.sh [user@host]
set -euo pipefail

HOST="${1:-root@37.152.182.49}"
cd "$(dirname "$0")"

scp gandomrunners.service "$HOST:/etc/systemd/system/gandomrunners.service"
scp nginx.conf "$HOST:/etc/nginx/sites-available/gandomrunners"
ssh "$HOST" 'set -e
  export DEBIAN_FRONTEND=noninteractive
  # the server reaches no Ubuntu mirror abroad: use ArvanCloud'"'"'s (the original is kept in /root)
  f=/etc/apt/sources.list.d/ubuntu.sources
  [ -f /root/ubuntu.sources.orig ] || cp "$f" /root/ubuntu.sources.orig
  sed -i -E "s#^URIs: .*#URIs: http://mirror.arvancloud.ir/ubuntu/#" "$f"
  apt-get update -q || true
  apt-get install -y -q nodejs nginx rsync
  id gandomrunners >/dev/null 2>&1 || useradd --system --home /srv/gandomrunners --shell /usr/sbin/nologin gandomrunners
  mkdir -p /srv/gandomrunners/app
  ln -sf /etc/nginx/sites-available/gandomrunners /etc/nginx/sites-enabled/gandomrunners
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
  systemctl daemon-reload
  systemctl enable gandomrunners'
