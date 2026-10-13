"""Build the exact-key D058 Education Technology role review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D058_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D058_role_domain_fit_review_2026_10_05.md"

UNESCO_FRAMEWORK = "https://www.unesco.org/en/articles/unesco-ict-competency-framework-teachers?hub=785"
ONET_INSTRUCTIONAL = "https://www.onetonline.org/link/details/25-9031.00"

SUPPORTED = {
    "digital literacy teacher": "The task explicitly teaches computer use and digital literacy, directly matching the domain's digital-literacy teaching scope.",
    "ICT trainer": "The task analyzes training needs and teaches use of software packages and information systems, directly matching technology-focused learning and training.",
}
CONDITIONAL = {
    "corporate trainer": "The task is general employee training. Include only when the trainer's actual remit is digital skills, learning technology, or technology-enabled learning design; the current task profile does not specify that.",
}
UNSUPPORTED = {
    "adult literacy teacher": "Basic reading and writing instruction is not an educational-technology task in the supplied role description.",
    "agriculture, forestry and fishery vocational teacher": "The described role teaches practical agriculture/forestry/fishery; no education-technology design, delivery, or support duties are stated.",
    "animal trainer": "The task trains animals or animal handlers and has no educational-technology remit.",
    "art teacher secondary school": "The task is subject teaching in art; no technology-enabled learning duties are stated.",
    "auxiliary nursing and midwifery vocational teacher": "The task teaches vocational nursing/midwifery practice; no education-technology duties are stated.",
    "beauty vocational teacher": "The task teaches practical beauty/cosmetology; no education-technology duties are stated.",
    "biology teacher secondary school": "The task is subject teaching in biology; no technology-enabled learning duties are stated.",
    "business administration vocational teacher": "The task teaches business administration vocationally; no education-technology duties are stated.",
    "business and marketing vocational teacher": "The task teaches sales and marketing; no education-technology duties are stated.",
    "business studies and economics teacher secondary school": "The task is subject teaching in business/economics; no technology-enabled learning duties are stated.",
    "chemistry teacher secondary school": "The task is subject teaching in chemistry; no technology-enabled learning duties are stated.",
    "auxiliary nursing and midwifery vocational teacher": "The task teaches vocational nursing/midwifery practice; no education-technology duties are stated.",
    "early years special educational needs teacher": "The task supports young learners with disabilities, but the profile does not state educational-technology design, delivery, or support as a duty.",
    "special educational needs head teacher": "The task manages a special-education school and programs; it does not describe responsibility for educational technology or learning systems.",
    "special educational needs itinerant teacher": "The task provides instruction and coordination for learners unable to attend school; no educational-technology duty is stated.",
    "special educational needs teacher": "The task provides specialized instruction and support; it does not identify educational technology as a role duty.",
    "special educational needs teacher primary school": "The task provides specialized primary instruction; no educational-technology duty is stated.",
    "special educational needs teacher secondary school": "The task provides specialized secondary instruction; no educational-technology duty is stated.",
}


def source_urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        urls.append(url)
    return list(dict.fromkeys(urls))


def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D058"]
    by_name = {r["role_name"]: r for r in rows}
    expected = set(SUPPORTED) | set(CONDITIONAL) | set(UNSUPPORTED)
    if len(rows) != 20 or len(by_name) != 20 or set(by_name) != expected:
        raise SystemExit(f"D058 exact queue changed: {len(rows)} rows; keys={sorted(by_name)}")

    decisions = []
    for name, row in sorted(by_name.items()):
        if name in SUPPORTED:
            status, basis, condition = "supported", SUPPORTED[name], None
            action = "retain_parent_domain_link_candidate"
        elif name in CONDITIONAL:
            status, basis, condition = "conditional", CONDITIONAL[name], CONDITIONAL[name]
            action = "do_not_present_as_confirmed_D058_role_without_edtech_specific_assignment"
        else:
            status, basis, condition = "unsupported", UNSUPPORTED[name], None
            action = "remove_D058_parent_domain_link_candidate_after_cross_lane_reconciliation"
        refs = source_urls(row["task_source_refs"])
        refs.append(UNESCO_FRAMEWORK)
        if name in {"digital literacy teacher", "ICT trainer", "corporate trainer"}:
            refs.append(ONET_INSTRUCTIONAL)
        refs = list(dict.fromkeys(refs))
        decisions.append({
            "role_key": row["role_key"], "role_name": name, "domain_fit_status": status,
            "task_evidence": row["role_task_text"], "basis": basis,
            "conditional_scope": condition, "source_refs": refs,
            "source_limit": "ESCO task records describe the mapped role duties. UNESCO ICT-CFT establishes that technology integration is a defined teacher-competency area; O*NET instructional-coordinator tasks corroborate technology-integrated instructional design and training. These sources do not make every teacher an EdTech occupation. No subgroup or title inference was used.",
            "recommended_action": action,
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    payload = {
        "schema_version": 1, "domain_id": "D058",
        "domain_name": "Education Technology and Learning Experience Design",
        "scope": "D058 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all 20 exact D058 mapping keys from the current D045-D084 queue. Compared each role's own task description to the domain's technology-enabled teaching, learning-design, digital-literacy, and ICT-training scope. UNESCO ICT-CFT and O*NET instructional-coordinator evidence were used to anchor what technology-integrated teaching/training entails. ISCO/subgroup membership and generic association with education were not fit evidence.",
        "scope_sources": [UNESCO_FRAMEWORK, ONET_INSTRUCTIONAL],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": 0, "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Two roles explicitly teach digital literacy or ICT systems. A corporate trainer is conditional on a technology/EdTech remit. The other 17 task profiles describe subject teaching, special-needs teaching/administration, animal training, or general literacy instruction rather than educational technology. These are candidate mapping corrections for later cross-lane reconciliation; no shared canonical data was changed.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D058 — Education Technology and Learning Experience Design: role-to-parent fit", "",
        "**Slice:** 20/20 exact role mappings reviewed against task descriptions and the parent-domain scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.", "",
        "| Disposition | Count |", "|---|---:|",
        f"| Supported | {counts['supported']} |", f"| Conditional | {counts['conditional']} |",
        f"| Unsupported | {counts['unsupported']} |", "| Unresolved fit decisions | 0 |", "",
        "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in decisions)
    lines.extend([
        "", "## Evidence and limits", "",
        f"[UNESCO ICT Competency Framework for Teachers]({UNESCO_FRAMEWORK}) treats using ICT in teaching as a defined professional competency and guides teacher training for technology integration. [O*NET Instructional Coordinators]({ONET_INSTRUCTIONAL}) includes instructional design, researching instructional technology, and training instructors to use or integrate it.",
        "", "These sources support the boundary: EdTech work involves technology-enabled learning, instructional design, or ICT-focused training—not simply working as a teacher or trainer. A conditional disposition is not a confirmed student path; general subject-teaching records should not appear as D058 roles solely because they teach.",
        "", "## Validation", "", "- Exact queue-key coverage: 20/20; 2 supported, 1 conditional, 17 unsupported.",
        "- Every decision records exact role task, rationale, and evidence/source limitations.",
        "- No shared canonical JSON or subgroup/specialization artifact changed.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
