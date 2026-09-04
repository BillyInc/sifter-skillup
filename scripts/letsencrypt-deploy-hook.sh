#!/usr/bin/env bash
#
# certbot deploy hook: reload nginx after a certificate is renewed.
#
# Install to /etc/letsencrypt/renewal-hooks/deploy/ (see docs/CERT_EXPIRY_CRON.md).
# Everything executable in that directory runs as root after each SUCCESSFUL
# renewal, once per renewed lineage.
#
# WHY THIS EXISTS: that directory was empty on storytime while certbot.timer was
# active. nginx reads its certificate at startup and holds the file open, so
# renewal alone changes nothing that clients see -- certbot writes fresh PEMs,
# reports success, and nginx keeps serving the old certificate until something
# reloads it. The failure is silent by construction: renewal logs say success
# right up until the served certificate expires.
#
# scripts/check-cert-expiry.sh is the detector for that state, because it reads
# what each hostname actually serves over the public interface rather than what
# is on disk. This script is the fix.
#
set -uo pipefail

log() { logger -t levelup-cert-deploy-hook -- "$1"; printf '%s\n' "$1"; }

# RENEWED_DOMAINS and RENEWED_LINEAGE are set by certbot. They are only for the
# log line -- the reload is global, because one nginx process serves every
# lineage on this box.
log "renewed: ${RENEWED_DOMAINS:-<unset>} (${RENEWED_LINEAGE:-<unset>})"

# Reload only after the config parses. A reload against a broken config would
# leave nginx running on the old, now-stale certificate while looking like it
# worked; failing here surfaces in certbot's output instead.
if ! nginx -t 2>/dev/null; then
  log "FATAL: nginx -t failed; NOT reloading. Certificates on disk are fresh but nginx is still serving the old ones."
  nginx -t   # rerun unsuppressed so the reason lands in certbot's output
  exit 1
fi

if systemctl reload nginx; then
  log "nginx reloaded"
else
  log "FATAL: nginx -t passed but 'systemctl reload nginx' failed; still serving the old certificate."
  exit 1
fi
