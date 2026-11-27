# Edge rate limit for `/api/auth/`

The in-app limiter (`backend/auth_rate_limit.py`) is best-effort: it is per-process
memory, resets on restart, and cannot see client addresses unless `TRUST_PROXY_HEADERS`
is set correctly. The edge limit below is the **primary protection** against password
guessing and mail flooding. It is applied by an operator, not by the deploy workflows.

## 1. In the `http {}` block

```nginx
limit_req_zone $binary_remote_addr zone=auth:10m rate=30r/m;
limit_req_status 429;
```

## 2. In each server block, before `location /`

```nginx
location /api/auth/ {
    limit_req zone=auth burst=100 nodelay;
    # copy every proxy_* line and the proxy_pass target from this server's
    # existing `location /` block. Never hardcode a port: dev and prod differ.
}
```

Copy the `proxy_pass` and headers from the existing `location /` of the same server so
the dev and prod upstreams are never mixed up.

## 3. Real client addresses

If nginx sits behind another proxy or load balancer, restore the client address so the
zone keys on users, not on the balancer:

```nginx
set_real_ip_from <balancer CIDR>;
real_ip_header X-Forwarded-For;
```

Then set `TRUST_PROXY_HEADERS=true` and `TRUSTED_PROXY_HOPS=<number of trusted hops>`
in the backend environment (see `backend/.env.example`).

## Deployment requirement for address limits

The per-address limits in the app (claim-code address bucket, guest and wallet
creation) only work when the app can see the real client address. Both of these
must hold in production:

- **Set both** `TRUST_PROXY_HEADERS=true` and `TRUSTED_PROXY_HOPS=<n>` where `<n>` is
  exactly the number of trusted proxies in front of the app (normally **one**: nginx).
  The defaults (`false`, `1`) are unchanged, so a default deploy behind a proxy has
  **no** address limits: they fail open, silently apart from one WARNING per process
  (`auth rate limits: ... per-address limits are inactive`) and
  `"address_limits": "inactive"` on `/health` once it has fired. A wrong hop count has
  the same effect.
- **Never expose the app port directly.** The container listens on `0.0.0.0:8000`
  and `docker-compose.yml` publishes it; bind it to localhost or a private network
  (or firewall it) so only the proxy can reach it. With `TRUST_PROXY_HEADERS=true`
  and a reachable app port, any client can send its own `X-Forwarded-For`: it can
  mint a fresh address key per request (defeating the limits) or fill a victim
  school's shared NAT address bucket from anywhere. The proxy must **overwrite or
  append** the header (`proxy_set_header X-Forwarded-For $remote_addr;` or
  `$proxy_add_x_forwarded_for` for a single hop), never pass a client value through.

## 4. Apply

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Check: more than 130 rapid requests to `/api/auth/login` from one address should start
returning 429.
