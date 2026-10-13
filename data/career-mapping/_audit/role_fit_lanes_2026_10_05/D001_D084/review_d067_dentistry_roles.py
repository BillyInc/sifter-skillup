"""Build exact-key D067 Dentistry role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D067_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D067_role_domain_fit_review_2026_10_05.md"
ADA_ASSISTANT = "https://www.ada.org/resources/careers/career-pathways/dental-assistant"
ADA_LAB_TECH = "https://www.ada.org/resources/careers/career-pathways/dental-laboratory-technician"
ADA_MAXILLOFACIAL = "https://www.ada.org/sitecore/content/ADA-Organization/ADA/CODA/home/find-a-program"
ADA_DELEGATION = "https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/about/governance/current_policies.pdf?hash=1E65B3A2597ED0983E3F7D35A43C7215&rev=2be52266eb75492897321d3dab234e81"
ONET_DENTISTS = "https://www.onetonline.org/link/summary/29-1021.00"
ONET_OTHER_DENTISTS = "https://www.onetonline.org/link/summary/29-1029.00"
ONET_HYGIENISTS = "https://www.onetonline.org/link/summary/29-1292.00"
ONET_ASSISTANTS = "https://www.onetonline.org/link/summary/31-9091.00"

DECISIONS = {
    "dental assistants": ("supported", "The tasks are chairside clinical support, sterilization, patient preparation and oral-care instructions under dentist direction; the ADA describes these as dental-assistant duties.", None),
    "dental chairside assistant": ("supported", "The role assists dental practitioners during clinical treatment and follows their supervision/orders, directly matching the dental-care team in the domain.", None),
    "dental hygienist": ("supported", "The task performs preventive periodontal/oral care and oral-hygiene advice under supervision, directly within dentistry; the exact legal scope remains jurisdiction-specific.", None),
    "dental hygienists": ("supported", "The task administers oral-hygiene care, assesses patient needs and supports disease prevention, directly matching the parent domain.", None),
    "dental instrument assembler": ("unsupported", "The task assembles dental instruments and devices in a manufacturing/cleanroom setting. It does not provide dental examination, treatment, laboratory fabrication of patient-specific dental appliances, or clinical support.", None),
    "dental laboratory technicians": ("supported", "The task constructs and repairs dentures and dental appliances, directly matching the dental-technician/laboratory function in the stored domain scope.", None),
    "dental practitioner": ("supported", "The task prevents, diagnoses and treats diseases and anomalies of teeth, mouth, jaws and adjacent tissues; it is a direct dentistry fit.", None),
    "dental technician": ("supported", "The task manufactures custom dental devices to a dental practitioner's directions and specifications, matching dental laboratory work.", None),
    "dentists, all other specialists": ("supported", "O*NET defines this residual occupation as dentists not listed separately; that is a dentist-specialist category and therefore within the dentistry parent domain, although the particular specialty is not specified by this task record.", None),
    "dentists, general": ("supported", "The task examines, diagnoses and treats diseases/injuries of teeth and gums and provides preventive care, directly matching the domain.", None),
    "oral and maxillofacial surgeons": ("supported", "The task diagnoses and surgically treats disease, injury or defects of the oral/maxillofacial region; the ADA identifies oral and maxillofacial surgery as a dental specialty.", None),
    "specialist dentist": ("supported", "The task prevents, diagnoses and treats oral disease with specialization in oral surgery or orthodontics, directly within dentistry.", None),
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
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D067"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 12 or len(by_name) != 12 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D067 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([ADA_ASSISTANT, ADA_LAB_TECH, ADA_MAXILLOFACIAL, ADA_DELEGATION,
                     ONET_DENTISTS, ONET_OTHER_DENTISTS, ONET_HYGIENISTS, ONET_ASSISTANTS])
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "domain_fit_status": status,
                          "task_evidence": row["role_task_text"], "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "O*NET is a US occupational reference and the ADA sources are US professional descriptions; they corroborate task boundaries, not local licensing, authorization or demand. The domain description mentions Nigerian registration, but no local registration determination is made here. The assembler exclusion is based on manufacturing tasks, not role-title similarity.",
                          "recommended_action": "candidate_parent_domain_exclusion_after_cross_lane_reconciliation" if status == "unsupported" else "retain_parent_domain_link_candidate"})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D067", "domain_name": "Dentistry",
            "scope": "D067 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 12 exact mappings against dentistry's stored scope: oral examination, diagnosis/treatment/prevention, dental appliances/laboratory work, chairside/hygiene support and oral/maxillofacial surgery. ADA and O*NET sources corroborate occupation tasks and dental-team boundaries. Instrument manufacturing alone is not treated as clinical or dental-laboratory work.",
            "scope_sources": [ADA_ASSISTANT, ADA_LAB_TECH, ADA_MAXILLOFACIAL, ADA_DELEGATION, ONET_DENTISTS, ONET_OTHER_DENTISTS, ONET_HYGIENISTS, ONET_ASSISTANTS],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. The instrument-assembler link is a candidate exclusion, not an inferred reassignment. Reconcile other lanes before canonical changes."}


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D067 — Dentistry: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/12 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [ADA dental-assistant profile]({ADA_ASSISTANT}) describes chairside support; ADA's [dental-laboratory-technician profile]({ADA_LAB_TECH}) covers custom dental prostheses; its [CODA programme page]({ADA_MAXILLOFACIAL}) identifies oral/maxillofacial surgery as a dental specialty. O*NET task profiles are linked per mapped occupation, including [general dentists]({ONET_DENTISTS}) and the residual [Dentists, All Other Specialists]({ONET_OTHER_DENTISTS}). ADA delegation guidance notes that duties and legal scope vary by jurisdiction.",
                  "", "The unsupported instrument-assembler task concerns manufacturing dental equipment, not providing dentistry or making patient-specific dental appliances.",
                  f"", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/12; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
