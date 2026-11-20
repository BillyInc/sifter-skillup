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

## 4. Apply

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Check: more than 130 rapid requests to `/api/auth/login` from one address should start
returning 429.
