import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D150_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D150_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D150 role_key, parent scope and stored task descriptions.",
        "supports": "The specific recorded duties evaluated for each D150 mapping.",
        "limit": "This is the record under audit, not an independent verification of an occupation's complete scope.",
    },
    "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 Volume I, unit group 3413, Religious Associate Professionals: religious works, preaching, rites, religious education, spiritual/moral guidance and assistance at community programmes.",
        "supports": "A global occupational classification cross-check for religious community support, education and spiritual guidance tasks.",
        "limit": "ISCO is a statistical classification and does not prescribe theological doctrine, licensing or the taxonomy used by this product.",
    },
    "ONET_RELIGIOUS_ACTIVITY_DIRECTORS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/details/21-2021.00",
        "locator": "Directors, Religious Activities and Education (21-2021.00): coordinate/design programmes and outreach promoting a denominational group's religious education or activities; may counsel and provide guidance.",
        "supports": "The task fit of religious-education/activity programme leadership.",
        "limit": "U.S. occupational profile; it corroborates tasks but does not set global titles or religious authority requirements.",
    },
    "ONET_POSTSECONDARY_RELIGION_TEACHERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/25-1126.00",
        "locator": "Philosophy and Religion Teachers, Postsecondary (25-1126.00): teaches philosophy, religion and theology; may combine teaching and research.",
        "supports": "The academic religion/theology teaching and research portion of the combined occupational family.",
        "limit": "The classification combines philosophy with religion; actual subject assignment determines whether a particular post belongs in this religion-focused domain.",
    },
    "ONET_RELIGIOUS_WORKERS_CATCHALL": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/details/21-2099.00",
        "locator": "Religious Workers, All Other (21-2099.00): 'All other' is a residual category and O*NET reports no detailed occupation-specific data for it.",
        "supports": "Why the catch-all record supplies no individual task evidence for a fit decision.",
        "limit": "U.S. residual classification; it does not show whether any particular unlisted religious occupation fits this domain.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"
R = "unresolved"

DECISIONS = {
    "Directors, Religious Activities and Education": (S, "Coordinates or designs religious-education/activity programmes, outreach and related guidance for a faith group. Those are direct ministry, religious education and faith-community leadership tasks in the parent scope.", ["QUEUE_TASK_PROFILE", "ONET_RELIGIOUS_ACTIVITY_DIRECTORS", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "Philosophy and Religion Teachers, Postsecondary": (C, "The occupational family teaches religion and theology and may teach philosophy, with teaching/research duties. It fits when the post actually teaches or researches religion/theology; a philosophy-only assignment is not established by this combined title.", ["QUEUE_TASK_PROFILE", "ONET_POSTSECONDARY_RELIGION_TEACHERS"]),
    "Religious Workers, All Other": (R, "This is a residual 'all other' title with no occupation-specific task description. The label alone cannot establish whether the particular work is ministry, theology, pastoral care or an unrelated/unrepresented activity; an actual role/task record is needed.", ["QUEUE_TASK_PROFILE", "ONET_RELIGIOUS_WORKERS_CATCHALL"]),
    "chaplain": (S, "Provides religious activity, counselling and spiritual/emotional support in secular institutions and coordinates with religious officials. These duties match the parent’s chaplaincy, pastoral support and faith-community service scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "minister of religion": (S, "Leads a religious community, conducts ceremonies and gives spiritual guidance, directly matching the parent’s ministry and faith-community leadership functions.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "missionary": (S, "Organizes and leads church-based outreach missions, sets and executes religious mission objectives and supports ministry. These are direct religious-ministry and community outreach tasks; the disposition does not endorse any doctrine or proselytizing practice.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "pastoral worker": (S, "Supports a religious community through spiritual education/guidance, religious rites and charitable programmes, matching the parent’s pastoral, educational and charity-service scope.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "religion scientific researcher": (S, "Studies religious concepts, beliefs, spirituality and scripture. The recorded research task directly fits the parent’s study of religion and theology; 'scientific' is retained as supplied and is not treated as a claim about a particular research method.", ["QUEUE_TASK_PROFILE", "ILO_ISCO_RELIGIOUS_ASSOCIATE_PROFESSIONALS"]),
    "religious studies lecturer": (S, "Teaches theology/religious studies at university level and conducts academic research. Both teaching and research in religion are expressly within the parent scope.", ["QUEUE_TASK_PROFILE", "ONET_POSTSECONDARY_RELIGION_TEACHERS"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D150"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D150 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D150", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Assess each recorded work task against the parent scope's ministry, faith-community leadership, chaplaincy/pastoral services, religious research and teaching. A mixed discipline is conditional when only one part is relevant; a catch-all with no task evidence remains unresolved. Do not infer fit from religious identity, title alone, or subgroup membership.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally[R]},
        "decisions": decisions, "sources": SOURCES,
        "coverage_signal": {
            "lane_queue_mappings_for_D150": len(decisions),
            "interpretation": "This is the count of D150 existing links in the current exact review queue, not a complete active-role total or a coverage-sufficiency judgment. This lane adjudicates existing links and does not add occupations.",
            "zero_or_sparse_signal_in_this_review": "None established from the parent-fit queue alone.",
        },
        "notes": [
            "All nine exact D150 queued mappings were assessed from recorded duties; titles and subgroup membership are not proof of fit.",
            "The combined philosophy/religion teacher family is conditional on the actual subject taught; philosophy-only teaching is outside the religion-focused work described here.",
            "The residual all-other religious-worker row remains unresolved because no individual tasks are supplied; this is an evidence gap, not a finding that such work is outside the domain.",
            "O*NET profiles are U.S.-specific corroboration; ILO ISCO provides a broader international classification but neither dictates this product's domain taxonomy.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [f"# D150 role-to-parent-domain fit review — {payload['audit_date']}", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally[R]}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Coverage signal (separate from fit)", "", f"D150 has **{len(decisions)} existing links in this lane's exact review queue**. This is not a complete active-role count or a sufficiency score; no zero/sparse conclusion is inferred from this fit queue.", "", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
