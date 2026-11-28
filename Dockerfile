FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

RUN groupadd -r appuser && useradd -r -g appuser -m appuser
WORKDIR /app

# Copy dependency files first for layer caching
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies (no dev deps in production)
RUN uv sync --frozen --no-dev --no-install-project

# Copy application code
COPY backend/ .

RUN chown -R appuser:appuser /app \
    && mkdir -p /home/appuser/.cache/uv \
    && chown -R appuser:appuser /home/appuser
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Proxy settings are deliberately NOT baked in. Behind exactly one trusted proxy, set
# TRUST_PROXY_HEADERS=true and TRUSTED_PROXY_HOPS=1 in the environment, and never publish
# this port directly: otherwise per-address auth/claim limits are off (unset) or
# spoofable via X-Forwarded-For. See docs/ops/nginx-auth-rate-limit.md.
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
