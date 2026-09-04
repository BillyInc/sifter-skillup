# Certificate expiry check — on-box cron

`.github/workflows/cert-expiry.yml` used to run this check daily on GitHub's
hosted runners. GitHub Actions billing is currently lapsed, so that schedule was
not running at all — a check that silently stops checking is worse than no
check, because nothing signals that it stopped. The schedule now lives on
storytime, next to the certbot timer it is watching.

The workflow itself is unchanged apart from its trigger, and can still be run
manually from the Actions tab if you want an off-box view of what the public
internet sees.

## First: the renewal itself was broken, not just unmonitored — now fixed

`/etc/letsencrypt/renewal-hooks/deploy/` on storytime was **empty** while
`certbot.timer` was active. nginx reads its certificate at startup and holds the
file open, so renewing does nothing clients can see: certbot writes fresh PEMs,
logs success, and nginx keeps serving the old certificate until something
reloads it.

That was a live path to an expired certificate on a domain whose renewal logs
all say success. Monitoring would only have told you afterwards; the hook is
what prevents it.

**Installed and verified on 4 Sep 2026** as
`/etc/letsencrypt/renewal-hooks/deploy/10-reload-nginx.sh` (`root:root` 0755).
`certbot renew --dry-run --run-deploy-hooks` fired it 28 times with 0 FATAL.
The install command, for reference or for a rebuilt box:

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

Two scripts: `check-cert-expiry.sh` does the checking, and
`cert-expiry-cron.sh` is the daily wrapper cron actually calls — it logs the
result and pings the dead-man's switch described below.

Run these on the server, as a user that can write the log:

```bash
sudo install -m 0755 /path/to/sifter-skillup/scripts/check-cert-expiry.sh \
  /usr/local/bin/levelup-check-cert-expiry
sudo install -m 0755 /path/to/sifter-skillup/scripts/cert-expiry-cron.sh \
  /usr/local/bin/levelup-cert-expiry-cron
sudo touch /var/log/levelup-cert-expiry.log
sudo chown "$USER" /var/log/levelup-cert-expiry.log
```

Then add the cron entry with `crontab -e`:

```cron
# 07:00 UTC daily, matching the schedule the GitHub workflow used. Certbot
# renews at 30 days remaining, so a daily check gives many chances to notice
# before the 21-day failure threshold trips.
0 7 * * * /usr/local/bin/levelup-cert-expiry-cron
```

### Why a wrapper script and not a one-line cron entry

An earlier revision of this document put the logging and ping logic inline in
the crontab. **That line was broken and would not have done what it says.**
Cron treats an unescaped `%` in the command field as a newline, and everything
after the first one becomes the job's stdin — so a one-liner containing
`printf '%s\n'` silently truncates at the percent sign. The failure is quiet:
cron reports no error, the job "runs", and the ping never happens.

Putting the logic in a script removes the entire class of problem — no percent
escaping, no quoting through crontab, and what cron runs is a file you can
execute by hand and read in a diff.

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

### Current state — installed, alerting armed but not yet wired

As of 4 Sep 2026, on storytime:

| | state |
|---|---|
| `/usr/local/bin/levelup-check-cert-expiry` | installed, `root:root` 0755 |
| `/usr/local/bin/levelup-cert-expiry-cron` | installed, `root:root` 0755 |
| `/var/log/levelup-cert-expiry.log` | exists, owned by `ubuntu`, currently empty |
| `ubuntu` crontab | `0 7 * * * /usr/local/bin/levelup-cert-expiry-cron` |
| `/etc/letsencrypt/renewal-hooks/deploy/10-reload-nginx.sh` | installed, `root:root` 0755 |
| `/etc/levelup-cert-ping.env` | exists, `ubuntu:ubuntu` 0600, **`PING_URL` empty** |

Verified by running the job under a cron-like environment
(`env -i PATH=/usr/bin:/bin`): exit 0, log still empty, and all five hostnames
reporting 61 days left.

**The one remaining step is external and needs a human** — see below. Until it
is done the check runs and logs, but nothing watches the checker.

### Applying the alerting

You must create the Healthchecks.io account and check yourself; this repo will
not do it for you, and neither will Claude. Create a free check with
**period 1 day** and **grace 1 day** (the script runs daily; one missed run
should page, two must not be needed), and copy its ping URL.

Then paste the URL into the env file on storytime — that is the whole
remaining change. The cron entry and the wrapper already read it:

```bash
sudo -u ubuntu tee /etc/levelup-cert-ping.env >/dev/null <<'EOF'
PING_URL=https://hc-ping.com/00000000-0000-0000-0000-000000000000
EOF
```

The file is already created with the right owner and mode; keep it
`ubuntu:ubuntu` `0600`. **The owner matters**: a root-owned `0600` file is
unreadable from the `ubuntu` crontab, and the wrapper would then run with
`PING_URL` unset — logging normally while silently never pinging.

`PING_URL` is a capability token. Anyone holding it can send pings and thereby
suppress your alerts, so it stays out of git and out of the crontab itself.

How the wrapper uses it (`scripts/cert-expiry-cron.sh`):

- `rc` is captured *before* anything else runs, so the status reported is the
  check's, not the log append's.
- `/$rc` makes Healthchecks treat a non-zero exit as a **failure** ping, so an
  expiring certificate alerts immediately rather than waiting out the grace
  period.
- `--data-raw "$out"` attaches the check's own output, so the alert names the
  hostname that is expiring — you do not have to SSH in to find out.
- `--retry 3` keeps a transient network blip from raising a false alarm; the
  grace period covers the rest.
- A failed ping is logged but does **not** change the exit status, so the
  monitoring path can never mask the thing being monitored.
- With `PING_URL` empty the wrapper skips the ping entirely and behaves exactly
  like the old plain cron line — which is why it was safe to install ahead of
  the URL.

Verify the wiring end to end before trusting it: run
`/usr/local/bin/levelup-cert-expiry-cron` by hand and confirm the check goes
green in the Healthchecks UI, then confirm the *absence* path by leaving a test
check a day past its grace period.

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
