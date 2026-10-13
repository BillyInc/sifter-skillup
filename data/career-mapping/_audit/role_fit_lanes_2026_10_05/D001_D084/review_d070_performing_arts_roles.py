"""Build exact-key D070 Performing Arts and Entertainment fit review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D070_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D070_role_domain_fit_review_2026_10_05.md"
BLS_PRODUCERS = "https://www.bls.gov/ooh/Entertainment-and-Sports/Producers-and-directors.htm"
BLS_SOUND = "https://www.bls.gov/ooh/media-and-communication/broadcast-and-sound-engineering-technicians.htm"
BLS_PERFORMING_ARTS = "https://www.onetonline.org/find/career?c=020106"
NEA_STAGE_MANAGER = "https://www.arts.gov/stories/magazine/2017/4/behind-scenes-what-it-takes-mount-musical/kerry-epstein-production-stage-manager"

DECISIONS = {
    "actor": "The role performs a character in live drama/theatre, directly matching live performance.",
    "artistic director": "The role sets creative direction for a performance organisation or production, directly matching artistic leadership.",
    "choreographer": "The role creates and directs movement for dancers and live productions, directly matching dance/performance creation.",
    "costume designer": "The role designs production costumes for characters, visual style and practical stage use, directly matching performance production.",
    "dancer": "The role performs choreographed movement in dance, theatre and live productions, directly matching the domain.",
    "dramaturg": "The role researches and analyses dramatic work to support its development and interpretation, directly supporting theatre production.",
    "lighting technician": "The role operates and maintains performance lighting, a technical stage-production function included in the domain scope.",
    "live event technician": "The role operates sound, lighting, power or video systems for live performance and event delivery, directly supporting live productions.",
    "live performance producer": "The role organises resources and delivery of live performance productions, directly matching the domain.",
    "production coordinator": "The role coordinates logistics, schedules and backstage operations for a production, directly supporting performance production.",
    "production manager": "The role turns a performance plan into schedules, budgets and coordinated operations, directly matching production management.",
    "prop designer": "The role develops props for performance storytelling, stage action and practical production use, directly matching production design.",
    "set designer": "The role designs the visual environment and staging requirements for a performance, directly matching set production.",
    "sound technician": "The role operates sound and recording equipment for live productions, directly matching the domain's technical production scope.",
    "stage manager": "The role coordinates rehearsals, cues, backstage operations and scene changes; NEA's practitioner account corroborates coordination of lights, sound, costumes and crew during performances.",
}


def _urls(refs: list[str]) -> list[str]:
    out = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            out.append(url)
    return list(dict.fromkeys(out))


def build() -> dict:
    q = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in q["role_mappings"] if r["domain_id"] == "D070"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 15 or len(by_name) != 15 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D070 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, basis in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([BLS_PRODUCERS, BLS_SOUND, BLS_PERFORMING_ARTS, NEA_STAGE_MANAGER])
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"],
                          "domain_fit_status": "supported", "task_evidence": row["role_task_text"],
                          "basis": basis, "conditional_scope": None,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "BLS and O*NET are US occupational references and NEA is a US cultural agency; they corroborate the task relationship but do not establish local demand or universal role definitions. Exact local role-task text remains the basis for each mapping. This is a parent-domain fit review, not an assessment of role specialization or career eligibility.",
                          "recommended_action": "retain_parent_domain_link_candidate"})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D070", "domain_name": "Performing Arts and Entertainment",
            "scope": "D070 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 15 exact role mappings against the stored scope of live/recorded acting, music/dance/stage performance and stage-production design/technical/management work. Every supplied task is explicitly a performance or production duty. BLS/O*NET and an NEA stage-management account corroborate performer, producer, technician and backstage relationships; no student-career eligibility or local-demand claim is made.",
            "scope_sources": [BLS_PRODUCERS, BLS_SOUND, BLS_PERFORMING_ARTS, NEA_STAGE_MANAGER],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. All 15 exact tasks directly support the parent domain. No canonical changes or specialization decisions are made."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D070 — Performing Arts and Entertainment: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/15 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[BLS producers/directors]({BLS_PRODUCERS}) covers stage production decisions and coordinating sound, lighting and performances. [BLS broadcast, sound and video technicians]({BLS_SOUND}) describes live-event setup and lighting/sound technical work. [O*NET's performing-arts cluster]({BLS_PERFORMING_ARTS}) includes technical and management occupations supporting live artistic performances. An [NEA stage-manager account]({NEA_STAGE_MANAGER}) provides a practitioner example of coordinating lights, sound, costumes and crew.",
                  "", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/15; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
