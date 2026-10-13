"""Build exact-key D081 office-administration role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D081_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D081_role_domain_fit_review_2026_10_05.md"
BLS_GENERAL_CLERKS = "https://www.bls.gov/ooh/office-and-administrative-support/general-office-clerks.htm"
BLS_ADMIN = "https://www.bls.gov/ooh/office-and-administrative-support/secretaries-and-administrative-assistants.htm"
BLS_ADMIN_GROUP = "https://www.bls.gov/ooh/Office-and-Administrative-Support/home.htm"
BLS_OFFICE_SUPPORT = "https://www.bls.gov/ors/factsheet/office-and-administrative-support-occupations.htm"

DECISIONS = {
    "administrative assistant": ("supported", "The task provides routine office support, communications, visitors, supplies and office operations, directly matching the parent-domain scope."),
    "advertising assistant": ("supported", "The task performs administrative and communication support within an advertising department; it is still office-administration work, not a claim that advertising itself is clerical."),
    "data entry clerk": ("supported", "The task updates, verifies, retrieves and enters business records, directly matching the domain's data-entry and records duties."),
    "executive assistant": ("supported", "The task organises meetings, travel, files, correspondence and daily office operations, directly matching executive administrative support."),
    "Executive Secretaries and Executive Administrative Assistants": ("supported", "The task combines executive-level information requests, correspondence, visitor handling, meetings and routine clerical support."),
    "file clerk": ("supported", "The task maintains, organises and retrieves organisational records and forms, directly matching document and records administration."),
    "financial markets back office administrator": ("supported", "The task performs administrative processing, clearing and settlement records for market transactions; this is a specialised office-administration assignment."),
    "foreign language correspondence clerk": ("supported", "The task reads/replies to business correspondence and performs clerical duties; the language requirement changes content, not the administrative function."),
    "human resources assistant": ("supported", "The task provides recruitment-process, communication and HR documentation support, matching office administration in an HR setting."),
    "legal administrative assistant": ("supported", "The task handles office correspondence, calls, typing and legal-office procedures, matching administrative support in a specialised employer."),
    "mail clerk": ("supported", "The task receives, sorts, records and dispatches an organisation's correspondence and packages, directly matching office mail administration."),
    "medical administrative assistant": ("supported", "The task provides healthcare-office correspondence, appointment and query support; it is administrative rather than clinical practice."),
    "membership administrator": ("supported", "The task manages membership enquiries, records, communications and renewals, directly matching records and correspondence administration."),
    "office clerk": ("supported", "The task performs office clerical operations such as mail, filing, calls and administrative support, directly matching the scope."),
    "office manager": ("supported", "The task oversees office systems, correspondence, filing, supplies and clerical workflows, directly matching management of office administration."),
    "postman/postwoman": ("unsupported", "The task delivers mail and parcels on routes; postal distribution is not office administration or clerical mail processing."),
    "proofreader": ("unsupported", "The task edits publication proofs for grammar and typographical quality; this is editorial/production work, not the office record, correspondence or clerical functions defined by this domain."),
    "secretary": ("supported", "The task handles correspondence, diaries, appointments, messages, filing, meetings and databases, directly matching secretarial work."),
    "secretary general": ("unsupported", "The task heads an organisation, directs policy and strategy and represents it; the title contains secretary, but the described work is executive leadership, not office secretarial administration."),
    "typist": ("supported", "The task types, revises and compiles correspondence, reports, tables and forms, directly matching document-production and clerical support."),
}


def _urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D081"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    choices = {n.casefold(): (n, *x) for n, x in DECISIONS.items()}
    if len(rows) != 20 or len(by_name) != 20 or set(by_name) != set(choices):
        raise SystemExit(f"D081 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    scope_sources = [BLS_GENERAL_CLERKS, BLS_ADMIN, BLS_ADMIN_GROUP, BLS_OFFICE_SUPPORT]
    decisions = []
    for folded, (name, status, basis) in choices.items():
        row = by_name[folded]
        refs = _urls(row["task_source_refs"])
        refs.extend(scope_sources)
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"],
                          "domain_fit_status": status, "task_evidence": row["role_task_text"],
                          "basis": basis, "conditional_scope": None,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "BLS is a US occupational reference and corroborates common administrative tasks/classifications; it does not establish Nigerian demand or universal job definitions. Exact ESCO/O*NET or local role-task text remains the mapping evidence. Parent-domain fit only; no subgroup/specialization assessment.",
                          "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "remove_parent_domain_link_candidate"})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D081", "domain_name": "Office Administration and Secretarial Services",
            "scope": "D081 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Compared all exact role tasks against routine office paperwork, correspondence, records, data entry, mail handling and clerical/secretarial coordination. Specialized employer context (advertising, finance, HR, legal, healthcare or membership) does not disqualify a role when its actual tasks are administrative. Conversely, postal delivery, editorial proofing and organisation-wide executive leadership are not treated as clerical work based on title similarity.",
            "scope_sources": scope_sources,
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D081 — Office Administration and Secretarial Services: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/20 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", *[f"| {s.title()} | {c[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"BLS's [general office clerk profile]({BLS_GENERAL_CLERKS}) covers phones, correspondence, mail, scheduling, filing, document updates and data entry. Its [secretary/administrative assistant profile]({BLS_ADMIN}) describes routine clerical and organisational support, and its [office-administrative occupations overview]({BLS_ADMIN_GROUP}) distinguishes clerical/administrative tasks from postal delivery. The [BLS office-support factsheet]({BLS_OFFICE_SUPPORT}) provides a broader occupational-group cross-check. These are US references, not local demand evidence.",
                  "", "Postman/postwoman, proofreader and secretary general are excluded because their supplied work is postal delivery, editorial production or executive leadership—not office clerical administration.",
                  "", f"- Exact queue coverage: {c['reviewed_role_mappings']}/20; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
