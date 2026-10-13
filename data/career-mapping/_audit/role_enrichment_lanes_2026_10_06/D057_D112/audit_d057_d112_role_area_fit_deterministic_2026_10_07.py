"""Deterministic source/task-evidence batch for D057-D112 role-to-area fit.

This is a non-canonical audit. It compares exact role task descriptions against
the reconciled Global Step 1 area boundaries. Titles and ISCO/ESCO membership
are never scoring inputs. Automatic support requires a supported parent-domain
decision and a unique, high-margin, phrase-evidenced area route.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
STEP1 = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
         / "global_step1_specialization_reconciliation_2026_10_06.json")
AREAS = DATA / "domain_specialization_catalog.json"
META = DATA / "domain_meta.json"
PARENT_REVIEW = AUDIT / "role_domain_review_decision_apply_2026_10_07.json"
STEP1_LANE = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
              / "AGENT_D057_D112" / "step1_d057_d112_reconciliation_register_2026_10_06_012.json")
SUPPLEMENTAL = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
                / "AGENT_D057_D112" / "step1_supplemental_domain_evidence_2026_10_06.json")
ROLE_FILES = [DATA / "role_library_v3_cleaned.json",
              DATA / "thin_domain_role_overlays.json",
              DATA / "emerging_role_overlays.json"]
OUT = HERE / "D057_D112_existing_role_area_fit_deterministic_2026_10_07.json"
CHECKPOINT = HERE / "D057_D112_existing_role_area_fit_deterministic_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D057_D112_existing_role_area_fit_deterministic_checkpoint_2026_10_07.md"
PRIOR_REVIEW = HERE / "D057_D112_existing_role_area_fit_review_2026_10_07.json"

STOP = set("a an and are as at be by for from has have in into is its of on or the their this to was were with within across based each including not only work role roles area areas practice services service general relevant".split())
GENERIC_TASK_TERMS = set("access apply assess assessment assist body build care client clients community conduct coordinate create customer customers data decision decisions design develop diagnose digital education electrical environment environments evaluate evaluation experience experiences facility field fit function health help implement improve install institution institutions instruction intervention learning manage management method methods monitor operation operations organize perform person people plan policy provide provision record records report research resource results role service services skill skills software support system systems task technology test train training treatment treat use user users work animal animals veterinary".split())
GENERIC_AREA_LABEL_TERMS = GENERIC_TASK_TERMS | set("area areas practice profession professional specialist specialists technician technicians services production operations".split())
TOKEN_RE = re.compile(r"[a-z0-9+#]+", re.I)


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def rows_from(path: Path):
    value = read(path)
    return value if isinstance(value, list) else value.get("roles", [])


def norm(value: str) -> str:
    return " ".join(TOKEN_RE.findall(str(value or "").casefold()))


def tokens(value: str) -> list[str]:
    return [t for t in TOKEN_RE.findall(str(value or "").casefold()) if t not in STOP and len(t) > 2]


def lemma(token: str) -> str:
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 4 and token.endswith("s") and not token.endswith(("ss", "us", "is")):
        return token[:-1]
    return token


def strip_leading_title_clause(task: str, title: str) -> str:
    """Remove a title repeated as the task sentence's grammatical subject."""
    raw_matches = list(TOKEN_RE.finditer(str(task or "")))
    title_tokens = [lemma(t) for t in tokens(title)]
    if not raw_matches or not title_tokens:
        return task
    raw_lemmas = [lemma(m.group(0).casefold()) for m in raw_matches[:len(title_tokens)]]
    matched = 0
    for a, b in zip(raw_lemmas, title_tokens):
        if a != b:
            break
        matched += 1
    # A first title word is enough only for one-token titles; for multiword
    # titles require at least two words so a coincidental generic verb survives.
    if matched >= (1 if len(title_tokens) == 1 else 2):
        return str(task)[raw_matches[matched - 1].end():].lstrip(" ,:;-—")
    return task


def role_key(row):
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def area_map_for_domain(step_domain):
    raw = step_domain.get("recommended_areas") or []
    if isinstance(raw, dict):
        raw = raw.get("areas") or []
    return raw


