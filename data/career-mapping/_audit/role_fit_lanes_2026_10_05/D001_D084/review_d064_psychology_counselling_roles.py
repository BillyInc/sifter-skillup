"""Build exact-key D064 Psychology and Counselling role-fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D064_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D064_role_domain_fit_review_2026_10_05.md"
WHO_MENTAL_HEALTH = "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
ONET_CLINICAL_PSYCHOLOGISTS = "https://www.onetonline.org/link/summary/19-3033.00"
ONET_MARRIAGE_FAMILY_THERAPISTS = "https://www.onetonline.org/link/summary/21-1013.00"
ONET_MENTAL_HEALTH_COUNSELORS = "https://www.onetonline.org/link/summary/21-1014.00"
ONET_SUBSTANCE_ABUSE_COUNSELORS = "https://www.onetonline.org/link/summary/21-1011.00"

DECISIONS = {
    "assistant clinical psychologist": ("supported", "The role assists with psychological assessment and therapy for patients in clinical/private-practice settings; those tasks directly fit the psychology and counselling scope. This fit disposition does not certify the assistant's legal scope of practice.", None),
    "bereavement counsellor": ("supported", "The task is direct counselling and support for people and families coping with death and grief, including crisis and community support.", None),
    "clinical psychologist": ("supported", "The task directly assesses, diagnoses, rehabilitates and treats mental, emotional and behavioural conditions using psychological methods.", None),
    "drug and alcohol addiction counsellor": ("supported", "The task directly counsels people and families affected by substance addiction and includes recovery monitoring, crisis intervention and group therapy.", None),
    "educational counsellor": ("supported", "The task provides students emotional/personal support and counselling on behavioural, social and school concerns, directly matching counselling in an educational setting.", None),
    "educational psychologist": ("supported", "The task combines psychological assessment, intervention and consultation for students in educational institutions; this directly fits educational psychology.", None),
    "family planning counsellor": ("conditional", "The supplied task focuses on reproductive choices, contraception and health-practice information. The fit is limited to counselling/support duties; routine clinical family-planning information alone is not psychology or mental-health counselling.", "the assigned duties include person-centred counselling/support beyond provision of reproductive-health information"),
    "health psychologist": ("supported", "The role applies psychology to health behaviour, illness prevention, healthy behaviour and counselling, directly matching health psychology.", None),
    "life coach": ("conditional", "The task supports goal-setting and personal development and calls itself counselling/guidance, but does not establish psychological assessment or treatment. It belongs only where the work is genuinely a counselling service, not general coaching or performance consulting.", "a documented counselling remit involving client personal difficulty; no claim of psychological diagnosis or treatment"),
    "marriage counsellor": ("supported", "The task provides couple/family counselling and therapy for relationship crises, depression and substance-related challenges, directly fitting counselling.", None),
    "mental health and substance abuse social workers": ("supported", "The task assesses and treats mental, emotional and substance-use problems through therapy, crisis intervention, case management and client advocacy; it directly fits the mental-health counselling scope.", None),
    "mental health counselors": ("supported", "The task explicitly counsels individuals and groups to promote mental and emotional health and address mental-health concerns.", None),
    "mental health social worker": ("supported", "The role counsels and supports people with mental, emotional or substance-use problems, monitors recovery, and provides therapy/crisis intervention.", None),
    "mental health support worker": ("conditional", "The supplied task describes treatment, personalised recovery support and crisis intervention, but the title and task bundle do not establish the psychological or clinical scope/qualification. The D064 fit is limited to assigned mental-health support duties.", "the post is explicitly a mental-health service role with defined, supervised support duties; do not imply independent psychological practice"),
    "psychologist": ("supported", "The task studies human behaviour and mental processes and provides client services/counselling for mental-health and life difficulties, directly matching the parent scope.", None),
    "psychotherapist": ("supported", "The task uses psychotherapeutic methods to treat psychological, psychosocial and behavioural disorders and support well-being, directly fitting the domain.", None),
    "sexual violence counsellor": ("supported", "The task provides crisis care and counselling for people exposed to sexual assault/rape and connects them with protective/legal supports, directly matching specialist counselling for personal trauma.", None),
    "social counsellor": ("supported", "The task provides person-centred support for personal and relationship difficulties, inner conflict, depression and addiction, directly matching counselling.", None),
    "substance misuse worker": ("supported", "The task provides counselling, recovery monitoring, crisis intervention and group therapy for people experiencing substance misuse, directly fitting the counselling/mental-health remit.", None),
    "volunteer mentor": ("unsupported", "The supplied task concerns volunteer integration, orientation and practical/community support. It does not establish counselling, psychological assessment or mental-health work; personal development language alone is insufficient.", None),
}


def _urls(refs: list[str]) -> list[str]:
    result = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            result.append(url)
    return list(dict.fromkeys(result))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D064"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 20 or len(by_name) != 20 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D064 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([WHO_MENTAL_HEALTH, ONET_CLINICAL_PSYCHOLOGISTS, ONET_MARRIAGE_FAMILY_THERAPISTS, ONET_MENTAL_HEALTH_COUNSELORS, ONET_SUBSTANCE_ABUSE_COUNSELORS])
        action = (
            "retain_parent_domain_link_candidate" if status == "supported" else
            "candidate_parent_domain_exclusion_after_cross_lane_reconciliation" if status == "unsupported" else
            "do_not_present_as_confirmed_D064_role_without_assignment_evidence"
        )
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"],
                          "domain_fit_status": status, "task_evidence": row["role_task_text"],
                          "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "ESCO/O*NET occupational profiles describe task families, not an individual's licence, legal scope or local eligibility. WHO defines mental health at population level and is not an occupational classification. Counselling and coaching titles vary across jurisdictions; this review assesses only task fit to this parent-domain description, not professional accreditation, clinical authority or local demand.",
                          "recommended_action": action})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D064", "domain_name": "Psychology and Counselling",
            "scope": "D064 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 20 exact D064 role mappings against each supplied task description and the stored parent scope: psychological assessment/treatment, mental and emotional health, person-centred counselling and personal difficulty. Broad coaching, practical mentoring and reproductive-health information were not automatically treated as psychology; conditional rows state the narrower assignment needed. O*NET/ESCO task profiles and WHO's mental-health framing corroborate scope but do not establish licensure or local eligibility.",
            "scope_sources": [WHO_MENTAL_HEALTH, ONET_CLINICAL_PSYCHOLOGISTS, ONET_MARRIAGE_FAMILY_THERAPISTS, ONET_MENTAL_HEALTH_COUNSELORS, ONET_SUBSTANCE_ABUSE_COUNSELORS],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. Conditional entries require the stated remit; volunteer mentor is a candidate D064 exclusion, not an inferred reassignment. Reconcile other lanes before canonical changes."}


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D064 — Psychology and Counselling: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/20 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[WHO's mental-health overview]({WHO_MENTAL_HEALTH}) frames mental health as a component of health and well-being, while occupation-task evidence is provided by [O*NET clinical psychologists]({ONET_CLINICAL_PSYCHOLOGISTS}), [marriage and family therapists]({ONET_MARRIAGE_FAMILY_THERAPISTS}), [mental-health counsellors]({ONET_MENTAL_HEALTH_COUNSELORS}) and [substance-abuse counsellors]({ONET_SUBSTANCE_ABUSE_COUNSELORS}), together with exact ESCO/O*NET locators retained per row.", "",
                  "Conditional is not confirmed: family-planning counselling is limited to a genuine person-centred counselling remit; life coaching is not psychological treatment; and mental-health support work must not imply independent clinical practice. Volunteer mentoring is not counselling merely because it supports personal development.", "",
                  f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/20; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Every decision includes exact local task text, rationale, sources, limitations and recommended action.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
