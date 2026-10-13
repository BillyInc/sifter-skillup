#!/usr/bin/env python3
"""Deterministically triage high-recall computational taxonomy scan hits.

This second pass separates evidence-bearing domain/role text from generic
occupational skill aggregates. It narrows research queues but never promotes a
domain, specialization, role, or link automatically.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE = AUDIT / "computational_taxonomy_candidates_2026_10_05.json"
OUT_JSON = AUDIT / "computational_candidate_triage_2026_10_05.json"
OUT_MD = AUDIT / "COMPUTATIONAL_CANDIDATE_TRIAGE_2026-10-05.md"

# A field-specific phrase may justify checking whether a named computational
# specialization exists. It still needs independent authoritative evidence.
FIELD_PHRASES = re.compile(
    r"\b(?:computational\s+(?:social\s+science|sociology|economics|finance|"
    r"linguistics|biology|chemistry|physics|neuroscience|archaeology|humanities|"
    r"geography|ecology|materials?|mechanics|fluid\s+dynamics)|"
    r"bioinformatics|cheminformatics|geoinformatics|computational\s+geometry|"
    r"digital\s+humanities|digital\s+archaeology|computational\s+biology)\b",
    re.I,
)
METHOD_PHRASES = re.compile(
    r"\b(?:machine\s+learning|artificial\s+intelligence|natural\s+language\s+processing|"
    r"text\s+mining|remote\s+sensing|geographic\s+information\s+systems?|\bGIS\b|"
    r"agent[- ]based\s+(?:model(?:ling|ing)|simulation)|network\s+analysis|"
    r"numerical\s+(?:analysis|methods|simulation)|computational\s+model(?:ling|ing)|"
    r"simulation|programming|statistics?|quantitative\s+analysis|optimization|optimisation)\b",
    re.I,
)


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    triaged = []
    tier_counts = Counter()
    metrics = Counter()
    pattern_counts = Counter()

    for domain in source.get("domains", []):
        domain_id = domain.get("domain_id", "")
        direct = []
        role_task = []
        competency_only = []
        for hit in domain.get("hits", []):
            source_type = hit.get("source_type", "")
            text = re.sub(r"\s+", " ", hit.get("text", "")).strip()
            field_matches = sorted({m.group(0).casefold() for m in FIELD_PHRASES.finditer(text)})
            method_matches = sorted({m.group(0).casefold() for m in METHOD_PHRASES.finditer(text)})
            # Canonical/ISCO subgroup records are occupation-family aggregates,
            # not a domain-owned specialization definition.  They can contain
            # broad ESCO/ISCO skills from many member roles (for example,
            # "computational physics" on the generic science-professionals
            # bucket), so they must never promote a domain to a named-field
            # candidate.  Keep the distinct emerging_subgroup layer because it
            # is explicitly curated domain content rather than an ISCO bucket.
            if source_type in {"domain", "domain_layer", "emerging_subgroup"}:
                if field_matches or method_matches:
                    direct.append({
                        "source_type": source_type,
                        "source_key": hit.get("source_key"),
                        "field_phrases": field_matches,
                        "methods_or_tools": method_matches,
                        "text_excerpt": text[:500],
                    })
            elif source_type == "subgroup" and (field_matches or method_matches):
                # Retain hits for transparency and manual rejection, but keep
                # them separate from evidence of domain ownership.
                competency_only.append({
                    "role": hit.get("source_key"),
                    "signal_source": "isco_or_legacy_subgroup_aggregate_not_domain_owned",
                    "field_phrases": field_matches,
                    "methods_or_tools": method_matches,
                    "text_excerpt": text[:300],
                })
            elif source_type == "role_tasks" and (field_matches or method_matches):
                role_task.append({
                    "role": hit.get("source_key"),
                    "field_phrases": field_matches,
                    "methods_or_tools": method_matches,
                    "text_excerpt": text[:500],
                })
            elif source_type == "role_occupational_competencies" and (field_matches or method_matches):
                competency_only.append({
                    "role": hit.get("source_key"),
                    "field_phrases": field_matches,
                    "methods_or_tools": method_matches,
                    "text_excerpt": text[:300],
                })

        explicit_fields = sorted({
            phrase for row in direct + role_task for phrase in row["field_phrases"]
        })
        direct_field_phrases = sorted({
            phrase for row in direct for phrase in row["field_phrases"]
        })
        if direct_field_phrases:
            tier = "research_named_specialization_candidate"
        elif direct or role_task:
            tier = "review_computational_methods_and_role_use_cases"
        elif competency_only:
            tier = "low_confidence_occupational_aggregate_only"
        else:
            tier = "no_specific_signal_after_triage"

        tier_counts[tier] += 1
        metrics["domains_with_direct_scope_text_signal"] += bool(direct)
        metrics["domains_with_role_task_signal"] += bool(role_task)
        metrics["domains_with_occupational_aggregate_signal_only"] += bool(competency_only and not direct and not role_task)
        metrics["unique_role_task_rows"] += len(role_task)
        metrics["unique_field_specific_phrases"] += len(explicit_fields)
        for phrase in explicit_fields:
            pattern_counts[phrase] += 1

        if tier != "no_specific_signal_after_triage":
            triaged.append({
                "domain_id": domain_id,
                "domain_name": domain.get("domain_name"),
                "declared_computational_layer": domain.get("declared_computational_layer", False),
                "triage_tier": tier,
                "direct_scope_signals": direct,
                "role_task_signals": role_task,
                "occupational_aggregate_signals_not_used_as_fit_proof": competency_only,
            })

    report = {
        "schema_version": 1,
        "generated_by": Path(__file__).name,
        "source_report": SOURCE.name,
        "interpretation": (
            "Deterministic triage only. Field-specific phrases create a targeted external-source review queue; "
            "methods/tools indicate possible learning use-cases, not necessarily specializations. "
            "ISCO, ESCO/O*NET optional skills, and lexical hits do not prove domain or role fit. No canonical data is changed."
        ),
        "counts": {
            "catalogue_domains": len(source.get("domains", [])),
            "domains_emitted_for_review": len(triaged),
            "domains_by_tier": dict(sorted(tier_counts.items())),
            "additional_metrics": dict(sorted(metrics.items())),
            "field_specific_phrase_occurrences_by_normalized_phrase": dict(sorted(pattern_counts.items())),
        },
        "domains": triaged,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Computational candidate triage",
        "",
        "> Deterministic research-queue reduction only; no taxonomy or role link is approved by keyword matching.",
        "",
        f"- Catalogue domains scanned: **{len(source.get('domains', []))}**",
        f"- Domains requiring some kind of follow-up: **{len(triaged)}**",
        "",
        "## Triage tiers",
        "",
    ]
    for tier, count in sorted(tier_counts.items()):
        lines.append(f"- `{tier}`: **{count} domains**")
    lines.extend(["", "## Targeted review queue", ""])
    for row in triaged:
        lines.append(f"### {row['domain_id']} — {row['domain_name']} ({row['triage_tier']})")
        if row["direct_scope_signals"]:
            for hit in row["direct_scope_signals"]:
                methods = ", ".join(hit["field_phrases"] + hit["methods_or_tools"])
                lines.append(f"- Direct scope text `{hit['source_type']}` / `{hit['source_key']}`: {methods or 'signal'} — {hit['text_excerpt']}")
        if row["role_task_signals"]:
            for hit in row["role_task_signals"][:8]:
                methods = ", ".join(hit["field_phrases"] + hit["methods_or_tools"])
                lines.append(f"- Role task `{hit['role']}`: {methods or 'signal'} — {hit['text_excerpt']}")
        if row["occupational_aggregate_signals_not_used_as_fit_proof"] and not row["direct_scope_signals"] and not row["role_task_signals"]:
            lines.append("- Only ESCO/O*NET-style aggregated competency text triggered; do not infer this domain is computational.")
        lines.append("")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
