#!/usr/bin/env bash
#
# Daily wrapper around check-cert-expiry.sh: log locally, and ping an external
# dead-man's switch so that "the check stopped running" is itself an alert.
#
# Install to /usr/local/bin/levelup-cert-expiry-cron and call it from cron with
# no arguments (see docs/CERT_EXPIRY_CRON.md):
#
#     0 7 * * * /usr/local/bin/levelup-cert-expiry-cron
#
# WHY A WRAPPER AND NOT A ONE-LINE CRON ENTRY: cron treats an unescaped '%' in
# the command field as a newline, and everything after the first one becomes
# stdin for the job. A one-liner containing printf '%s\n' therefore does not run
# the command that was written -- it silently truncates at the percent sign. The
# earlier documented one-liner had exactly that bug. Moving the logic into a
# script removes the whole class of problem: no percent escaping, no quoting
# through crontab, and the thing cron runs is a file that can be executed by
# hand and read in a diff.
#
set -uo pipefail

CHECK="${CHECK:-/usr/local/bin/levelup-check-cert-expiry}"
LOG="${LOG:-/var/log/levelup-cert-expiry.log}"
ENV_FILE="${ENV_FILE:-/etc/levelup-cert-ping.env}"

# PING_URL is a capability token: anyone holding it can send pings and suppress
# your alerts. It lives in a 0600 file owned by the crontab user, never in git
# and never in the crontab itself. Sourcing is best-effort on purpose -- if the
# file is missing or unreadable the check must still run and still log.
# shellcheck source=/dev/null
[ -r "$ENV_FILE" ] && . "$ENV_FILE"

out=$("$CHECK" 2>&1)
rc=$?

# The check prints nothing when every hostname is healthy, so the log only grows
# on a bad day and stays readable for years.
[ -z "$out" ] || printf '%s\n' "$out" >> "$LOG"

# No URL configured yet: the local log is the whole mechanism. Exit with the
# check's own status so a manual run still reports the truth.
if [ -z "${PING_URL:-}" ]; then
  exit "$rc"
fi

# /$rc makes Healthchecks treat a non-zero exit as a failure ping, so an
# expiring certificate alerts immediately instead of waiting out the grace
# period. --data-raw attaches the check's own output, so the alert names the
# hostname and nobody has to SSH in to find out which one. --retry 3 keeps a
# transient network blip from raising a false alarm.
#
# The ping's own failure must not mask the check's result, hence the guard and
# the explicit exit below.
if ! curl -fsS -m 10 --retry 3 --data-raw "$out" "$PING_URL/$rc" > /dev/null; then
  printf '%s levelup-cert-expiry-cron: ping failed (check exit %s)\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$rc" >> "$LOG"
fi

exit "$rc"
