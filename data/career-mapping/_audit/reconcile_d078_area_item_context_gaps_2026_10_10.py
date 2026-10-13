"""Repair missing D078 area-item learning-context fields in a hidden overlay.

This locally reconciles the missing explanations, work descriptions, outputs,
and item-specific prerequisite/alternative dispositions. It does not change
canonical seed data or student visibility. Programme wording distinguishes
optional area enrichment from material directly taught by CCMAS.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
CONTRACT_AUDIT_PATH = AUDIT / "D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.json"
PROGRAMME_EVIDENCE_PATH = AUDIT / "programme_domain_evidence_2026-08-17.json"
OUT_JSON = AUDIT / "D078_AREA_ITEM_CONTEXT_RECONCILIATION_2026_10_10.json"
OUT_MD = ROOT / "docs/manual-review/D078_AREA_ITEM_CONTEXT_RECONCILIATION_2026_10_10.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


LEARNER_OUTPUTS = {
    "SOC-K1": "A concept map or short analytic note defining the key concepts, showing how they relate, and identifying the setting or evidence to which they apply.",
    "SOC-M1": "A focused interview guide or observation plan, consent/context notes, and a short evidence memo grounded in recorded accounts or observations.",
    "SOC-C1": "A participant-protection and reflexivity plan that records consent, privacy, risk controls, researcher position, and any remaining ethical questions.",
    "SOC-M2": "A documented codebook, a small set of coded excerpts, and a thematic comparison memo that includes examples and counterexamples.",
    "SOC-C2": "A findings memo that separates evidence from interpretation, records alternative explanations, and states what remains uncertain.",
    "SOC-T1": "A reproducible notebook or script and a prepared text dataset, with a short note on collection scope, preprocessing, validation, and limits.",
    "SOC-S1": "A documented text-analysis workflow with a sample of checked results, an explanation of the patterns found, and a note on what the corpus cannot represent.",
    "SOC-A1": "A human-reviewed annotation sample, comparison against an agreed reference set, an error/uncertainty summary, and a decision about whether the model is fit for this task.",
    "SOC-C3": "A research record documenting data permissions, privacy safeguards, model/version and prompts where appropriate, human checks, corrections, and disclosure of AI assistance.",
    "SOC-M3": "A model specification, runnable simulation, and sensitivity note showing how outcomes change when stated mechanisms or assumptions change.",
    "SOC-T2": "A runnable Mesa model with documented agent rules, parameters, and a small set of reproducible simulation results.",
    "SOC-A2": "A bounded experiment log comparing specified agent instructions/settings, the simulated outputs, failure cases, and a clear statement that these are model outputs rather than observed social facts.",
    "SOC-M4": "A draft instrument plus cognitive-interview notes showing how participants understood items, where translation or wording changed meaning, and what was revised before fielding.",
    "SOC-C4": "A pretest findings table linking each question to observed comprehension or response problems, translation-equivalence concerns, and the resulting revision or hold decision.",
    "ECON-K1": "A measurement note defining each economic concept and indicator, its unit and population, and what the measure does not capture.",
    "ECON-S1": "A data-quality and descriptive-analysis memo with a documented dataset, summary tables/plots, missingness or coverage checks, and interpretation limits.",
    "ECON-M1": "A research-design memo and reproducible analysis showing the estimand, comparison strategy, identification assumptions, diagnostics, and limits on causal interpretation.",
    "ECON-C1": "A short evidence brief that distinguishes description, association, prediction, and causal claims and states which claim the available design can support.",
    "ECON-M2": "A forecast or nowcast with a documented data cut-off, benchmark, assumptions, uncertainty interval or scenario range, and an explanation of intended use.",
    "ECON-T1": "A reproducible R or Python workflow with data provenance, cleaning steps, analysis or forecast output, and an interpretation/uncertainty note.",
    "ECON-A1": "A generated-covariate specification, validation sample, error and sensitivity analysis, and a record of whether the measure is sufficiently reliable for the intended estimate.",
    "ECON-C2": "A validation report comparing generated measures with an appropriate reference or manual check, documenting errors, reproducibility, and downstream sensitivity.",
    "ECON-A2": "A bounded research-support work product with cited source checks, corrected outputs, a record of what AI did, and a human-authored conclusion.",
    "ECON-C3": "A verification and disclosure record separating AI-generated material from checked evidence and researcher decisions, including corrections and unresolved uncertainty.",
}

LEARNER_WORK_DESCRIPTIONS = {
    "D078-A03-knowledge-institutions-policy": "Trace who makes a policy, which bodies carry it out, which groups are affected, and what rules shape the decision.",
    "D078-A03-skill-stakeholder-mapping": "Identify who can influence a decision and who may experience its effects; note their interests, concerns and evidence needs.",
    "D078-A03-method-policy-evidence-review": "Find and compare relevant research, policy documents and stakeholder evidence; show what each option may do and where the evidence is uncertain.",
    "D078-A03-skill-policy-brief-writing": "Turn reviewed findings into a short decision-focused brief that separates evidence, interpretation, recommendations and limits.",
    "D078-A03-method-survey-sampling": "Plan whom to ask, what neutral questions to ask and how to collect comparable answers; explain how sampling or nonresponse may affect the result.",
    "D078-A03-tool-kobotoolbox-survey": "Build and test a digital survey form, collect responses (including offline when appropriate), and export the data. The tool does not design the questions or choose a representative sample.",
    "D078-A03-method-programme-evaluation": "Describe how a programme is expected to lead to change, then choose evidence to check how it was delivered and what results followed.",
    "D078-A03-competency-evaluation-judgement": "Interpret evaluation findings in light of local context, assumptions, evidence strength and other possible explanations.",
    "D078-A04-knowledge-behavioural-constructs": "Define what an idea such as attitude, identity or participation means in a study and what evidence could represent it; this is not a clinical diagnosis.",
    "D078-A04-method-behavioural-research-design": "Match a question about behaviour or interaction to suitable measures and methods, plan how to study it ethically, and state what the findings can and cannot show.",
    "D078-A04-competency-ethical-cultural-reflexivity": "Protect participants, consider cultural and power differences, and reflect on how the researcher may affect what people share and how evidence is interpreted.",
    "D078-A04-knowledge-identity-groups-context": "Examine how identity, group membership and social settings may shape interaction, without assuming that everyone in a group is the same.",
    "D078-A04-method-comparative-mixed-analysis": "Compare groups or settings using suitable interviews, observations or numerical evidence; check that the measures can be compared and avoid claiming that a difference proves its cause.",
    "D078-A04-skill-group-pattern-interpretation": "Describe a pattern found among groups and state clearly what it does and does not tell you about any individual person.",
    "D078-A04-method-qualitative-group-inquiry": "Use interviews, observation or documents to understand interaction and group or institutional life, with consent, systematic records and careful interpretation.",
    "D078-A04-tool-nvivo-tagging": "Use software to organise interview or document material and apply a documented set of codes; review the excerpts yourself because the software does not decide what they mean.",
    "D078-A04-skill-measurement-analysis": "Turn an idea about behaviour into a measure, analyse the resulting numbers with a suitable method, and explain uncertainty and limits.",
    "D078-A04-tools-quantitative-alternatives": "Choose one suitable option (R, Python, SPSS or Stata) to organise and analyse numerical data. You do not need to learn all of them for one analysis.",
}

NO_DIRECT_ALTERNATIVE = {
    "SOC-K1": "This is foundational social-concepts knowledge, not a choice between tools. Different theories or perspectives can be compared for a question, but they are not interchangeable answers; interviews, observation and documents are ways to study a question, not substitutes for understanding the concepts.",
    "SOC-C1": "There is no substitute for protecting participants and reflecting on the researcher's position when the work creates those responsibilities. Specific safeguards vary with the people, data, institution and study risk; this item complements research design and data stewardship.",
    "SOC-C2": "There is no direct substitute for separating evidence from interpretation. Triangulation, rival explanations and uncertainty checks are complementary ways to strengthen that judgement, not alternatives that remove the need for it.",
    "SOC-C3": "Manual research work is a valid alternative to using AI. If AI is used, recording what it did and what a person checked is still necessary; a different AI product is not an alternative to verification or disclosure rules.",
    "ECON-K1": "This is economic-concepts knowledge, not a software or method choice. Different economic theories or indicators may offer competing lenses, but they are not interchangeable; select the concepts and measures that fit the question and explain their limits.",
    "ECON-C1": "When a design cannot support a causal conclusion, the valid alternative is to make a narrower descriptive, associational or predictive claim—not to use another label for the same unsupported causal claim. The claim must match the evidence available.",
    "ECON-C2": "Manual coding or comparison with a suitable reference measure can be alternatives to an automated validation workflow. They still require a defensible reference, documented error checks and interpretation of what the measure misses.",
    "ECON-C3": "A fully manual workflow is an alternative to using AI. Once AI is used, human checking, transparent records and any applicable disclosure remain; changing the AI tool does not replace those responsibilities.",
}


def main() -> None:
    graph = load(GRAPH_PATH)
    audited = load(CONTRACT_AUDIT_PATH)
    programme_map = load(PROGRAMME_EVIDENCE_PATH)
    sociology = programme_map["Social Sciences::Sociology::D078"]
    area_12 = load(AUDIT / "d078_area_enrichment_lanes_2026_10_10/D078_AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json")
    area_34 = load(AUDIT / "d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_EXTENDED_ENRICHMENT_2026_10_10.json")
    area_34_checkpoint = load(AUDIT / "d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_ENRICHMENT_CHECKPOINT_2026_10_10.json")
    area_role_tasksets = load(AUDIT / "d078_area_role_task_sets_2026_10_09.json")
    previous_overlay = load(OUT_JSON) if OUT_JSON.exists() else {}
    previous_rows = {
        str(row.get("item_id")): row
        for row in previous_overlay.get("records", [])
        if row.get("item_id")
    }

    area_labels = {
        row["area_id"]: row.get("area_label", row.get("label", row["area_id"]))
        for row in audited["areas"]["area_task_family_register"]
    }
    families: dict[str, dict[str, Any]] = {}
    family_by_item: dict[str, dict[str, Any]] = {}
    for area in audited["areas"]["area_task_family_register"]:
        for family in area.get("task_families", []):
            families[family["task_id"]] = family
            for item_id in family.get("candidate_item_ids", []):
                family_by_item[item_id] = family
    # Areas 1-2 use `area_task_families` and Areas 3-4 use `task_families`;
    # reconcile each native lane schema instead of assuming a shared format.
    for family in area_12.get("area_task_families", []):
        family = {
            **family,
            "task_id": family.get("id"),
            "label": family.get("name"),
            "task_wording": family.get("task"),
            "learner_output": family.get("learner_output"),
            "authoritative_source_ids": family.get("evidence", []),
            "task_specific_learning_source_ids": family.get("learning", []),
        }
        families[family["task_id"]] = family
        for item_id in family.get("items", []):
            family_by_item[item_id] = family
    for family in area_34.get("task_families", []):
        families[family["task_family_id"]] = family
        for item_id in family.get("candidate_item_ids", []):
            family_by_item[item_id] = family
    for area in area_34_checkpoint.get("areas", []):
        for family in area.get("task_families", []):
            normalized = {
                **family,
                "task_id": family.get("task_id"),
                "label": family.get("name"),
                "task": family.get("description"),
                "authoritative_source_ids": family.get("authoritative_source_ids", []),
                "task_specific_learning_source_ids": [x.get("source_id") for x in family.get("learning_links", [])],
            }
            families[normalized["task_id"]] = normalized
            for item in family.get("items", []):
                if item.get("item_id"):
                    family_by_item[item["item_id"]] = normalized
    for area_set in area_role_tasksets.get("area_task_sets", []):
        for family in area_set.get("task_families", []) + area_set.get("additional_task_families", []):
            family_id = family.get("task_id")
            if family_id:
                families[family_id] = {
                    **family,
                    "task_id": family_id,
                    "label": family.get("task_wording") or family_id,
                    "task": family.get("task_wording"),
                    "output": family.get("learner_output") or family.get("output"),
                    "authoritative_source_ids": family.get("authoritative_work_source_ids", []),
                    "task_specific_learning_source_ids": family.get("free_task_specific_learning_source_ids", []),
                }

    missing_context_ids = set(audited["areas"]["expanded_area_items"]["missing_record_ids"]["programme_context"])
    missing_task_ids = set(audited["areas"]["expanded_area_items"]["missing_record_ids"]["task_or_use_case"])
    missing_output_ids = set(audited["areas"]["expanded_area_items"]["missing_record_ids"]["learner_output"])
    nodes = [n for n in graph.get("nodes", []) if n.get("kind") == "area_enrichment_item"]
    rows: list[dict[str, Any]] = []

    for node in nodes:
        item_id = node.get("item_id")
        has_current_gap = item_id in missing_context_ids or item_id in missing_task_ids or item_id in missing_output_ids
        previous_row = previous_rows.get(str(item_id))
        if not has_current_gap and not previous_row:
            continue
        if previous_row and not has_current_gap:
            rows.append(previous_row)
            continue
        record = node.get("source_record", {})
        family = family_by_item.get(item_id)
        for task_id in record.get("task_ids", []):
            family = family or families.get(task_id)
        if family is None:
            raise ValueError(f"No task-family source found for {item_id}")

        area_id = node.get("area_id")
        area_label = area_labels.get(area_id, area_id or "the selected area")
        family_task = family.get("task") or family.get("task_wording") or family.get("label", "the work described by this item")
        family_task_clean = str(family_task).strip().rstrip(". ")
        family_task_sentence = family_task_clean + "."
        if area_id == "D078:politics-governance-public-policy":
            programme_bridge = "Sociology helps you examine how institutions, power and social conditions shape people's lives. Public-policy work applies that perspective to decisions and their effects."
            domain_bridge = "This area looks at public institutions, governance and policy decisions using social-science evidence."
        else:
            programme_bridge = "Sociology helps you study how people interact, how groups and institutions shape behaviour, and how social evidence is interpreted. This area adds structured ways to investigate those questions."
            domain_bridge = "This area studies behaviour and interaction in social settings through research; it is not clinical assessment or treatment."
        programme_context = (
            f"{programme_bridge} This item adds optional learning for {area_label}, such as work where you {family_task_clean[0].lower() + family_task_clean[1:] if family_task_clean else 'apply the relevant task'}. "
            "The programme-to-domain connection is broad; it does not mean that the Sociology curriculum teaches or requires this exact method, tool or workflow."
        )
        domain_context = (
            f"{domain_bridge} Here, this item can help with work such as: {family_task_sentence} "
            "It belongs to the selected area, not to a shared list that every D078 learner must complete."
        )
        proposal: dict[str, Any] = dict(previous_row.get("proposed_fields", {})) if previous_row else {}
        proposal.update({
            "programme_meaning": programme_context,
            "meaning_in_D078": domain_context,
        })
        if item_id in missing_task_ids:
            proposal["what_this_helps_you_do"] = LEARNER_WORK_DESCRIPTIONS.get(item_id, family_task_clean + ".")
        if item_id in missing_output_ids:
            proposal["learner_output"] = LEARNER_OUTPUTS[item_id] or family.get("output") or family.get("learner_output")
        if item_id in set(audited["areas"]["expanded_area_items"]["missing_record_ids"]["alternatives"]):
            if item_id not in NO_DIRECT_ALTERNATIVE:
                raise ValueError(f"No item-specific alternative disposition for {item_id}")
            proposal["alternative_disposition"] = NO_DIRECT_ALTERNATIVE[item_id]
            proposal["alternative_state"] = "item_specific_disposition_recorded_no_placeholder"
        if item_id in set(audited["areas"]["expanded_area_items"]["missing_record_ids"]["prerequisites"]):
            proposal["prerequisite_disposition"] = (
                "No formal prerequisite is established for this introductory social-concepts item. Related concepts can be introduced alongside it when needed; the learner's selection does not test prior knowledge or mastery."
            )
            proposal["prerequisite_state"] = "no_formal_prerequisite_established_learning_support_remains_available"
        learner_work_description = (
            proposal.get("what_this_helps_you_do")
            or record.get("task_use")
            or record.get("task_use_and_output")
            or record.get("task_and_output")
            or family_task
        )

        source_ids = list(dict.fromkeys(
            list(record.get("evidence_source_ids", []))
            + list(family.get("authoritative_source_ids", []))
            + list(family.get("evidence_source_ids", []))
        ))
        rows.append({
            "item_id": item_id,
            "label": node.get("label"),
            "area_id": area_id,
            "area_label": area_label,
            "internal_task_group_id": family.get("task_id") or family.get("task_family_id"),
            "internal_task_group_label": family.get("label"),
            "proposed_fields": proposal,
            "learner_facing_heading_for_work_description": "What you might do",
            "learner_facing_work_description_preview": learner_work_description,
            "evidence_refs": {
                "programme_domain_relationship_key": "Social Sciences::Sociology::D078",
                "programme_course_anchor_count": sociology.get("course_anchor_count"),
                "programme_transferable_evidence_count": sociology.get("transferable_evidence_count"),
                "programme_evidence_scope": "Broad Sociology-to-D078 route evidence only; not direct evidence that CCMAS teaches this item.",
                "item_and_task_source_ids": source_ids,
            },
            "content_basis_note": "Context is a bounded synthesis of the reviewed programme-to-domain relationship, the explicitly selected area, and its cited work description. Proposed outputs are illustrative learner work products derived from the documented use case; they are not asserted as universal occupational deliverables.",
            "status": "local_content_fields_repaired_hidden_pending_integrated_claim_and_route_gate",
            "student_visible": False,
            "canonical_change": False,
        })

    expected = (missing_context_ids | missing_task_ids | missing_output_ids) | set(previous_rows)
    found = {r["item_id"] for r in rows}
    if expected != found:
        raise ValueError(f"Expected {len(expected)} gap records, got {len(found)}; missing={sorted(expected-found)}")
    learner_texts = [r["proposed_fields"]["what_this_helps_you_do"] for r in rows if "what_this_helps_you_do" in r["proposed_fields"]]
    if len(set(learner_texts)) != len(learner_texts):
        raise ValueError("Learner work descriptions must be item-specific and unique within this gap set")

    payload = {
        "schema_version": "1.0",
        "artifact_type": "D078 area-item context and content reconciliation overlay",
        "reviewed_on": "2026-10-10",
        "status": "local_content_fields_repaired_hidden_pending_integrated_claim_and_route_gate",
        "source_graph": str(GRAPH_PATH.relative_to(ROOT)).replace("\\", "/"),
        "counts": {
            "source_audit_items_reconciled_for_programme_context": sum("programme_meaning" in r.get("proposed_fields", {}) for r in rows),
            "source_audit_items_reconciled_for_item_task_use_case": sum("what_this_helps_you_do" in r.get("proposed_fields", {}) for r in rows),
            "source_audit_items_reconciled_for_learner_output": sum("learner_output" in r.get("proposed_fields", {}) for r in rows),
            "items_with_explicit_alternative_dispositions": sum("alternative_disposition" in r.get("proposed_fields", {}) for r in rows),
            "items_with_explicit_prerequisite_dispositions": sum("prerequisite_disposition" in r.get("proposed_fields", {}) for r in rows),
            "reconciled_item_records_retained": len(rows),
            "current_source_audit_gaps_remaining": len(missing_context_ids | missing_task_ids | missing_output_ids),
            "student_visible_records": 0,
            "canonical_changes": 0,
        },
        "programme_context_rule": "Sociology-to-D078 evidence supports broad context about social life, groups, institutions and inquiry. Each item-specific explanation connects that background to its selected current area and labels the item as optional enrichment, not CCMAS-taught content.",
        "records": rows,
    }
    write(OUT_JSON, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

    lines = [
        "# D078 area-item context reconciliation - 2026-10-10",
        "",
        "**Status:** local repair of specific item-content fields; records remain hidden pending the integrated claim, checkpoint and route gate. No canonical data or student visibility changed.",
        "",
        "This overlay repairs specific programme-context, task-description, learner-output, alternative and prerequisite fields for the affected area candidates. It distinguishes the broad Sociology-to-D078 route from area enrichment: it does not say that CCMAS teaches or requires a particular method or tool. Source IDs and internal task-group names are staff metadata; learner wording describes the work in plain professional language. These repairs do not by themselves approve student display: integrated item identity, evidence scope, checkpoint placement, relationships and learning-resource gates still apply.",
        "",
        f"- Reconciled programme/domain context: {payload['counts']['source_audit_items_reconciled_for_programme_context']} item records.",
        f"- Reconciled item-specific task/use descriptions: {payload['counts']['source_audit_items_reconciled_for_item_task_use_case']} records.",
        f"- Reconciled illustrative learner outputs: {payload['counts']['source_audit_items_reconciled_for_learner_output']} records.",
        f"- Item-specific alternative dispositions: {payload['counts']['items_with_explicit_alternative_dispositions']}; prerequisite dispositions: {payload['counts']['items_with_explicit_prerequisite_dispositions']}.",
        f"- Reconciled item records retained: {len(rows)}; current source-audit gaps remaining in this targeted set: {payload['counts']['current_source_audit_gaps_remaining']}.",
        "- Student-visible/canonical changes: 0.",
        "",
        "## Programme-context boundary",
        "",
        "The programme note uses the existing `Social Sciences::Sociology::D078` evidence record (19 course anchors and 48 transferable evidence statements) only to explain the broad route into D078. It explicitly says the individual item is optional area enrichment and is not asserted to be CCMAS-taught. This follows the controlling rule that programme context and domain/area enrichment are related but distinct claims.",
        "",
        "## Reconciled item content",
        "",
    ]
    for row in rows:
        lines.extend([
            f"### {row['item_id']} — {row['label']}",
            "",
            f"- What you might do: {row['learner_facing_work_description_preview'] or 'No learner-facing work description is proposed in this record.'}",
            *[f"- {key.replace('_', ' ').capitalize()}: {value}" for key, value in row["proposed_fields"].items()],
            f"- Internal evidence grouping: `{row['internal_task_group_label']}` / `{row['internal_task_group_id']}` (staff metadata only; never render these labels or IDs to students).",
            f"- Evidence IDs: {', '.join(row['evidence_refs']['item_and_task_source_ids']) or 'none attached'}.",
            f"- Proposed fields: {', '.join(row['proposed_fields'])}.",
            "- State: repaired local overlay; hidden pending integrated claim, checkpoint, relationship and learning-resource gates. No canonical promotion or student display.",
            "",
        ])
    lines.extend([
        "## Remaining integration gates",
        "",
        "1. Verify exact source identity/locators and keep each claim within what its cited practice evidence supports.",
        "2. Verify that each free, paid or video learning destination teaches the stated use case; an official reference page alone is not instruction.",
        "3. Preserve proposed learner outputs as illustrative practice artifacts, not universal occupational deliverables.",
        "4. Integrate the repaired fields into the typed item and relationship graph without duplicating inherited domain foundations or assigning new role ownership.",
        "5. Keep student display gated until item identity, checkpoint placement, prerequisites/complements/alternatives, limitations and learning destinations pass together.",
        "",
        f"Machine-readable overlay: `{OUT_JSON.relative_to(ROOT).as_posix()}`.",
    ])
    write(OUT_MD, "\n".join(lines) + "\n")
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    print(json.dumps(payload["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
