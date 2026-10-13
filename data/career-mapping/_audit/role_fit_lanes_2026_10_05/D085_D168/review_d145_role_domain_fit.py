import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D145_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D145_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D145 role_key and stored task descriptions for all mappings.", "supports": "The stated neuroscience, cognitive/behavioral health and clinical tasks evaluated.", "limit": "The queue is the audited record, not independent evidence of an occupation's full scope."},
    "APA_CLINICAL_NEUROPSYCHOLOGY": {"publisher": "American Psychological Association (APA)", "url": "https://www.apa.org/ed/graduate/specialize/neuropsychology", "locator": "Clinical neuropsychology specialty: brain-behavior relationships, diagnosis of brain disorders, assessment of cognitive/behavioral function and treatment planning.", "supports": "Clinical neuropsychologist/neuropsychologist role duties and the boundary between neuropsychology and general psychology.", "limit": "APA is a U.S. professional body; this citation supports the discipline/task relationship, not universal licensure rules."},
    "APA_NEUROPSYCHOLOGY": {"publisher": "American Psychological Association (APA), Division 40 / Society for Clinical Neuropsychology", "url": "https://www.apa.org/topics/neuropsychology", "locator": "Neuropsychology focuses on brain-behavior relationships and clinical application to human problems.", "supports": "The domain's brain, cognition and behavior scope.", "limit": "Professional-society overview is a discipline source, not a title-to-domain rule."},
    "NINDS_NEUROLOGICAL_DISORDERS": {"publisher": "U.S. National Institute of Neurological Disorders and Stroke (NINDS), NIH", "url": "https://www.ninds.nih.gov/health-information/public-education/brain-basics", "locator": "Brain basics and major disorder categories including developmental, degenerative, cerebrovascular, traumatic, seizure and brain-tumour conditions.", "supports": "Neurology and brain-disorder context in the role tasks.", "limit": "Health information is not a professional scope-of-practice or licensing standard."},
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "Clinical Neuropsychologists": (S, "Assesses and diagnoses cognitive/neurobehavioral problems linked to nervous-system disorders and recommends treatment; directly matches brain-behavior assessment and clinical neuroscience.", ["QUEUE_TASK_PROFILE", "APA_CLINICAL_NEUROPSYCHOLOGY", "APA_NEUROPSYCHOLOGY"]),
    "Neurologists": (S, "Diagnoses and treats disorders of the brain, spinal cord and peripheral nerves; direct clinical neuroscience and brain-health work.", ["QUEUE_TASK_PROFILE", "NINDS_NEUROLOGICAL_DISORDERS"]),
    "Neuropsychologists": (S, "Studies brain-related cognition and behavior and assesses/diagnoses higher cerebral-function disorders; direct neuropsychology.", ["QUEUE_TASK_PROFILE", "APA_CLINICAL_NEUROPSYCHOLOGY", "APA_NEUROPSYCHOLOGY"]),
    "animal behaviourist": (U, "Studies and manages animal behavior through observation and environmental/management changes. The task does not establish brain/neural investigation or human cognitive/behavioral-health work in this domain.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "assistant clinical psychologist": (S, "Assesses psychological needs and supports treatment/therapy in clinical settings. The domain scope explicitly includes psychologists assessing and treating mental/behavioral health.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "clinical psychologist": (S, "Assesses, diagnoses and treats mental, emotional and behavioral disorders using clinical interventions; directly fits the stated behavioral-health branch of the domain.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "educational psychologist": (S, "Provides psychological assessment and interventions for students and learning-related needs; fits the domain's cognition, behavior and assessment scope.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "health psychologist": (S, "Studies health-related behavior and helps prevent illness/promote health through counseling and behavior-change work; fits the domain's behavior/mental-health scope.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "physiologist": (C, "Studies functions of living systems broadly. Neuroscience may be a specialization, but the task description does not identify neural, brain or cognitive physiology.", ["QUEUE_TASK_PROFILE", "NINDS_NEUROLOGICAL_DISORDERS"]),
    "psychologist": (S, "Studies human behavior and mental processes and provides counseling for psychological concerns; directly fits the domain's stated psychology/behavioral-health component.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "psychotherapist": (S, "Treats psychological and behavioral disorders through psychotherapy and supports personal well-being; directly fits the domain's stated treatment component.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
    "sensory scientist": (U, "Uses consumer sensory analysis to create food, beverage and cosmetic flavors/fragrances; this is product sensory research, not neuroscience, cognition or clinical sensory/neural assessment.", ["QUEUE_TASK_PROFILE", "APA_NEUROPSYCHOLOGY"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D145"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 12 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D145 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D145", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare exact tasks with brain/neural science, cognition, brain-behavior assessment and mental/behavioral-health assessment/treatment stated in the parent scope. Direct neurological, neuropsychological and clinical psychological duties are supported. Broad physiology is conditional without a nervous-system focus. Animal behavior management and consumer flavor/fragrance testing are outside this human brain/cognition/clinical domain as described.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 12 exact D145 queue roles were assessed from task text; no role was inferred from subgroup membership.", "This queue contains no role whose recorded task specifically develops brain-computer interfaces; the domain scope mentions BCIs, but this lane does not add or invent a role.", "APA and NINDS sources support the discipline/task boundary and are not used to impose country-specific credential rules.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D145 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
