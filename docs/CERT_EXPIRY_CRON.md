# Certificate expiry check — on-box cron

`.github/workflows/cert-expiry.yml` used to run this check daily on GitHub's
hosted runners. GitHub Actions billing is currently lapsed, so that schedule was
not running at all — a check that silently stops checking is worse than no
check, because nothing signals that it stopped. The schedule now lives on
storytime, next to the certbot timer it is watching.

The workflow itself is unchanged apart from its trigger, and can still be run
manually from the Actions tab if you want an off-box view of what the public
internet sees.

## Install on storytime

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

## Known limitation: nothing pages you

Cron mails a job's output to the crontab owner, but only if the box has a
working MTA — storytime does not. That means a failing certificate writes to the
log and to nothing else. **Someone has to read the log, or wire an alert.**

Two ways to close that gap, neither of which this change makes for you:

- Append a ping to an external dead-man's-switch (Healthchecks.io has a free
  tier) after the script, so a missed or failing run raises an alert:
  `... ; curl -fsS -m 10 "https://hc-ping.com/<uuid>/$?" > /dev/null`
- Install an MTA (`msmtp` + a relay) and set `MAILTO=` at the top of the
  crontab.

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
