"""Resolve a role's student-facing subgroup route without rewriting ISCO.

ISCO remains the occupational identity.  A reviewed semantic correction may
choose a different catalogue subgroup or an explicit direct domain-to-role
route; those decisions are stored separately so the occupational source code
is never falsified to make the UI path fit.
"""

from __future__ import annotations

import re


def effective_subgroup_code(role: dict) -> str | None:
    """Return the subgroup code used for catalogue routing, if any."""

    fit_status = str(role.get("subgroup_fit_status") or "").strip()
    if fit_status == "direct_domain_role":
        return None

    override = str(role.get("subgroup_override_isco_submajor") or "").strip()
    if re.fullmatch(r"\d{2}", override):
        return override

    isco = re.sub(r"\D", "", str(role.get("isco_group") or ""))
    return isco[:2] if len(isco) >= 2 else None
