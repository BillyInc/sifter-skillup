"""Build exact-key D154 role-to-parent-domain fit review (no canonical writes)."""

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D154_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D154_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D154 role keys, stored task descriptions and parent scope.",
        "supports": "The duties actually evaluated for each mapping.",
        "limit": "This is the record under audit, not independent proof of an occupation's complete scope.",
    },
    "WORLD_PHYSIOTHERAPY": {
        "publisher": "World Physiotherapy",
        "url": "https://world.physio/resources/what-is-physiotherapy",
        "locator": "Global description: physiotherapists develop, maintain and restore movement/function; practice includes promotion, prevention, treatment and rehabilitation.",
        "supports": "Movement, injury/function restoration and rehabilitation roles in the D154 scope.",
        "limit": "Global professional description; national titles, scope-of-practice laws and licensing vary.",
    },
    "ACSM_EXERCISE_PHYSIOLOGY": {
        "publisher": "American College of Sports Medicine (ACSM)",
        "url": "https://chapters.acsm.org/docs/default-source/certification-documents/ep/acsm-certified-exercise-physiologist-exam-content-outline-2022.pdf?sfvrsn=e5e0860f_3",
        "locator": "Certified Exercise Physiologist content outline: exercise assessment/prescription, fitness components, exercise physiology, and safe program implementation.",
        "supports": "Exercise physiology and exercise-program occupations as an identifiable practice area.",
        "limit": "Professional certification framework, primarily U.S.-based; it is not a universal licensing rule or evidence that every fitness role is clinical.",
    },
    "ACSM_CERTIFICATION_GUIDE": {
        "publisher": "American College of Sports Medicine (ACSM)",
        "url": "https://www.acsm.org/wp-content/uploads/2025/02/acsm-certification-guidebook.pdf",
        "locator": "Certified Exercise Physiologist and Clinical Exercise Physiologist descriptions, including health assessment, exercise testing/prescription and supervised clinical exercise for chronic disease.",
        "supports": "The distinction between general exercise/fitness work and clinical exercise physiology.",
        "limit": "Credential and practice details are U.S.-specific; do not infer eligibility or legal scope elsewhere.",
    },
    "WHO_PHYSICAL_ACTIVITY": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications-detail-redirect/9789240015128",
        "locator": "WHO 2020 evidence-based physical-activity recommendations and health outcomes across age groups and selected populations.",
        "supports": "Public-health context for physical activity and fitness outcomes.",
        "limit": "Population guidance, not a job description, credential, or authorization to provide clinical treatment.",
    },
}

S, C = "supported", "conditional"
DECISIONS = {
    "D154|Athletic Trainers": (S, "Evaluates and treats musculoskeletal injury and provides preventive, emergency and rehabilitative care, directly within the domain's sports-therapy and recovery remit.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|Exercise Physiologists": (S, "Assesses and implements exercise programs against cardiorespiratory, body-composition, strength, endurance and flexibility outcomes, the core exercise-science remit.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|Exercise Trainers and Group Fitness Instructors": (S, "Coaches structured exercise for personal fitness and adapts programs to participant needs, directly matching exercise instruction.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|Fitness and Wellness Coordinators": (C, "Coordinates broad wellness services and staff; fit is established when the portfolio is exercise/fitness programming, but the task also permits broader wellness administration.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|Recreation and Fitness Studies Teachers, Postsecondary": (C, "The task spans recreation and leisure as well as exercise physiology and fitness. The exercise-science teaching branch fits; generic leisure/facility teaching is not established by this record.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|Sports Medicine Physicians": (S, "Diagnoses, treats and helps prevent injuries associated with sport, athletic training and physical activity; directly within sports therapy.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|advanced physiotherapist": (C, "Advanced physiotherapy is a level of practice across many specialties. The record does not identify exercise, sport injury or movement-rehabilitation focus, so domain fit depends on the actual specialty assignment.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|dietitian": (C, "Dietetic assessment and nutrition advice are relevant to health and may support exercise/sport performance, but the supplied duties are general population nutrition rather than sports/exercise nutrition.", ["QUEUE_TASK_PROFILE", "WHO_PHYSICAL_ACTIVITY"]),
    "D154|fitness instructor": (S, "Delivers individual or group fitness instruction, an explicit exercise-program function in the parent scope.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|kinesiologist": (S, "Studies human movement using physiology, kinetics, neurology and biology and applies evidence to improve movement, directly matching exercise science.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|leisure attendant": (C, "Maintains a safe, supportive fitness-centre environment and encourages participation, but the stored task is facility/member support rather than exercise-science or therapy practice.", ["QUEUE_TASK_PROFILE"]),
    "D154|massage therapist": (C, "Provides therapeutic massage, which can be used in recovery, but the task does not establish sports injury, exercise rehabilitation or other D154-specific context.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|personal trainer": (S, "Assesses clients and designs, implements and evaluates individualized exercise programs, directly matching the exercise/fitness remit.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|physiotherapist": (S, "Develops, maintains and restores movement/function and treats or prevents injury and impairment, directly matching the domain's movement and recovery scope.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|physiotherapy assistant": (S, "Supports physiotherapy interventions under delegated protocols; the task is directly within movement-rehabilitation delivery, with supervision retained by the physiotherapist.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
    "D154|pilates teacher": (S, "Plans, teaches and adapts structured exercise to client needs and safety, matching the domain's stated fitness-instruction remit.", ["QUEUE_TASK_PROFILE", "ACSM_EXERCISE_PHYSIOLOGY"]),
    "D154|sport therapist": (S, "Plans and supervises rehabilitation exercise and coordinates with health professionals, directly matching sports therapy and recovery.", ["QUEUE_TASK_PROFILE", "WORLD_PHYSIOTHERAPY"]),
}


def main():
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D154"]
    by_key = {row["role_key"]: row for row in rows}
    if len(by_key) != len(rows) or set(by_key) != set(DECISIONS):
        raise SystemExit("D154 exact-key mismatch; refusing to generate partial or duplicate review.")
    decisions = []
    for key, (fit, rationale, refs) in DECISIONS.items():
        row = by_key[key]
        decisions.append({
            "role_key": key, "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(row["domain_fit"] for row in decisions)
    payload = {
        "schema_version": "1.0", "audit_date": date.today().isoformat(),
        "domain_id": "D154", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Exact-key assessment of each stored role task against the parent-domain scope. The task record is evaluated independently; title, ISCO/subgroup placement, role frequency and specialization membership are not proof of fit. International professional and public-health sources clarify exercise and rehabilitation boundaries, with jurisdiction limits stated. No role-to-specialization assignment is made.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "correction_proposals": [],
        "separate_coverage_candidates": [],
        "notes": [
            "Conditional records do not establish the necessary sport/exercise or clinical context; they are not unconditional student requirements.",
            "The ACSM materials describe a professional certification framework and are not universal legal scope-of-practice rules.",
            "No Nigerian-specific role variant was asserted; this review concerns the globally described task records in the queue.",
            "No canonical taxonomy/mapping file or role-to-specialization assignment was changed.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [f"# D154 role-to-parent-domain fit review — {payload['audit_date']}", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Rationale |", "|---|---|---|---|"]
    for row in decisions:
        task = row["task_evidence"].replace("|", "\\|").replace("\n", " ")
        rationale = row["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{row['role_key']}` | {task} | {row['domain_fit']} | {rationale} |")
    lines += ["", "## Sources and limitations", ""]
    for source_id, source in SOURCES.items():
        lines.append(f"- **{source_id} — {source['publisher']}**: [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
