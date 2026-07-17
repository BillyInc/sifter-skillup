#!/usr/bin/env python3
"""Load provider credentials from repo .env and backend/.env ONLY.

Never prints secret values. Exposes get_secret(name) and mask(text).
"""
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(_HERE, "..", "..", ".."))

ENV_FILES = [
    os.path.join(REPO_ROOT, ".env"),
    os.path.join(REPO_ROOT, "backend", ".env"),
]

_SECRETS = {}

SECRET_NAMES = [
    "CAREERJET_AFFID",
    "CAREERJET_API_KEY",
    "JOOBLE_API_KEY",
    "JOBBLE_API_KEY",
    "RAPIDAPI_KEY",
    "JSEARCH_RAPIDAPI_KEY",
    "JSEARCH_RAPIDAPI_HOST",
    "OPENWEBNINJA_API_KEY",
    "MARKET_INTELLIGENCE_LLM_API_KEY",
]


def _parse_env_file(path):
    out = {}
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k:
                out[k] = v
    return out


def load():
    """Load secrets from the two env files. Later files do not override earlier non-empty values."""
    global _SECRETS
    merged = {}
    for path in ENV_FILES:
        for k, v in _parse_env_file(path).items():
            if k not in merged or not merged[k]:
                merged[k] = v
    _SECRETS = {k: merged.get(k, "") for k in SECRET_NAMES}
    return {k: bool(v) for k, v in _SECRETS.items()}  # presence map only


def get_secret(name):
    if not _SECRETS:
        load()
    return _SECRETS.get(name, "")


# Values that are credentials. JSEARCH_RAPIDAPI_HOST is a hostname, not a
# secret — excluded from scrubbing so it doesn't false-positive scans.
_NON_SECRET = {"JSEARCH_RAPIDAPI_HOST"}


def all_secret_values():
    """Internal use for output scrubbing/secret-scan only. Do not print."""
    if not _SECRETS:
        load()
    return [v for k, v in _SECRETS.items()
            if v and len(v) >= 8 and k not in _NON_SECRET]


if __name__ == "__main__":
    presence = load()
    print("Credential presence (values never printed):")
    for k, present in presence.items():
        print(f"  {k}: {'set' if present else 'MISSING'}")
