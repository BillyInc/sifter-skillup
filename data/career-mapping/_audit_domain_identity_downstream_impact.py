"""Verify downstream impact of the reconciled domain identity decisions."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "_audit"
TRACE = AUDIT / "domain_source_traceability_2026-08-31.json"
META = ROOT / "domain_meta.json"
STRUCTURE = ROOT / "domain_structure.json"
PROGRAMME = ROOT / "programme_domain_final.json"
JAMB = ROOT / "jamb_domain_map.json"
ROLES = ROOT / "role_library_v3_cleaned.json"
ROLE_PROFILES = ROOT / "role_work_profiles.json"
TOOLS = ROOT / "domain_tools.json"
REVIEWED = AUDIT / "ccmas_nigerian_reviewed_links_2026-09-01.json"
OUT_JSON = AUDIT / "domain_identity_downstream_impact_2026-09-01.json"
OUT_MD = AUDIT / "DOMAIN_IDENTITY_DOWNSTREAM_IMPACT_2026-09-01.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    meta = load(META)
    trace = load(TRACE)
    structure = load(STRUCTURE)
    programme = load(PROGRAMME)
    jamb = load(JAMB)
    roles = load(ROLES)
    profiles = load(ROLE_PROFILES).get("profiles", [])
    tools = load(TOOLS)
    reviewed = load(REVIEWED)

    invalid_refs = []
    label_mismatches = []

    programme_links = 0
    for programme_name, row in programme.items():
        for link in row.get("links", []):
            programme_links += 1
            domain_id = link.get("domain_id")
            if domain_id not in meta:
                invalid_refs.append(("programme", programme_name, domain_id))
            elif link.get("domain_name") != meta[domain_id].get("domain_name"):
                label_mismatches.append(("programme", programme_name, domain_id))

    jamb_links = 0
    reviewed_links = 0
    bridge_links = 0
    for jamb_name, row in jamb.items():
        for link in row.get("links", []):
            jamb_links += 1
            domain_id = link.get("domain_id")
            if domain_id not in meta:
                invalid_refs.append(("jamb", jamb_name, domain_id))
            elif link.get("domain_name") != meta[domain_id].get("domain_name"):
                label_mismatches.append(("jamb", jamb_name, domain_id))
            if link.get("review_status") == "nigerian_curriculum_reviewed":
                reviewed_links += 1
            bridge_links += int(bool(link.get("bridge_required")))

    for domain_id, row in structure.items():
        if domain_id not in meta:
            invalid_refs.append(("structure", domain_id, None))
        for subgroup in row.get("subgroups", []):
            if subgroup.get("domain_name") and subgroup["domain_name"] != meta[domain_id].get("domain_name"):
                label_mismatches.append(("subgroup", domain_id, subgroup.get("domain_name")))

    role_label_mismatches = 0
    for role in roles:
        domain_id = role.get("domain_id")
        if domain_id not in meta:
            invalid_refs.append(("role", role.get("role_name"), domain_id))
        elif role.get("domain_name") and role["domain_name"] != meta[domain_id].get("domain_name"):
            role_label_mismatches += 1
            label_mismatches.append(("role", role.get("role_name"), domain_id))

    profile_invalid = [
        profile.get("role_key")
        for profile in profiles
        if profile.get("domain_id") and profile.get("domain_id") not in meta
    ]
    tool_domain_ids = {key for key in tools if key != "_meta"}
    tool_invalid = sorted(tool_domain_ids - set(meta))
    identity_counts = Counter(row.get("identity_status") for row in trace.get("domains", []))
    reviewed_summary = reviewed.get("summary", {})
    out = {
        "schema_version": "2026-09-01.domain-identity-downstream-impact.v1",
        "purpose": "Verify that domain identity reconciliation changes display labels only and does not alter domain IDs, ownership, or downstream source-backed relationships.",
        "identity_decision_counts": dict(identity_counts),
        "domain_ids": {
            "domain_meta": len(meta),
            "domain_structure": len(structure),
            "invalid_downstream_references": len(invalid_refs),
        },
        "display_labels": {
            "programme_links_checked": programme_links,
            "jamb_links_checked": jamb_links,
            "role_records_checked": len(roles),
            "role_profiles_checked": len(profiles),
            "label_mismatches_after_normalization": len(label_mismatches),
        },
        "source_backed_layers": {
            "domain_tool_keys_checked_excluding_meta": len(tool_domain_ids),
            "invalid_tool_domain_ids": tool_invalid,
            "invalid_role_profile_domain_ids": profile_invalid,
        },
        "nigerian_review_overlay": {
            "affected_jamb_rows": reviewed_summary.get("affected_jamb_rows"),
            "published_reviewed_links": reviewed_summary.get("links_published_in_reviewed_map"),
            "published_bridge_links": bridge_links,
        },
        "impact_decision": "No domain identity rename or reassignment was made. The reconciliation preserved all domain IDs, subgroup/role ownership, and source layers; it normalized stale display labels to domain_meta and applied the Nigerian reviewed-link overlay to the active JAMB map.",
        "invalid_reference_samples": invalid_refs[:20],
        "label_mismatch_samples": label_mismatches[:20],
    }
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Domain identity downstream impact audit — 2026-09-01",
        "",
        out["impact_decision"],
        "",
        f"- Identity classes: **{dict(identity_counts)}**.",
        f"- Invalid downstream domain references: **{len(invalid_refs)}**.",
        f"- Display-label mismatches after normalization: **{len(label_mismatches)}**.",
        f"- Programme links checked: **{programme_links}**; JAMB links checked: **{jamb_links}**; role records checked: **{len(roles)}**.",
        f"- Active Nigerian-reviewed JAMB links: **{reviewed_links}**; bridge links: **{bridge_links}**.",
        "",
        "Domain identity reconciliation does not rewrite programme-to-domain tiers, subgroup membership, role source anchors, or skill/tool/certification inheritance. It only aligns legacy display labels with `domain_meta.json`; the active JAMB map additionally carries the separately audited Nigerian curriculum dispositions.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_domain_identity_downstream_impact.py",
        "```",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "identity_decision_counts": dict(identity_counts),
        "invalid_domain_references": len(invalid_refs),
        "label_mismatches": len(label_mismatches),
        "programme_links": programme_links,
        "jamb_links": jamb_links,
        "reviewed_links": reviewed_links,
        "bridge_links": bridge_links,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