def boundary_phrases(area):
    """Build deterministic 2-4 token boundary phrases; labels are not used."""
    boundary = area.get("boundary") or ""
    toks = tokens(boundary)
    phrases = set()
    for n in (2, 3, 4):
        for i in range(len(toks) - n + 1):
            phrase = " ".join(toks[i:i+n])
            # Phrase weights are meaningful only when the phrase is not a
            # repeated generic fragment such as "and associated".
            if len(set(toks[i:i+n])) >= 2:
                phrases.add(phrase)
    # Comma/semicolon clauses preserve short task concepts that stopwords split.
    for clause in re.split(r"[,;:.()]+|\b(?:and|including|such as|while|whereas)\b", boundary, flags=re.I):
        c = tokens(clause)
        if 2 <= len(c) <= 8:
            phrases.add(" ".join(c))
    return phrases


def source_urls(row, parent_decision):
    after = parent_decision.get("after", {})
    refs = (after.get("domain_fit_review_source_refs")
            or row.get("domain_fit_review_source_refs") or [])
    if isinstance(refs, str):
        refs = [refs]
    return list(dict.fromkeys(str(x) for x in refs if x))


def score_candidate(task: str, area: dict, area_idf: dict[str, float], area_phrase_idf: dict[str, float], task_idf: dict[str, float], task_phrase_idf: dict[str, float], source_index: dict):
    task_norm = f" {norm(task)} "
    task_tokens = set(tokens(task))
    boundary_tokens = set(tokens(area.get("boundary", "")))
    common = sorted(task_tokens & boundary_tokens)
    label_tokens = {lemma(t) for t in tokens(area.get("label", ""))
                    if lemma(t) not in GENERIC_AREA_LABEL_TERMS}
    normalized_task_tokens = {lemma(t) for t in task_tokens}
    matched_label_anchors = sorted(label_tokens & normalized_task_tokens)
    phrases = []
    phrase_score = 0.0
    for phrase in boundary_phrases(area):
        if f" {phrase} " in task_norm:
            weight = area_phrase_idf.get(phrase, 1.0)
            # Longer exact task/boundary phrases are stronger than isolated words.
            weight *= 1.0 + 0.3 * (len(phrase.split()) - 2)
            # Repeated task boilerplate is weaker evidence than a phrase that
            # occurs in only a few occupational task records in this domain.
            weight *= task_phrase_idf.get(phrase, 1.0)
            phrases.append({"phrase": phrase, "weight": round(weight, 3)})
            phrase_score += weight
    phrases.sort(key=lambda x: (-len(x["phrase"].split()), -x["weight"], x["phrase"]))
    # Count each boundary term once. Phrases provide the primary evidence;
    # unigrams only help rank potential routes and cannot trigger acceptance.
    # A term is useful only when it is informative on BOTH sides: distinctive
    # among the domain's areas and uncommon in that domain's role-task corpus.
    task_specific_terms = [t for t in common if task_idf.get(t, 1.0) >= 1.5]
    substantive_anchors = [t for t in common if t not in GENERIC_TASK_TERMS
                           and area_idf.get(t, 1.0) >= 1.2 and task_idf.get(t, 1.0) >= 1.25]
    token_score = sum(area_idf.get(t, 1.0) * task_idf.get(t, 1.0) for t in common)
    score = phrase_score + 0.35 * token_score
    evidence = area.get("evidence", [])
    ids = list(dict.fromkeys([*area.get("source_ids", []), *(e.get("source_id") for e in evidence if e.get("source_id"))]))
    source_records = [source_index[sid] for sid in ids if sid in source_index]
    urls = list(dict.fromkeys([*area.get("source_urls", []), *(e.get("url") for e in evidence if e.get("url")), *(s.get("url") for s in source_records if s.get("url"))]))
    claim_limits = list(dict.fromkeys([*(e.get("claim_limit") for e in evidence if e.get("claim_limit")), *(s.get("claim_limit") for s in source_records if s.get("claim_limit"))]))
    exclusions = []
    match = re.search(r"\bexcludes?\s+([^.;]+)", area.get("boundary") or "", re.I)
    if match:
        excluded_terms = set(tokens(match.group(1)))
        matched_excluded_terms = sorted(excluded_terms & task_tokens)
        if len(matched_excluded_terms) >= 2:
            exclusions = matched_excluded_terms
    scope_conflicts = []
    area_scope_text = f"{area.get('label') or ''} {area.get('boundary') or ''}"
    if re.search(r"\bheavy[- ]vehicles?\b", area_scope_text, re.I):
        if not re.search(r"\b(?:heavy[- ]duty|trucks?|lorries|buses|commercial goods vehicles?|articulated vehicles?)\b", task, re.I):
            scope_conflicts.append("heavy_vehicle_scope_not_explicit_in_role_tasks")
    if re.search(r"\b(?:built environments|residential|commercial)\b", area.get("boundary") or "", re.I):
        for label, patterns in {
            "motor_vehicle_work": [r"\bvehicles?\b", r"\bautomotive\b", r"\bcars?\b"],
            "marine_vessel_work": [r"\bvessels?\b", r"\bmarine\b", r"\bships?\b"],
            "rail_vehicle_work": [r"\brail vehicles?\b", r"\brolling stock\b", r"\blocomo?tives?\b"],
            "aircraft_work": [r"\baircraft\b", r"\bavionics\b"],
        }.items():
            if any(re.search(pattern, task, re.I) for pattern in patterns):
                scope_conflicts.append(label)
    return {
        "area_key": area.get("area_key"),
        "label": area.get("label"),
        "boundary": area.get("boundary"),
        "score": round(score, 3),
        "matched_task_boundary_phrases": phrases,
        "matched_distinctive_boundary_terms": task_specific_terms,
        "matched_substantive_area_anchors": substantive_anchors,
        "matched_specific_area_label_anchors": matched_label_anchors,
        "matched_all_boundary_terms": common,
        "explicit_boundary_exclusion_terms_found_in_role_tasks": exclusions,
        "explicit_parent_area_scope_conflicts": scope_conflicts,
        "area_source_ids": ids,
        "area_source_urls": urls,
        "area_claim_limits": claim_limits,
        "area_source_records": source_records,
        "area_source_claim": area.get("source_support_claim"),
        "claim_limits": [x.get("claim_limit") for x in area.get("evidence", []) if x.get("claim_limit")],
    }


