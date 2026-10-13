"""Classify and safely annotate JAMB compound-title discovery candidates.

This is deliberately a source-layer audit/repair.  It does not touch domains,
subgroups, roles, SQL, or UI data.  A conjunction, slash, ampersand, or
``with`` in a JAMB title is only a discovery signal; it is never enough to
create a combined curriculum.  The script compares the current JAMB scope,
the original JAMB brochure text, and the CCMAS package/course crosswalk.

Dry-run is the default.  ``--apply`` writes a new, append-only scope artifact
unless ``--in-place`` is explicitly supplied.  Even in apply mode, a mapping
component is never added automatically: only a deterministic audit record is
attached to the JAMB scope.  This prevents a title-only guess from becoming a
curriculum repair.  Cases with insufficient evidence receive an explicit
``unresolved`` or ``unsupported`` disposition.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
JAMB_TXT = ROOT / "data" / "career-mapping" / "_jamb_txt"
DOWNLOADS = Path(r"C:\Users\USER\Downloads\jamb brochure")
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CROSSWALK = AUDIT / "ccmas_original_document_crosswalk_2026-09-29.json"

DEFAULT_PREFIX = AUDIT / "jamb_compound_display_name_classifier_2026-09-30"
TODAY = date(2026, 9, 30).isoformat()


STOPWORDS = {
    "and", "or", "with", "in", "of", "the", "for", "studies", "study",
    "science", "sciences", "technology", "management", "programme",
    "program", "applied", "pure", "industrial", "strategic", "general",
    "bachelor", "arts", "literary", "literature", "language", "languages",
    "information", "resource", "resources", "public", "international",
    "environmental", "social", "human", "business", "development",
    "option", "options", "application", "applications", "technology",
}

# These are deliberately conservative aliases.  They are used to detect a
# named CCMAS package that is absent from the current scope, not to prove a
# curriculum match.  A detected missing alias is therefore unresolved until
# package/course evidence also exists.
PACKAGE_ALIASES = {
    "accounting": "Administration and Management::Accounting",
    "actuarial science": "Administration and Management::Actuarial Science",
    "insurance": "Administration and Management::Insurance",
    "finance": "Administration and Management::Finance / Banking and Finance",
    "banking and finance": "Administration and Management::Finance / Banking and Finance",
    "computer science": "Computing::Computer Science",
    "data science": "Computing::Data Science",
    "mathematics": "Sciences::Mathematics",
    "industrial mathematics": "Sciences::Industrial Mathematics",
    "economics": "Social Sciences::Economics",
    "statistics": "Sciences::Statistics",
    "chemistry": "Sciences::Chemistry",
    "industrial chemistry": "Sciences::Industrial Chemistry",
    "physics": "Sciences::Physics",
    "industrial physics": "Sciences::Industrial Physics",
    "physics with electronics": "Sciences::Physics with Electronics",
    "geology": "Sciences::Geology",
    "applied geophysics": "Sciences::Applied Geophysics",
    "biology": "Sciences::Biology",
    "biotechnology": "Sciences::Biotechnology",
    "microbiology": "Sciences::Microbiology",
    "zoology": "Sciences::Zoology",
    "marine science": "Sciences::Marine Science",
    "international relations": "Social Sciences::International Relations",
    "political science": "Social Sciences::Political Science",
    "public administration": "Administration and Management::Public Administration",
    "development studies": "Social Sciences::Development Studies",
    "peace studies and conflict resolution": "Social Sciences::Peace Studies and Conflict Resolution",
    "history": "Arts::History/History and Diplomatic Studies",
    "english": "Arts::English Language and Literature",
    "french": "Arts::Modern European Languages B.A (French)",
    "german": "Arts::Modern European Languages B.A (German)",
    "russian": "Arts::Modern European Languages (Russian)",
    "portuguese": "__custom__::Portuguese",
    "forestry": "Agricultural Science::Forest Resources and Wildlife Management",
    "fisheries": "Agricultural Science::Fisheries and Aquaculture",
}

SOURCE_TEXT_BY_JAMB_FILE = {
    "Law.pdf": "Law.txt",
    "Social Management Science.pdf": "Social Management Science.txt",
    "Administration.pdf": "Administration.txt",
    "Sciences.pdf": "Sciences.txt",
    "Arts _ Humanities.pdf": "arts_hum.txt",
    "Agriculture.pdf": "agriculture.txt",
    "Education.pdf": "education.txt",
    "Engineering _ Enviromental _ Technology.pdf": "engineering.txt",
    "Medica_Pharmaceutical Health Science.pdf": "medical.txt",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def compact(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", norm(value))


def tokens(value: Any) -> set[str]:
    return {t for t in norm(value).split() if t and t not in STOPWORDS}


def sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def source_pdf_path(source_file: str) -> Path | None:
    direct = DOWNLOADS / source_file
    if direct.exists():
        return direct
    text_to_pdf = {
        "Law.txt": "Law.pdf",
        "Social Management Science.txt": "Social Management Science.pdf",
        "Administration.txt": "Administration.pdf",
        "Sciences.txt": "Sciences.pdf",
        "arts_hum.txt": "Arts _ Humanities.pdf",
        "agriculture.txt": "Agriculture.pdf",
        "education.txt": "Education.pdf",
        "engineering.txt": "Engineering _ Enviromental _ Technology.pdf",
        "medical.txt": "Medica_Pharmaceutical Health Science.pdf",
    }
    if source_file in text_to_pdf and (DOWNLOADS / text_to_pdf[source_file]).exists():
        return DOWNLOADS / text_to_pdf[source_file]
    aliases = {
        "Arts _ Humanities.pdf": "Arts _ Humanities.pdf",
        "Medica_Pharmaceutical Health Science.pdf": "Medica_Pharmaceutical Health Science.pdf",
        "Engineering _ Enviromental _ Technology.pdf": "Engineering _ Enviromental _ Technology.pdf",
        "Social Management Science.pdf": "Social Management Science.pdf",
    }
    name = aliases.get(source_file, source_file)
    path = DOWNLOADS / name
    return path if path.exists() else None


def source_text_path(source_file: str) -> Path | None:
    if source_file.endswith(".txt"):
        direct = JAMB_TXT / source_file
        return direct if direct.exists() else None
    name = SOURCE_TEXT_BY_JAMB_FILE.get(source_file)
    if not name:
        return None
    path = JAMB_TXT / name
    return path if path.exists() else None


def source_title_evidence(occurrence: dict[str, Any]) -> dict[str, Any]:
    source_file = occurrence.get("source_file") or ""
    text_path = source_text_path(source_file)
    pdf_path = source_pdf_path(source_file)
    title = occurrence.get("jamb_name") or occurrence.get("canonical_identity_name") or ""
    title_key = compact(title)
    text_key = compact(text_path.read_text(encoding="utf-8", errors="replace")) if text_path else ""
    located = bool(title_key and title_key in text_key)
    return {
        "source_file": source_file,
        "source_pdf_present": bool(pdf_path),
        "source_pdf_sha256": sha256(pdf_path) if pdf_path else None,
        "source_text_file": str(text_path.relative_to(ROOT)) if text_path else None,
        "title_located_in_extracted_original_pdf_text": located,
        "existing_pdf_cell_verified": occurrence.get("verified_against_pdf") is True,
        "existing_pdf_locator": occurrence.get("pdf_table_locator"),
    }


def split_title_facets(title: str) -> list[str]:
    """Return meaningful title chunks without treating them as proof."""
    text = re.sub(r"\(\s*(?:i|ii|iii|iv)\s*\.?", " ", title, flags=re.I)
    text = re.sub(r"\b(?:i|ii|iii|iv)\s*\.\s*", " ", text, flags=re.I)
    parts = re.split(r"\s*(?:/|&|\band\b|\bwith\b|\bwith/and\b)\s*", text, flags=re.I)
    out = []
    for part in parts:
        clean = re.sub(r"[^A-Za-z0-9]+", " ", part).strip()
        if clean and clean.lower() not in {"options", "option"}:
            out.append(clean)
    return out


def phrase_matches(title: str) -> list[dict[str, str]]:
    title_norm = norm(title)
    matches = []
    for phrase, ref in sorted(PACKAGE_ALIASES.items(), key=lambda x: (-len(x[0]), x[0])):
        if re.search(r"(?<![a-z])" + re.escape(phrase) + r"(?![a-z])", title_norm):
            matches.append({"phrase": phrase, "component_ref": ref})
    # A short phrase can be nested inside a stronger phrase (``physics``
    # inside ``physics with electronics`` or ``chemistry`` inside
    # ``industrial chemistry``).  Do not manufacture a second component from
    # that nested word.  Also keep only the longest alias for each reference.
    longest: list[dict[str, str]] = []
    for match in matches:
        if any(
            compact(match["phrase"]) != compact(other["phrase"])
            and compact(match["phrase"]) in compact(other["phrase"])
            for other in longest
        ):
            continue
        longest.append(match)
    kept: dict[str, dict[str, str]] = {}
    for match in longest:
        old = kept.get(match["component_ref"])
        if old is None or len(match["phrase"]) > len(old["phrase"]):
            kept[match["component_ref"]] = match
    return sorted(kept.values(), key=lambda x: (x["component_ref"], x["phrase"]))


def ref_package(ref: str) -> tuple[str, str] | None:
    if "::" not in ref:
        return None
    discipline, programme = ref.split("::", 1)
    return discipline, programme


def current_package_evidence(scope: dict[str, Any]) -> dict[str, Any]:
    selected = scope.get("selected_courses") or []
    package_counts: Counter[str] = Counter()
    for row in selected:
        source_file = row.get("source_ccmas_file")
        programme = row.get("source_ccmas_programme")
        if not source_file and row.get("source_external_file"):
            source_file = row.get("source_external_file")
            programme = row.get("source_external_programme")
        if source_file and programme:
            package_counts[f"{source_file}::{programme}"] += 1
    ref_evidence = {}
    for ref in scope.get("component_refs") or []:
        discipline, programme = ref_package(ref) or (None, None)
        matches = [k for k in package_counts if k.endswith(f"::{programme}")] if programme else []
        ref_evidence[ref] = {
            "selected_course_count": sum(package_counts[k] for k in matches),
            "selected_source_packages": matches,
            "selected_component_evidence": bool(matches),
        }
    return {
        "selected_package_counts": dict(sorted(package_counts.items())),
        "component_refs": ref_evidence,
        "selected_course_count": len(selected),
    }


def package_corpus(scope: dict[str, Any], ref: str) -> str:
    selected = scope.get("selected_courses") or []
    programme = ref.split("::", 1)[1] if "::" in ref else ""
    rows = [
        r for r in selected
        if r.get("source_ccmas_programme") == programme
        or r.get("source_external_programme") == programme
    ]
    parts = []
    for row in rows:
        parts.extend([str(row.get("title") or ""), str(row.get("content_summary") or "")])
        parts.extend(str(item or "") for item in (row.get("learning_outcomes") or []))
    return norm(" ".join(parts))


def stem_token(token: str) -> str:
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 4 and token.endswith("s"):
        return token[:-1]
    return token


def lexical_variant_for_single_component(title: str, ref: str) -> bool:
    """Return true only for a strict naming variant, not course-text overlap."""
    title_without_context = re.sub(r"\([^)]*\)", " ", title)
    title_tokens = {stem_token(t) for t in tokens(title_without_context)}
    if "::" not in ref:
        return False
    programme_tokens = {stem_token(t) for t in tokens(ref.split("::", 1)[1])}
    alias_tokens = {
        frozenset(stem_token(t) for t in tokens(alias))
        for alias, alias_ref in PACKAGE_ALIASES.items()
        if alias_ref == ref
    }
    if title_tokens == programme_tokens or frozenset(title_tokens) in alias_tokens:
        return True
    # A programme title may repeat the same lexical component with a plural,
    # slash, or spelling variant (e.g. Nursing/Nursing Science).  Permit only
    # a one-token extension when that extension is already in the package name.
    return bool(title_tokens and title_tokens <= programme_tokens)


def classify(row: dict[str, Any], scope: dict[str, Any]) -> dict[str, Any]:
    title = row["jamb_name"]
    refs = list(scope.get("component_refs") or [])
    source_occurrences = scope.get("source_occurrences") or row.get("source_occurrences") or []
    source_evidence = [source_title_evidence(o) for o in source_occurrences]
    package_evidence = current_package_evidence(scope)
    matched_aliases = phrase_matches(title)
    current_refs = set(refs)
    missing_exact_aliases = []
    current_programme_tokens = [
        tokens(ref.split("::", 1)[1]) for ref in current_refs if "::" in ref
    ]
    title_norm = norm(title)
    for match in matched_aliases:
        if match["component_ref"] in current_refs:
            continue
        alias_tokens = tokens(match["phrase"])
        # Do not treat a base discipline as a missing second package when the
        # current component is its more specific CCMAS package (e.g. Physics
        # within Physics with Electronics, or Mathematics within Industrial
        # Mathematics).
        if any(alias_tokens and alias_tokens <= package_tokens for package_tokens in current_programme_tokens):
            continue
        # Economics in Home Economics, Cooperative Economics, and Agribusiness
        # is a field name, not evidence of a separate Economics curriculum.
        if match["phrase"] == "economics" and re.search(
            r"\b(?:home|cooperative|agribusiness|agricultural)\s+economics\b", title_norm
        ):
            continue
        missing_exact_aliases.append(match)
    title_facets = split_title_facets(title)
    unsupported = list(scope.get("unsupported_facets") or [])
    unrepresented = scope.get("unrepresented_facets") or []
    all_selected_text = norm(" ".join(
        [str(r.get("title") or "") + " " + str(r.get("content_summary") or "") + " " + " ".join(str(item or "") for item in (r.get("learning_outcomes") or []))
         for r in scope.get("selected_courses") or []]
    ))

    evidence_complete = all(v["selected_component_evidence"] for v in package_evidence["component_refs"].values()) if refs else False
    if unsupported or unrepresented:
        disposition = "unsupported_named_facet"
        reason = "The scope already records a named facet that is not represented by a transferable curriculum; retain it explicitly rather than guessing."
    elif len(refs) >= 2 and evidence_complete and not missing_exact_aliases:
        disposition = "confirmed_combined_curriculum"
        reason = "Multiple CCMAS components are declared and each has selected course evidence in the current scope."
    elif missing_exact_aliases:
        # Never expand a curriculum from a title alone.  This is the guarded
        # repair queue for exact named CCMAS packages absent from the scope.
        disposition = "unresolved_named_component"
        reason = "The title names a CCMAS package alias that is absent from component_refs; course/package evidence must be reconciled before adding it."
    elif len(refs) == 1:
        ref = refs[0]
        corpus = package_corpus(scope, ref)
        # A title can be an alternate award name or a specialization inside a
        # single package.  Only an exact phrase in the selected course text is
        # accepted as embedded-facet evidence; token-by-token overlap is too
        # weak because generic words recur throughout CCMAS packages.
        extra_chunks = []
        mapped_phrase = next((m["phrase"] for m in matched_aliases if m["component_ref"] == ref), None)
        for facet in title_facets:
            if mapped_phrase and compact(facet) == compact(mapped_phrase):
                continue
            if compact(facet) and compact(facet) in compact(corpus):
                continue
            if facet.strip():
                extra_chunks.append(facet)
        if lexical_variant_for_single_component(title, ref):
            disposition = "title_only_false_positive"
            reason = "The title is a strict lexical variant of one CCMAS package; no second curriculum is evidenced."
        elif not extra_chunks:
            disposition = "single_package_embedded_facet"
            reason = "The named specialization/facet appears as an exact phrase in the selected single-package CCMAS course text; no second curriculum is inferred."
        else:
            disposition = "unresolved_named_facet"
            reason = "A named title facet is not demonstrated by the selected single-package course text; no second curriculum is added."
    else:
        disposition = "unresolved_no_curriculum_evidence"
        reason = "No component is selected and the title alone cannot establish a CCMAS curriculum."

    repair_eligible = disposition == "confirmed_combined_curriculum" and not missing_exact_aliases
    return {
        "canonical_order": row.get("canonical_order"),
        "jamb_name": title,
        "source_faculty": sorted({o.get("source_faculty") for o in source_occurrences if o.get("source_faculty")}),
        "source_institutions": sorted({i for o in source_occurrences for i in (o.get("institutions") or [])}),
        "source_occurrence_ids": [o.get("occurrence_id") for o in source_occurrences if o.get("occurrence_id")],
        "source_pdf_evidence": source_evidence,
        "title_facets": title_facets,
        "matched_ccmas_aliases": matched_aliases,
        "current_component_refs": refs,
        "missing_exact_ccmas_aliases": missing_exact_aliases,
        "current_package_evidence": package_evidence,
        "scope_status_before": scope.get("scope_status"),
        "unsupported_facets_before": unsupported,
        "unrepresented_facets_before": unrepresented,
        "disposition": disposition,
        "repair_eligible": repair_eligible,
        "reason": reason,
    }


def render_markdown(result: dict[str, Any]) -> str:
    counts = result["counts"]
    lines = [
        "# JAMB compound display-name classification (2026-09-30)",
        "",
        "This checkpoint covers only the 191 JAMB discovery candidates whose titles contain a compound separator or conjunction. It does not audit or modify downstream domains, subgroups, roles, UI, or SQL.",
        "",
        "## Counts",
        "",
    ]
    for key, value in counts.items():
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "## Guardrail",
        "",
        "A title is not treated as proof of a combined curriculum. A component is considered evidenced only when the current scope has selected course rows carrying that CCMAS package. Missing named packages are left unresolved; unsupported facets are recorded explicitly.",
        "",
        "## Row dispositions",
        "",
        "| Order | JAMB name | Disposition | Current components | Missing exact aliases | Source context |",
        "|---:|---|---|---|---|---|",
    ]
    for row in result["rows"]:
        lines.append(
            f"| {row['canonical_order']} | {row['jamb_name'].replace('|', '\\|')} | `{row['disposition']}` | "
            f"{', '.join(row['current_component_refs']) or 'none'} | "
            f"{', '.join(m['component_ref'] for m in row['missing_exact_ccmas_aliases']) or 'none'} | "
            f"{', '.join(row['source_faculty']) or 'unknown'}; {len(row['source_institutions'])} institutions |"
        )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--discovery", type=Path, default=DISCOVERY)
    parser.add_argument("--scopes", type=Path, default=SCOPES)
    parser.add_argument("--crosswalk", type=Path, default=CROSSWALK)
    parser.add_argument("--out-prefix", type=Path, default=DEFAULT_PREFIX)
    parser.add_argument("--apply", action="store_true", help="write an audited scope copy")
    parser.add_argument("--in-place", action="store_true", help="replace the scope input (requires --apply)")
    args = parser.parse_args()
    if args.in_place and not args.apply:
        parser.error("--in-place requires --apply")

    discovery = load_json(args.discovery)
    scopes_doc = load_json(args.scopes)
    # Load the crosswalk to make the dependency explicit and fail closed if it
    # is missing.  The current scope carries the selected package rows used by
    # the classifier; the crosswalk is retained in the checkpoint metadata.
    crosswalk = load_json(args.crosswalk)
    if not crosswalk.get("course_rows"):
        raise SystemExit("CCMAS crosswalk has no course rows; refusing to classify")
    scopes = {row.get("jamb_name"): row for row in scopes_doc.get("rows", [])}
    candidates = []
    for row in discovery.get("jamb_identities", []):
        if any(f.get("finding") == "compound_display_name_candidate" for f in row.get("findings", [])):
            candidates.append(row)
    if len(candidates) != 191:
        raise SystemExit(f"Expected 191 compound candidates, found {len(candidates)}; refusing to repair")

    classified = []
    for candidate in candidates:
        name = candidate.get("jamb_name")
        scope = scopes.get(name)
        if scope is None:
            classified.append({
                "canonical_order": candidate.get("canonical_order"),
                "jamb_name": name,
                "disposition": "unresolved_missing_scope",
                "repair_eligible": False,
                "reason": "Discovery candidate has no current JAMB scope row; no mapping inferred.",
                "current_component_refs": [],
                "missing_exact_ccmas_aliases": [],
                "source_faculty": [],
                "source_institutions": [],
                "source_occurrence_ids": [],
                "source_pdf_evidence": [],
                "title_facets": split_title_facets(name),
                "matched_ccmas_aliases": phrase_matches(name),
                "current_package_evidence": {},
                "scope_status_before": None,
                "unsupported_facets_before": [],
                "unrepresented_facets_before": [],
            })
        else:
            classified.append(classify(candidate, scope))

    counts = dict(sorted(Counter(r["disposition"] for r in classified).items()))
    missing_count = sum(bool(r.get("missing_exact_ccmas_aliases")) for r in classified)
    result = {
        "schema": "2026-09-30.jamb-compound-display-name-classification.v1",
        "generated_on": TODAY,
        "mode": "apply" if args.apply else "dry_run",
        "scope": "JAMB scope/source artifacts only; no downstream/UI/SQL/role changes",
        "inputs": {
            "discovery": str(args.discovery),
            "scopes": str(args.scopes),
            "ccmas_crosswalk": str(args.crosswalk),
            "original_jamb_pdf_directory": str(DOWNLOADS),
            "original_jamb_extracted_text_directory": str(JAMB_TXT),
        },
        "counts": {
            "compound_candidates": len(classified),
            "dispositions": counts,
            "rows_with_missing_exact_ccmas_alias": missing_count,
            "rows_eligible_for_safe_annotation": len(classified),
            "component_refs_added": 0,
        },
        "rules": [
            "The compound-title finding is a candidate, not proof of a combined curriculum.",
            "A confirmed combined curriculum requires at least two declared component_refs and selected course evidence for each component.",
            "An exact package alias absent from component_refs is unresolved; the script does not add it from title text alone.",
            "Unsupported or unrepresented facets remain explicit and are not marked unavailable by this pass.",
            "Source faculty, institution associations, occurrence IDs and original JAMB PDF/text evidence are retained per row.",
        ],
        "rows": classified,
    }

    if args.apply:
        patched = deepcopy(scopes_doc)
        by_name = {r["jamb_name"]: r for r in classified}
        changed = []
        for scope in patched.get("rows", []):
            audit = by_name.get(scope.get("jamb_name"))
            if not audit:
                continue
            annotation = {
                "audit_schema": "2026-09-30.jamb-compound-display-name-classification.v1",
                "audited_on": TODAY,
                "disposition": audit["disposition"],
                "reason": audit["reason"],
                "title_facets": audit["title_facets"],
                "matched_ccmas_aliases": audit["matched_ccmas_aliases"],
                "missing_exact_ccmas_aliases": audit["missing_exact_ccmas_aliases"],
                "source_faculty": audit["source_faculty"],
                "source_institutions": audit["source_institutions"],
                "source_occurrence_ids": audit["source_occurrence_ids"],
                "source_pdf_evidence": audit["source_pdf_evidence"],
                "current_component_refs": audit["current_component_refs"],
                "repair_eligible": audit["repair_eligible"],
                "mapping_changed": False,
            }
            if scope.get("compound_title_audit") != annotation:
                scope["compound_title_audit"] = annotation
                changed.append(scope.get("jamb_name"))
        if args.in_place:
            out_scopes = args.scopes
        else:
            out_scopes = args.out_prefix.with_name(args.out_prefix.name + "_scopes.json")
        dump_json(out_scopes, patched)
        result["outputs"] = {"audited_scope_copy": str(out_scopes)}
        result["counts"]["scope_rows_annotated"] = len(changed)
        result["counts"]["component_refs_added"] = 0
    else:
        result["outputs"] = {}

    dump_json(args.out_prefix.with_name(args.out_prefix.name + ("_applied.json" if args.apply else "_dry_run.json")), result)
    md_path = args.out_prefix.with_name(args.out_prefix.name + ("_applied.md" if args.apply else "_dry_run.md"))
    md_path.write_text(render_markdown(result), encoding="utf-8")
    print(json.dumps({"status": result["mode"], "counts": result["counts"], "outputs": result["outputs"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
