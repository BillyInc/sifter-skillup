"""Materialize disjoint D113-D168 review batches into individual review files.

This helper only reads lane-batch JSON and writes files beside itself. It never
loads or writes canonical taxonomy inputs. Existing per-domain reviews are not
overwritten.
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def write_batch(batch_path: Path) -> list[str]:
    batch = json.loads(batch_path.read_text(encoding="utf-8"))
    ids: list[str] = []
    output_pairs = [
        (HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.json",
         HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.md")
        for row in batch["domains"]
    ]
    present = [json_path.exists() and md_path.exists() for json_path, md_path in output_pairs]
    if all(present):
        return [row["domain_id"] for row in batch["domains"]]
    if any(json_path.exists() or md_path.exists() for json_path, md_path in output_pairs):
        raise FileExistsError(f"Partially materialized batch; inspect before writing: {batch_path.name}")
    for row in batch["domains"]:
        domain_id = row["domain_id"]
        ids.append(domain_id)
        json_path = HERE / f"{domain_id}_specialization_candidate_review_2026_10_05.json"
        md_path = HERE / f"{domain_id}_specialization_candidate_review_2026_10_05.md"
        json_path.write_text(json.dumps(row, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        areas = row.get("candidate_areas") or []
        area_md = "\n".join(
            f"- **{area['label']}** — {area['scope']}"
            + (f" Boundary: {area['route_boundary']}" if area.get("route_boundary") else "")
            for area in areas
        ) or "- No separate specialization is justified by the reviewed evidence; use the explicit disposition below."
        source_md = "\n".join(
            f"- [{s['publisher']}: {s['title']}]({s['url']}) — {s['locator']} Supports: {s['supports']} Limit: {s['limitation']}"
            for s in row.get("sources", [])
        )
        current = "; ".join(row.get("current_subgroups", [])) or "No current subgroup records."
        md = f"""# {domain_id}: {row['domain_name']} — specialization audit

Status: `{row['review_status']}`. This is a source-grounded candidate review, not canonical taxonomy approval or academic-body sign-off.

## Existing structure

Current subgroup-record count: **{row['current_subgroup_count']}**. Current records: {current}

{row['current_state']}

## Scope and proposed disposition

Parent boundary: {row['parent_scope_disposition']}

{row['decision']}

## Candidate areas of specialization

{area_md}

## Boundary audit

- Omissions / over-splitting: {row['omissions_and_over_splitting']}
- Computational signals: {row['computational_signal']}
- Jurisdiction note: {row['jurisdiction_note']}
- No-specialization disposition: {row.get('no_specialization_disposition') or 'Not applicable: evidence supports candidate area(s), subject to the stated residuals.'}

## Evidence and limits

{source_md}

Sources support discipline and practice distinctions; they do not by themselves establish a universal number of student-facing areas. Current occupational-group membership is not used as proof of domain/subgroup correctness. No role-to-specialization mapping is made.
"""
        md_path.write_text(md, encoding="utf-8")
    return ids


def main() -> None:
    batches = sorted(HERE.glob("D*_D*_reviews_checkpoint_*.json"))
    for path in batches:
        ids = write_batch(path)
        print(f"Verified {len(ids)} review pairs from {path.name}: {ids[0]}–{ids[-1]}")


if __name__ == "__main__":
    main()