def parent_fit(row, decision):
    after = decision.get("after", {})
    status = (after.get("domain_fit_review_status") or row.get("domain_fit_review_status") or "review_required")
    rationale = (after.get("domain_fit_review_basis") or row.get("domain_fit_review_basis")
                 or "No exact source-backed parent-domain disposition is stored.")
    return status, rationale


def main():
    step1 = read(STEP1)
    catalog = read(AREAS)
    metadata = read(META)
    parent = read(PARENT_REVIEW)
    lane_register = read(STEP1_LANE)
    supplemental = read(SUPPLEMENTAL)
    prior_review = read(PRIOR_REVIEW)
    prior_decisions = {r["role_key"]: r["area_fit"] for r in prior_review.get("roles", [])
                       if r.get("role_key") and r.get("area_fit", {}).get("status") != "review_required"}
    parent_rows = {r["role_key"]: r for r in parent.get("changes", []) if r.get("role_key")}
    step_domains = {d["domain_id"]: d for d in step1.get("domains", [])}
    catalog_domains = {d["domain_id"]: d for d in catalog.get("domains", [])}
    source_index = {}
    def index_sources(value):
        if isinstance(value, dict):
            if value.get("source_id") and (value.get("url") or value.get("locator")):
                source_index[value["source_id"]] = value
            for child in value.values():
                index_sources(child)
        elif isinstance(value, list):
            for child in value:
                index_sources(child)
    index_sources(step1)
    index_sources(lane_register)
    index_sources(supplemental)

    # The normalized catalog can omit evidence arrays retained by Global Step
    # 1. Merge citation metadata by exact normalized area label, while keeping
    # the normalized catalog's stable area_key and boundary authoritative.
    for did, cat_domain in catalog_domains.items():
        if not 57 <= int(did[1:]) <= 112:
            continue
        step_areas = area_map_for_domain(step_domains.get(did, {}))
        step_by_label = {norm(a.get("label")): a for a in step_areas if a.get("label")}
        for area in cat_domain.get("areas", []):
            source_area = step_by_label.get(norm(area.get("label")))
            if source_area:
                if not area.get("source_ids"):
                    area["source_ids"] = source_area.get("source_ids", [])
                if not area.get("source_urls"):
                    area["source_urls"] = source_area.get("source_urls", [])
                if not area.get("evidence"):
                    area["evidence"] = source_area.get("evidence", [])
                area["source_support_claim"] = area.get("source_support_claim") or source_area.get("source_support_claim")

    active = {}
    source_paths = {}
    for path in ROLE_FILES:
        for row in rows_from(path):
            try:
                did_num = int(str(row.get("domain_id", "D000"))[1:])
            except ValueError:
                continue
            if not 57 <= did_num <= 112 or row.get("student_path_status") == "excluded":
                continue
            key = role_key(row)
            active.setdefault(key, row)
            source_paths.setdefault(key, str(path.relative_to(ROOT)).replace("\\", "/"))

    # Inverse-document-frequency is calculated only within a domain's proposed
    # area boundaries, ensuring domain-specific terms outrank generic language.
    area_term_idf = {}
    area_phrase_df = {}
    for did, domain in step_domains.items():
        if not 57 <= int(did[1:]) <= 112:
            continue
        areas = area_map_for_domain(domain)
        docs = [set(tokens(a.get("boundary", ""))) for a in areas]
        df = Counter(t for doc in docs for t in doc)
        area_term_idf[did] = {t: 1.0 + math.log((1 + len(docs)) / (1 + n)) for t, n in df.items()}
        phrase_df = Counter(p for a in areas for p in boundary_phrases(a))
        area_phrase_df[did] = {p: 1.0 + math.log((1 + len(areas)) / (1 + n)) for p, n in phrase_df.items()}

    task_doc_terms = defaultdict(Counter)
    task_doc_phrases = defaultdict(Counter)
    task_doc_counts = Counter()
    for row in active.values():
        did = row["domain_id"]
        task_doc_counts[did] += 1
        task_tokens = tokens(strip_leading_title_clause(row.get("description", ""), row.get("role_name", "")))
        task_doc_terms[did].update(set(task_tokens))
        task_phrases = {" ".join(task_tokens[i:i+n]) for n in (2, 3, 4)
                        for i in range(len(task_tokens) - n + 1)}
        task_doc_phrases[did].update(task_phrases)
    task_idfs = {did: {t: 1.0 + math.log((1 + task_doc_counts[did]) / (1 + n))
                       for t, n in counts.items()} for did, counts in task_doc_terms.items()}
    task_phrase_idfs = {did: {p: 1.0 + math.log((1 + task_doc_counts[did]) / (1 + n))
                              for p, n in counts.items()} for did, counts in task_doc_phrases.items()}

    records = []
    valid_role_keys = set(active)
    catalog_area_keys = {d["domain_id"]: {a.get("area_key") for a in d.get("areas", [])}
                         for d in catalog.get("domains", [])}
    for key, row in active.items():
        did = row["domain_id"]
        task = str(row.get("description") or "")
        task_for_scoring = strip_leading_title_clause(task, row.get("role_name", ""))
        parent_decision = parent_rows.get(key, {})
        parent_status, parent_rationale = parent_fit(row, parent_decision)
        parent_refs = source_urls(row, parent_decision)
        areas = catalog_domains.get(did, {}).get("areas", [])
        idf = area_term_idf.get(did, {})
        task_idf = task_idfs.get(did, {})
        candidates = [score_candidate(task_for_scoring, a, idf, area_phrase_df.get(did, {}), task_idf,
                                      task_phrase_idfs.get(did, {}), source_index) for a in areas]
        candidates.sort(key=lambda c: (-c["score"], c["area_key"] or ""))
        top = candidates[0] if candidates else None
        second = candidates[1] if len(candidates) > 1 else None
        phrase_count = len(top["matched_task_boundary_phrases"]) if top else 0
        distinct_phrase_words = {w for p in (top or {}).get("matched_task_boundary_phrases", []) for w in p["phrase"].split()}
        specific_terms = (top or {}).get("matched_distinctive_boundary_terms", [])
        margin = round(top["score"] - second["score"], 3) if top and second else (top["score"] if top else 0)
        specific_phrase = any(len(p["phrase"].split()) >= 2 and p["weight"] >= 1.55
                              and area_phrase_df.get(did, {}).get(p["phrase"], 1.0) >= 1.35
                              for p in (top or {}).get("matched_task_boundary_phrases", []))
        anchored_phrase = any(any(term in p["phrase"].split() for term in (top or {}).get("matched_substantive_area_anchors", []))
                              for p in (top or {}).get("matched_task_boundary_phrases", []))
        label_anchored_phrase = any(any(lemma(term) in {lemma(w) for w in p["phrase"].split()}
                                        for term in (top or {}).get("matched_specific_area_label_anchors", []))
                                    for p in (top or {}).get("matched_task_boundary_phrases", []))
        strong = bool(top and top["score"] >= 2.0 and margin >= 0.8 and
                      top["area_source_ids"] and top["area_source_urls"] and top["area_claim_limits"] and
                      not top["explicit_parent_area_scope_conflicts"] and
                      len(top["matched_substantive_area_anchors"]) >= 2 and anchored_phrase and
                      top["matched_specific_area_label_anchors"] and label_anchored_phrase and
                      ((specific_phrase and len(specific_terms) >= 1) or
                       (phrase_count >= 2 and len(distinct_phrase_words) >= 3 and len(specific_terms) >= 2)))
        prior = prior_decisions.get(key)
        prior_validation = {"present_in_prior_review": bool(prior), "provenance_retained": bool(prior),
                            "keys_and_area_source_refs_validated": False,
                            "decision_revalidated_for_import": False,
                            "original_status": prior.get("status") if prior else None,
                            "original_area_key": prior.get("area_key") if prior else None,
                            "original_rationale": prior.get("rationale") if prior else None,
                            "original_alias_target_role_key": prior.get("alias_target_role_key") if prior else None,
                            "validation_reason": "No prior explicit area disposition."}
        if prior:
            old_area_key = prior.get("area_key")
            old_area_valid = old_area_key is None or old_area_key in catalog_area_keys.get(did, set())
            old_alias_key = prior.get("alias_target_role_key")
            old_alias_valid = old_alias_key is None or old_alias_key in valid_role_keys
            old_area_candidate = next((a for a in candidates if a.get("area_key") == old_area_key), None) if old_area_key else None
            old_area_sources_valid = bool(old_area_candidate and old_area_candidate["area_source_ids"]
                                          and old_area_candidate["area_source_urls"] and old_area_candidate["area_claim_limits"])
            if prior.get("status") == "direct_domain_role":
                prior_validation["validation_reason"] = ("Prior direct-domain route conflicts with current rule: this domain has one or more reconciled recommended areas; "
                                                          "the direct route is preserved as provenance but not carried forward.")
            elif not old_area_valid:
                prior_validation["validation_reason"] = "Prior area_key is absent from the current reconciled catalog; disposition not imported."
            elif not old_alias_valid:
                prior_validation["validation_reason"] = "Prior alias target key is not an active role record; alias not imported."
            elif prior.get("status") == "alias_existing":
                prior_validation["keys_and_area_source_refs_validated"] = bool(old_area_valid and old_alias_valid and old_area_sources_valid)
                target = active.get(old_alias_key, {})
                this_terms = set(tokens(task))
                target_terms = set(tokens(target.get("description", "")))
                task_similarity = len(this_terms & target_terms) / max(1, len(this_terms | target_terms))
                target_prior = prior_decisions.get(old_alias_key, {})
                target_area_ok = target_prior.get("area_key") == old_area_key
                if task_similarity >= 0.75 and target_area_ok and old_area_sources_valid:
                    prior_validation.update({"decision_revalidated_for_import": True, "validation_reason": "Alias target exists; role task vocabularies overlap >=0.75 by Jaccard; prior and target area routes agree and area source references/claim limits are present."})
                else:
                    prior_validation["validation_reason"] = (f"Alias not confirmed by task text/route: task-token Jaccard={task_similarity:.3f}; "
                                                              f"prior target area agrees={target_area_ok}.")
            elif prior.get("status") == "supported":
                prior_validation["keys_and_area_source_refs_validated"] = bool(old_area_valid and old_area_sources_valid)
                if parent_status.casefold() == "supported" and strong and top.get("area_key") == old_area_key:
                    prior_validation.update({"decision_revalidated_for_import": True, "validation_reason": "Prior role and area keys exist; independent parent fit is supported; deterministic unique task/boundary evidence reproduces the same area route; cited area sources and claim limits are present."})
                else:
                    prior_validation["validation_reason"] = (f"Prior supported route not reproduced by current evidence gate: parent={parent_status}, "
                                                              f"strong_unique_match={strong}, current_top_area={top.get('area_key') if top else None}.")
            else:
                prior_validation["validation_reason"] = f"Prior status {prior.get('status')!r} is not an importable supported/alias disposition."
        if prior_validation["decision_revalidated_for_import"] and prior and prior.get("status") == "alias_existing":
            area_status = "alias_existing"
            decision_reason = "Validated prior alias: target active role exists, exact task-text overlap passes the recorded threshold, and both records retain the same current area route."
            selected = prior.get("area_key")
        elif not areas:
            area_status = "direct_domain_role"
            decision_reason = "No recommended area of specialization exists for this domain; the supported role remains directly under its parent domain."
            selected = None
        elif parent_status.casefold() in {"rejected", "not_fit", "unsupported", "remove", "not_supported"}:
            area_status = "parent_domain_not_fit"
            decision_reason = "The existing source-backed parent-domain review rejects this role-to-domain link; no downstream area route is retained."
            selected = None
        elif parent_status.casefold() != "supported":
            area_status = "review_required"
            decision_reason = f"Parent-domain gate is {parent_status!r}, not supported; area scoring cannot cure the parent-fit limitation. Residual: resolve the cited parent-domain condition first."
            selected = None
        elif top and top.get("explicit_parent_area_scope_conflicts"):
            area_status = "review_required"
            decision_reason = ("Task text does not establish, or explicitly places this role outside, a required area-specific setting "
                               f"({', '.join(top['explicit_parent_area_scope_conflicts'])}); lexical overlap cannot support this route. "
                               "Check other area candidates and whether the parent-domain link needs review.")
            selected = None
        elif strong:
            area_status = "supported"
            decision_reason = ("Unique source-backed area route: exact task/boundary phrase evidence is distinctive within this domain, "
                               f"the top route exceeds the next area by {margin:.3f}, and the role task contains area-distinctive terms; "
                               "parent-domain fit is independently supported.")
            selected = top["area_key"]
        elif top and top["score"] >= 1.0 and (not second or margin < 0.7):
            area_status = "review_required"
            decision_reason = (f"Task text overlaps area boundaries but no unique high-confidence route is established (top={top['score']:.3f}, "
                               f"runner-up={(second or {}).get('score', 0):.3f}, margin={margin:.3f}, exact phrases={phrase_count}); "
                               "review the listed route candidates and source locators.")
            selected = None
        else:
            area_status = "review_required"
            decision_reason = (f"No recommended area has enough distinctive task-boundary phrase evidence (top score={top['score'] if top else 0:.3f}, "
                               f"exact phrases={phrase_count}); inspect the role source locator and area-boundary sources, then assign or reject explicitly.")
            selected = None
        task_source_code = row.get("esco_code") or row.get("isco_group")
        records.append({
            "role_key": key,
            "domain_id": did,
            "role_title": row.get("role_name"),
            "role_source_file": source_paths[key],
            "role_task_evidence": task,
            "role_task_evidence_used_for_fit_with_leading_title_subject_removed": task_for_scoring,
            "role_task_source": {
                "source_system": row.get("source"),
                "source_id": f"{str(row.get('source') or 'unknown').upper()}:{task_source_code or key}",
                "source_code_context_only_not_fit_evidence": task_source_code,
                "source_urls": parent_refs,
                "locator": "Exact task description field on the checked-in active role record; source URLs are the role/domain review citations carried with that record.",
                "limitation": "Occupational classification membership and role title are excluded from fit scoring; task prose and cited task source are the evidence inputs.",
            },
            "parent_domain_fit": {"status": parent_status, "rationale": parent_rationale, "source_urls": parent_refs},
            "recommended_area_candidates": candidates,
            "decision": {
                "status": area_status,
                "selected_area_key": selected,
                "selected_area_label": next((a["label"] for a in areas if a.get("area_key") == selected), None),
                "reason": decision_reason,
                "confidence": "high" if area_status in {"supported", "parent_domain_not_fit", "direct_domain_role"} else "unresolved",
                "top_score": top["score"] if top else None,
                "runner_up_score": second["score"] if second else None,
                "score_margin": margin,
                "matched_task_boundary_phrases": top["matched_task_boundary_phrases"] if top else [],
                "matched_distinctive_boundary_terms": top["matched_distinctive_boundary_terms"] if top else [],
                "area_source_ids": top["area_source_ids"] if top else [],
                "area_source_urls": top["area_source_urls"] if top else [],
                "area_claim_limits": top["area_claim_limits"] if top else [],
                "area_evidence_locators": [
                    {"source_id": source.get("source_id"), "url": source.get("url"), "locator": source.get("locator"),
                     "claim_supported": source.get("claim_supported"), "claim_limit": source.get("claim_limit")}
                    for source in (top or {}).get("area_source_records", []) if source.get("locator")
                ],
                "matched_specific_area_label_anchors": (top or {}).get("matched_specific_area_label_anchors", []),
                "automatic_acceptance_rule_passed": strong and parent_status.casefold() == "supported",
            },
            "prior_explicit_disposition_validation": prior_validation,
            "canonical_files_edited": False,
        })

    area_counts = Counter(r["decision"]["status"] for r in records)
    residual = [{"role_key": r["role_key"], "domain_id": r["domain_id"], "role_title": r["role_title"],
                 "reason": r["decision"]["reason"], "parent_status": r["parent_domain_fit"]["status"],
                 "top_candidates": [{"area_key": a["area_key"], "label": a["label"], "score": a["score"],
                                     "matched_task_boundary_phrases": a["matched_task_boundary_phrases"][:8],
                                     "area_source_ids": a["area_source_ids"], "area_source_urls": a["area_source_urls"],
                                     "area_claim_limits": a["area_claim_limits"],
                                     "explicit_parent_area_scope_conflicts": a["explicit_parent_area_scope_conflicts"]}
                                    for a in r["recommended_area_candidates"][:3]]}
                for r in records if r["decision"]["status"] == "review_required"]
    parent_counts = Counter(r["parent_domain_fit"]["status"] for r in records)
    payload = {
        "schema_version": "2026-10-07.d057-d112.deterministic-role-area-fit.v1",
        "lane": "D057-D112", "status": "batch_complete_residuals_explicit",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "counts": {"active_role_records": len(records), "unique_role_keys": len({r['role_key'] for r in records}),
                   "domains_with_roles": len({r['domain_id'] for r in records}),
                   "recommended_area_records": sum(len(catalog_domains.get(f"D{i:03d}", {}).get("areas", [])) for i in range(57, 113)),
                   "parent_fit_statuses": dict(parent_counts), "area_fit_dispositions": dict(area_counts),
                   "auto_supported_area_routes": area_counts["supported"], "direct_domain_role_routes": area_counts["direct_domain_role"],
                   "parent_domain_rejections": area_counts["parent_domain_not_fit"],
                   "prior_explicit_decisions_found": sum(r["prior_explicit_disposition_validation"]["present_in_prior_review"] for r in records),
                   "prior_decision_provenance_retained": sum(r["prior_explicit_disposition_validation"]["provenance_retained"] for r in records),
                   "prior_keys_and_area_source_refs_validated": sum(r["prior_explicit_disposition_validation"]["keys_and_area_source_refs_validated"] for r in records),
                   "prior_decisions_revalidated_for_operational_import": sum(r["prior_explicit_disposition_validation"]["decision_revalidated_for_import"] for r in records),
                   "exact_residual_roles": len(residual), "roles_with_all_candidate_routes_scored": len(records)},
        "method": {
            "evidence_inputs": ["exact role task description in current checked-in active role record", "reconciled Global Step 1 area label/boundary and its source IDs/URLs", "existing independent source-backed role-to-parent-domain decision and citations"],
            "excluded_inputs": ["role title", "ISCO/ESCO membership or code", "existing subgroup membership", "simple title similarity"],
            "scoring": "Within-domain inverse-frequency weighting over recommended area-boundary terms. Each route records exact 2-4 word or clause phrases appearing in both task text and boundary. Unigram overlaps only rank candidates and cannot trigger acceptance.",
            "auto_accept_rule": "Parent-domain status must be supported; area must carry source IDs, URLs, and an explicit source claim limit; top score >= 2.0; margin >= 0.8; at least two matched substantive area anchors (generic actions/objects excluded), and an exact matched phrase containing an anchor. Require either one distinctive exact phrase plus a task-rare term or two exact phrases plus two task-rare terms. Remove a role title repeated as the task sentence's grammatical subject before scoring. No explicit boundary-scope conflict may exist. Only the unique top area is accepted.",
            "direct_route_rule": "Direct domain-to-role only when the normalized recommended-area catalog contains zero areas for that domain.",
            "uncertainty_rule": "Conditional parent fit, low phrase evidence, or close area candidates remain review_required with exact scores, matched phrases, candidate source refs, and a specific next evidence gap.",
            "limitations": "This deterministic lexical pass finds direct task-to-boundary evidence already present in local data; it does not establish missing occupational facts or replace adjudication where task scope is broad or the area boundary uses non-overlapping terminology. No canonical files were edited.",
        },
        "prior_review_source": {"path": str(PRIOR_REVIEW.relative_to(ROOT)).replace("\\", "/"),
                                "explicit_non_review_decisions": len(prior_decisions),
                                "rule": "Prior decisions are retained verbatim with validation provenance. They are only imported if keys, current area key, parent gate, and task evidence validate. Prior direct-domain routes are not imported when areas exist."},
        "residual_queue": residual,
        "roles": records,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    checkpoint = {"schema_version": "2026-10-07.d057-d112.deterministic-role-area-fit-checkpoint.v1",
                  "lane": "D057-D112", "status": "batch_complete_residuals_explicit", "counts": payload["counts"],
                  "remaining_role_keys": [r["role_key"] for r in residual], "canonical_files_edited": False,
                  "report": str(OUT.relative_to(ROOT)).replace("\\", "/"), "test_status": "pending"}
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# D057-D112 deterministic existing-role area-fit checkpoint — 2026-10-07\n\n"
        f"Dispositioned {len(records)} active role records across {payload['counts']['domains_with_roles']} domains. "
        f"Parent statuses: {dict(parent_counts)}. Area dispositions: {dict(area_counts)}. "
        f"Exact residual queue: {len(residual)} roles.\n\n"
        f"Report: `{OUT.relative_to(ROOT).as_posix()}`. Canonical files edited: no. Tests: pending.\n\n"
        "Each role retains all area candidates with score, exact matched task/boundary phrases, area evidence references, separate parent-fit citations, and a per-role disposition reason.\n",
        encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
