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

# A non-zero exit with nothing on stdout is the check failing to run at all --
# missing, not executable, killed. Left as-is that lands in the healthy branch
# below and writes an "ok" heartbeat, so with no PING_URL configured a check
# that never ran is indistinguishable from five healthy certificates. Give it
# words so it logs, pings, and reads correctly.
if [ "$rc" -ne 0 ] && [ -z "$out" ]; then
  out="levelup-cert-expiry-cron: $CHECK exited $rc with no output (missing, not executable, or killed?)"
fi

# The check prints nothing when every hostname is healthy, so the log only grows
# on a bad day and stays readable for years.
#
# But a write that fails must not pass for health. If the append is ignored, a
# full disk or an unwritable log sends a success ping on every healthy day --
# and the whole argument for a dead-man's switch over email is that storage and
# scheduling failures raise the same alarm as an expiring certificate. So a
# failed write is folded into both the payload and the exit status.
log_failed=0
if [ -n "$out" ]; then
  printf '%s\n' "$out" >> "$LOG" || log_failed=1
else
  # Nothing to report, so nothing would be written -- and an untested write is
  # an untested failure mode. The heartbeat is a fixed-size file rewritten in
  # place, which exercises the filesystem for real (a full disk fails on write,
  # not on open) without growing the log on healthy days.
  printf '%s ok\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "${LOG%.log}.heartbeat" || log_failed=1
fi

if [ "$log_failed" -ne 0 ]; then
  out="${out:+$out
}levelup-cert-expiry-cron: FAILED writing under $(dirname "$LOG") -- disk full or permissions. Certificate status above (if any) was still measured."
  [ "$rc" -eq 0 ] && rc=1
fi

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
