"""Build exact-key D065 Translation, Interpretation and Linguistics review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D065_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D065_role_domain_fit_review_2026_10_05.md"
WFD_SIGN_LANGUAGES = "https://wfdeaf.org/wfd-statement-on-standardized-sign-language/"
ESCO_OCCUPATIONS = "https://esco.ec.europa.eu/en/use-esco"

DECISIONS = {
    "interpreters and translators": ("supported", "The task is directly to interpret oral/sign language or translate written material between languages, matching the stored domain definition.", None),
    "language engineer": ("supported", "The task applies computing and natural-language processing to translation quality and mapping between human and machine translation; it directly supports translation and linguistic systems.", None),
    "sign language teacher": ("conditional", "The task teaches sign language, a language modality recognized by the World Federation of the Deaf. Teaching a language is not itself interpreting; the link is justified only when the assignment also serves sign-language linguistic documentation, interpreter training or closely connected language-service capability.", "a documented interpreting, translator-training or linguistic-service remit, not language instruction alone"),
    "translation agency manager": ("supported", "The task manages delivery and quality of translation services and coordinates translators, directly supporting the domain's translation work.", None),
}


def _urls(refs: list[str]) -> list[str]:
    result = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if url.startswith(("http://", "https://")):
            result.append(url)
    return list(dict.fromkeys(result))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D065"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 4 or len(by_name) != 4 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D065 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([WFD_SIGN_LANGUAGES, ESCO_OCCUPATIONS])
        action = "retain_parent_domain_link_candidate" if status == "supported" else "do_not_present_as_confirmed_D065_role_without_assignment_evidence"
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "domain_fit_status": status,
                          "task_evidence": row["role_task_text"], "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "ESCO task descriptions are the role-specific evidence and describe European occupational concepts, not local licensing or demand. WFD supports the linguistic status/variation of sign languages but does not establish that teaching sign language is interpreting; the conditional link therefore requires the stated language-service assignment.",
                          "recommended_action": action})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D065", "domain_name": "Translation, Interpretation and Linguistics",
            "scope": "D065 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed each of the four exact mappings against the stored scope of cross-language written/oral/sign interpretation and translation. Translation delivery management and translation-focused NLP fit directly. Sign-language teaching is not equated with interpretation; its link is conditional on a documented language-service, interpreter-training or linguistic remit.",
            "scope_sources": [WFD_SIGN_LANGUAGES, ESCO_OCCUPATIONS],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. Conditional sign-language-teacher link requires the task assignment stated; no canonical change or alternative domain assignment is made."}


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D065 — Translation, Interpretation and Linguistics: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/4 exact mappings reviewed; canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [ESCO framework]({ESCO_OCCUPATIONS}) is a common occupation/skill classification and its exact occupation locators are preserved per task-backed row. The [World Federation of the Deaf statement]({WFD_SIGN_LANGUAGES}) discusses natural sign-language variation and resources used in teaching sign languages and training interpreters. It supports sign language as a language, not an inference that teaching alone is interpreting.",
                  "", "Conditional is not confirmed: the sign-language teacher link requires a documented interpreting, translator-training or linguistic-service assignment.",
                  f"", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/4; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
