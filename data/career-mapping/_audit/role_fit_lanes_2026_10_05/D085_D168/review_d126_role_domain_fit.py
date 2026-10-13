"""Exact-key D126 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D126_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D126_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D126 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "WHO_GLOBAL_TRADITIONAL_MEDICINE_STRATEGY": {"publisher": "World Health Organization", "url": "https://www.who.int/publications/i/item/9789240113176", "locator": "Global Traditional Medicine Strategy 2025–2034: evidence base, safety, quality, appropriate regulation and integration of traditional/complementary/integrative medicine.", "supports": "Global recognition of this as a practice area while emphasizing evidence, safety, regulation and context-specific integration.", "limit": "WHO recognition of the category is not an endorsement of the efficacy or safety of any named therapy or claim in the role descriptions."},
    "WHO_TRADITIONAL_COMPLEMENTARY_MEDICINE_OVERVIEW": {"publisher": "World Health Organization", "url": "https://www.who.int/news-room/feature-stories/detail/traditional-medicine-has-a-long-history-of-contributing-to-conventional-medicine-and-continues-to-hold-promise", "locator": "Overview identifying acupuncture, herbal medicine, homeopathy, traditional Chinese medicine, naturopathy, chiropractic and osteopathy among systems reported worldwide.", "supports": "Global classification context for the named modalities represented in the task descriptions.", "limit": "A descriptive overview is not a clinical evidence assessment, professional license or proof that a therapy treats disease."},
}

DECISIONS = {
    "Healthcare Diagnosing or Treating Practitioners, All Other": ("unresolved", "This residual title has no specific task description beyond a broad catch-all. The actual therapy, method and patient-care activity cannot be established."),
    "Massage Therapists": ("supported", "Performs therapeutic massage of soft tissues and joints; hands-on therapies and massage are within the explicit D126 scope."),
    "acupuncturist": ("supported", "The task specifically performs acupuncture, which is an explicitly named complementary/traditional practice in the D126 scope. This fit classification does not endorse the stated mechanism or efficacy claims."),
    "aromatherapist": ("supported", "The task specifically applies essential-oil aromatherapy, explicitly named in the D126 parent description. This fit classification does not establish treatment efficacy or safety."),
    "chiropractic assistant": ("conditional", "Supports a chiropractor with patient interviews, records and examination assistance. The task is directly attached to a named D126 practice but does not itself establish that the assistant provides the domain's assessment or hands-on treatment; include only as a supervised support role."),
    "complementary therapist": ("conditional", "The available task describes a broad range of complementary approaches, health promotion and wellbeing, but is truncated and does not identify the modality or specific treatment tasks. The category is relevant, but this exact record is not sufficiently specific for an unconditional fit."),
    "herbal therapist": ("supported", "The task specifically uses herbal medicine, a named D126 practice. This is a taxonomy fit only and does not validate the task's disease-treatment claims."),
    "homeopath": ("supported", "The task specifically provides homeopathic remedies, an explicitly named D126 practice. This fit classification does not imply that homeopathy is evidence-based or clinically effective."),
    "massage therapist": ("supported", "Provides therapeutic massage treatments, a hands-on modality within the D126 description."),
    "osteopath": ("supported", "The exact occupation profile identifies osteopathy as its practice; WHO includes osteopathy among traditional/complementary systems reported globally. This does not establish universal regulation or efficacy."),
    "traditional chinese medicine therapist": ("supported", "The task explicitly practices traditional Chinese medicine, including named modalities such as acupuncture and herbal therapies; this fits the D126 practice scope, without validating any treatment claim."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D126"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D126 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"]
        if fit != "unresolved":
            refs.extend(["WHO_GLOBAL_TRADITIONAL_MEDICINE_STRATEGY", "WHO_TRADITIONAL_COMPLEMENTARY_MEDICINE_OVERVIEW"])
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D126", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each task with the parent's explicitly named complementary/traditional modalities and hands-on practice scope. WHO sources establish global category context and highlight the need for evidence, safety and appropriate regulation; they do not validate individual therapies. Conditional is used for support roles attached to the practice or truncated generic records; unresolved is reserved for a catch-all with no task evidence.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D126 role keys were checked against the queue and original task text is retained verbatim.", "The WHO materials are used to establish that the named modalities form a global traditional/complementary practice category, not to certify their clinical effectiveness.", "D126 parent-domain fit is separate from legality, registration, safety, evidence quality, student suitability and student-facing approval; those decisions are not made in this lane.", "The broad complementary-therapist task is truncated, so its fit stays conditional; the all-other residual stays unresolved.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D126 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        why = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {why} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
