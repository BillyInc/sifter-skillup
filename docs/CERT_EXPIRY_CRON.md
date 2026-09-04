# Certificate expiry check — on-box cron

`.github/workflows/cert-expiry.yml` used to run this check daily on GitHub's
hosted runners. GitHub Actions billing is currently lapsed, so that schedule was
not running at all — a check that silently stops checking is worse than no
check, because nothing signals that it stopped. The schedule now lives on
storytime, next to the certbot timer it is watching.

The workflow itself is unchanged apart from its trigger, and can still be run
manually from the Actions tab if you want an off-box view of what the public
internet sees.

## First: the renewal itself is broken, not just unmonitored

`/etc/letsencrypt/renewal-hooks/deploy/` on storytime is **empty**, and
`certbot.timer` is active. nginx reads its certificate at startup and holds the
file open, so renewing does nothing clients can see: certbot writes fresh PEMs,
logs success, and nginx keeps serving the old certificate until something
reloads it.

That is a live path to an expired certificate on a domain whose renewal logs all
say success. Monitoring would only tell you afterwards; installing the hook is
what prevents it:

```bash
sudo install -m 0755 /path/to/sifter-skillup/scripts/letsencrypt-deploy-hook.sh \
  /etc/letsencrypt/renewal-hooks/deploy/10-reload-nginx.sh
```

Verify without waiting for a real renewal — `--dry-run` exercises the hook:

```bash
sudo certbot renew --dry-run
sudo journalctl -t levelup-cert-deploy-hook -n 20
```

The LevelUp certificates expire 5 Nov 2026, so certbot will first attempt these
renewals around 6 Oct 2026. Other lineages on this box renew sooner — as of
4 Sep 2026 `api.kys.dev.levelup.com.ng` had 29 days left and is already inside
the renewal window.

## Install the expiry check on storytime

Run these on the server, as a user that can write the log:

```bash
sudo install -m 0755 /path/to/sifter-skillup/scripts/check-cert-expiry.sh \
  /usr/local/bin/levelup-check-cert-expiry
sudo touch /var/log/levelup-cert-expiry.log
sudo chown "$USER" /var/log/levelup-cert-expiry.log
```

Then add the cron entry with `crontab -e`:

```cron
# 07:00 UTC daily, matching the schedule the GitHub workflow used. Certbot
# renews at 30 days remaining, so a daily check gives many chances to notice
# before the 21-day failure threshold trips.
0 7 * * * /usr/local/bin/levelup-check-cert-expiry >> /var/log/levelup-cert-expiry.log 2>&1
```

The script prints nothing when every hostname is healthy, so the log only ever
grows on a bad day. Check it with:

```bash
tail -n 50 /var/log/levelup-cert-expiry.log
```

Run it by hand with `-v` to see every hostname, healthy or not:

```bash
/usr/local/bin/levelup-check-cert-expiry -v
```

## Alerting: use an external dead-man's switch

Cron mails a job's output to the crontab owner, but only if the box has a
working MTA — storytime has none (`sendmail`, `msmtp`, `ssmtp`, `mail` are all
absent). Without alerting, a failing certificate writes to a log file and to
nothing else, and the failure mode that actually matters is worse than that:
**if the cron entry is missing or cron never fires it, the log is not merely
quiet — it is never created.** Silence is indistinguishable from health.

Two options were considered:

| | Dead-man's switch (Healthchecks.io free tier) | `msmtp` as a sendmail shim + `MAILTO=` |
|---|---|---|
| Catches "job never ran" | **Yes** — that is the entire mechanism | No — a job that does not run sends no mail |
| New packages on the box | None; `curl` is already at `/usr/bin/curl` | `msmtp` + `msmtp-mta`, and it diverts `/usr/sbin/sendmail` |
| Resident memory | None; one short-lived curl per day | Small, but the box has ~270 MB free with 2.4 GB already swapped |
| Secrets to manage | A ping URL (a capability token — treat as a secret) | SMTP host, username, password on disk in `msmtprc` |
| Deliverability | HTTPS out; already required for certbot/ACME anyway | Needs a relay; mail from a bare EC2 IP is widely dropped |
| Failure of the alerting path itself | Visible — a missed ping alerts | Silent — a bad relay password just loses the mail |

**Recommendation: the Healthchecks.io dead-man's switch.**

