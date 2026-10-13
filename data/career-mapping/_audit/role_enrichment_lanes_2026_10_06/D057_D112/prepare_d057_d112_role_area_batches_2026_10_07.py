"""Partition the exact D057-D112 residual into balanced, auditable work batches.

Assignments are whole-domain-disjoint to keep each reviewer consistent about
the domain's area boundaries. Each lane is split into 100-role batches (last
batch may be shorter). The script only generates an assignment manifest; it
does not make role-fit decisions or edit canonical taxonomy.
"""
from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPORT = HERE / "D057_D112_existing_role_area_fit_deterministic_2026_10_07.json"
OUT = HERE / "D057_D112_role_area_fit_batch_manifest_2026_10_07.json"
OUT_MD = HERE / "D057_D112_role_area_fit_batch_manifest_2026_10_07.md"
BATCH_SIZE = 100
LANES = ("Kierkegaard", "Meitner", "Local")


def domain_number(domain_id: str) -> int:
    return int(domain_id[1:])


def main() -> None:
    report = json.loads(REPORT.read_text(encoding="utf-8-sig"))
    residual = [row for row in report["roles"] if row["decision"]["status"] == "review_required"]
    by_domain: dict[str, list[dict]] = defaultdict(list)
    for row in residual:
        by_domain[row["domain_id"]].append(row)
    for rows in by_domain.values():
        rows.sort(key=lambda row: (row["role_title"].casefold(), row["role_key"]))

    # Greedy whole-domain bin packing: large domains first; deterministic
    # domain-id tie-break and lane-order tie-break.
    lane_domains: dict[str, list[str]] = {lane: [] for lane in LANES}
    lane_counts = {lane: 0 for lane in LANES}
    ordered_domains = sorted(by_domain, key=lambda did: (-len(by_domain[did]), domain_number(did)))
    for did in ordered_domains:
        lane = min(LANES, key=lambda name: (lane_counts[name], LANES.index(name)))
        lane_domains[lane].append(did)
        lane_counts[lane] += len(by_domain[did])

    lanes = {}
    for lane in LANES:
        domains = sorted(lane_domains[lane], key=domain_number)
        rows = [row for did in domains for row in by_domain[did]]
        batches = []
        for offset in range(0, len(rows), BATCH_SIZE):
            group = rows[offset:offset + BATCH_SIZE]
            batches.append({
                "batch_number": len(batches) + 1,
                "batch_size": len(group),
                "role_keys": [row["role_key"] for row in group],
                "status": "not_started",
            })
        lanes[lane] = {
            "assigned_role_count": len(rows),
            "assigned_domains": domains,
            "batch_count": len(batches),
            "batches": batches,
        }

    all_keys = [key for lane in LANES for batch in lanes[lane]["batches"] for key in batch["role_keys"]]
    assert len(residual) == report["counts"]["exact_residual_roles"]
    assert len(all_keys) == len(residual)
    assert len(set(all_keys)) == len(all_keys)
    assert set(all_keys) == {row["role_key"] for row in residual}
    assigned_domains = [did for lane in LANES for did in lanes[lane]["assigned_domains"]]
    assert len(assigned_domains) == len(set(assigned_domains))

    payload = {
        "schema_version": "2026-10-07.d057-d112.role-area-fit-batch-manifest.v1",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_report": str(REPORT.relative_to(HERE.parents[4])).replace("\\", "/"),
        "scope": "Exactly the rows whose current deterministic decision is review_required; no role omitted or duplicated.",
        "residual_role_count": len(residual),
        "batch_size_target": BATCH_SIZE,
        "partition_method": "Greedy balanced whole-domain partition, deterministic tie-breaks; then batches of 100 within each lane.",
        "canonical_files_edited": False,
        "lanes": lanes,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D057-D112 role/area-fit batch manifest — 2026-10-07", "",
        f"Residual roles assigned exactly once: **{len(residual)}**. Batch target: **{BATCH_SIZE}** roles.",
        "Whole domains are disjoint across reviewers; this keeps area-boundary interpretation consistent within each domain. The final batch per lane may be shorter.",
        "Canonical data is not edited by this manifest.", "",
    ]
    for lane in LANES:
        info = lanes[lane]
        lines += [f"## {lane} — {info['assigned_role_count']} roles / {info['batch_count']} batches", "",
                  "Domains: " + ", ".join(info["assigned_domains"]), ""]
        for batch in info["batches"]:
            lines.append(f"- Batch {batch['batch_number']:02d}: {batch['batch_size']} roles")
        lines.append("")
    lines += ["## Batch disposition requirements", "",
              "For each role, record the authoritative role/task source and locator; compare the actual tasks to the global area boundary, exclusions, and sources; separately verify parent-domain fit; disposition as one supported area, multiple justified routes, direct domain-to-role, not-fit, duplicate/alias, or unresolved with a precise evidence gap. Do not infer fit from title or ISCO/ESCO membership. Save a checkpoint after each batch and continue to the next assigned batch.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({lane: {"roles": lanes[lane]["assigned_role_count"], "domains": lanes[lane]["assigned_domains"], "batches": [b["batch_size"] for b in lanes[lane]["batches"]]} for lane in LANES}, indent=2))


if __name__ == "__main__":
    main()
