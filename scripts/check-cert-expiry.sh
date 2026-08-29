#!/usr/bin/env bash
#
# TLS certificate expiry check for the LevelUp hostnames.
#
# This is the on-box replacement for the .github/workflows/cert-expiry.yml
# schedule. It reports the certificate each hostname actually serves over the
# public interface, which is what certbot's renewal is ultimately responsible
# for keeping fresh.
#
# Exit status:
#   0  every hostname has more than FAIL_BELOW days left
#   1  at least one hostname is expiring soon or could not be reached
#
# By default only problems are printed, so a cron entry stays silent until
# something is actually wrong. Pass -v to print every hostname's status.
#
# Install: see docs/CERT_EXPIRY_CRON.md

set -uo pipefail   # deliberately NOT -e: one unreachable host must not mask the rest

FAIL_BELOW=${FAIL_BELOW:-21}
WARN_BELOW=${WARN_BELOW:-30}
HOSTS=${HOSTS:-"levelup.com.ng www.levelup.com.ng dev.levelup.com.ng api.levelup.com.ng api.dev.levelup.com.ng"}

verbose=0
[ "${1:-}" = "-v" ] && verbose=1

failed=0

for h in $HOSTS; do
  end=""
  # Three attempts: a single refused connection during an nginx reload is not
  # the same thing as a host that is genuinely down.
  for _ in 1 2 3; do
    end=$(echo | timeout 20 openssl s_client -servername "$h" -connect "$h":443 2>/dev/null \
          | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    [ -n "$end" ] && break
    sleep 5
  done

  if [ -z "$end" ]; then
    echo "UNREACHABLE  $h — could not read a certificate after 3 attempts. The host may be down, or not serving TLS at all."
    failed=1
    continue
  fi

  days=$(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 ))

  if [ "$days" -lt "$FAIL_BELOW" ]; then
    echo "EXPIRING     $h — $days days left ($end). Certbot renews at 30 days, so renewal has been failing. Run: sudo certbot renew --dry-run"
    failed=1
  elif [ "$days" -lt "$WARN_BELOW" ]; then
    echo "RENEWING     $h — $days days left ($end) — inside the renewal window, not yet renewed."
  elif [ "$verbose" -eq 1 ]; then
    echo "OK           $h — $days days left ($end)"
  fi
done

exit $failed