The decisive point is the first row. Certbot's own `certbot.timer` already
renews the certificate; this check exists to notice when that has stopped
working. An emailed check only reports on runs that happen, so it cannot report
the case where the check itself has stopped — which is exactly what happened to
the GitHub Actions schedule this cron replaced, and exactly what has happened
here (see below). A dead-man's switch inverts the responsibility: the monitor
expects a ping on a schedule and alerts on its absence, so a deleted crontab, a
stopped `cron`, a full disk, or a rebooted box all raise the same alarm.

The secondary points reinforce it: no package installs, no MTA, no resident
process, and no SMTP credentials on a box that is already memory-tight and
serving five sites.

### Current state — the cron is NOT installed

As of this writing, on storytime:

- `/usr/local/bin/levelup-check-cert-expiry` — does not exist
- `/var/log/levelup-cert-expiry.log` — does not exist
- The `ubuntu` crontab contains only the `@reboot ... pm2 resurrect` line; no
  crontab on the box mentions the cert check, and there is no matching
  `/etc/cron.d` entry or systemd timer

`certbot.timer` itself is healthy and enabled (twice daily, last fired within
the day), so certificates are still renewing — but nothing is watching it. The
install steps above still need to be run.

### Applying the alerting

You must create the Healthchecks.io account and check yourself; this repo will
not do it for you. Create a free check with **period 1 day** and **grace 1 day**
(the script runs daily; one missed run should page, two must not be needed), and
copy its ping URL.

Then install the script per the section above and add this single crontab line
with `crontab -e`. Replace the placeholder — do **not** commit the real URL:

```cron
# Daily TLS expiry check at 07:00 UTC, with a dead-man's-switch ping.
# PING_URL is a secret: anyone holding it can suppress your alerts.
# Replace <HEALTHCHECKS-PING-URL> with the check's URL, e.g.
#   https://hc-ping.com/00000000-0000-0000-0000-000000000000
0 7 * * * out=$(/usr/local/bin/levelup-check-cert-expiry 2>&1); rc=$?; [ -z "$out" ] || printf '%s\n' "$out" >> /var/log/levelup-cert-expiry.log; curl -fsS -m 10 --retry 3 --data-raw "$out" "<HEALTHCHECKS-PING-URL>/$rc" > /dev/null
```

What each part does:

- `rc=$?` is captured *before* anything else runs, so the exit status reported
  is the script's, not the log append's.
- `/$rc` makes Healthchecks treat a non-zero exit as a **failure** ping, so an
  expiring certificate alerts immediately rather than waiting for a timeout.
- `--data-raw "$out"` attaches the script's own output to the ping, so the alert
  email says *which* hostname is expiring — you do not have to SSH in to find
  out.
- `--retry 3` keeps a transient network blip from raising a false alarm; the
  grace period covers the rest.
- Output still goes to the log file, so the on-box history is unchanged.

Because the URL is a secret, keep it out of git. If you would rather not have it
in the crontab either, put it in a file owned by the crontab user and source it:

```cron
0 7 * * * . /etc/levelup-cert-ping.env; out=$(/usr/local/bin/levelup-check-cert-expiry 2>&1); rc=$?; [ -z "$out" ] || printf '%s\n' "$out" >> /var/log/levelup-cert-expiry.log; curl -fsS -m 10 --retry 3 --data-raw "$out" "$PING_URL/$rc" > /dev/null
```

with `/etc/levelup-cert-ping.env` containing `PING_URL=...`. Mode `0600` is
right, but the owner must be the user whose crontab this is — a root-owned
`0600` file is unreadable from a user crontab, and `.` failing there leaves
`PING_URL` unset, so the ping silently goes to a URL with no UUID:

```bash
sudo install -o "$USER" -g "$USER" -m 0600 /dev/null /etc/levelup-cert-ping.env
sudo -u "$USER" tee /etc/levelup-cert-ping.env <<< 'PING_URL=<HEALTHCHECKS-PING-URL>'
```

Verify the wiring end to end before trusting it: run the command by hand and
confirm the check goes green in the Healthchecks UI, then confirm the *absence*
path by leaving it a day past the grace period on a test check.

## Tuning

The thresholds and hostname list are environment variables, so they can be
overridden in the cron line without editing the script:

| Variable | Default | Meaning |
|---|---|---|
| `FAIL_BELOW` | `21` | Days remaining below which the check exits non-zero |
| `WARN_BELOW` | `30` | Days remaining below which it reports "renewing" |
| `HOSTS` | the five LevelUp hostnames | Space-separated hostnames to check |

Keep `WARN_BELOW` at 30: that is certbot's own renewal point, so a host sitting
below 30 days for more than a day or two means renewal is not happening.
