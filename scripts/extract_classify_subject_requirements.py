"""Extract and classify every brochure requirement and university exception.

This is an evidence inventory, not a matcher.  It gives each national
programme layer and each institution note a row-level status, source location,
and reason whenever it is not safe to turn the text into a structured rule.
"""

from __future__ import annotations

import argparse
import json
import re
import uuid
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "career-mapping"
OUT = ROOT / "docs" / "manual-review"
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")
OFFERING_FILES = [
    "law_offerings.json",
    "social_management_offerings.json",
    "administration_offerings.json",
    "sciences_offerings.json",
    "medical_offerings.json",
    "agriculture_offerings.json",
    "arts_hum_offerings.json",
    "engineering_offerings.json",
    "education_offerings.json",
]


def uid(*parts: str) -> str:
    return str(uuid.uuid5(NS, "|".join(parts)))


def as_text(value: Any) -> str:
    if isinstance(value, list):
        return "; ".join(str(item) for item in value if item)
    return str(value or "")


def norm_code(value: Any) -> str | None:
    text = str(value or "").strip().upper().rstrip(".")
    if not text or text in {"LAW", "AND", "STUDIES", "SOCIAL SCIENCES", "UTME", "DIRECT ENTRY", "SUBJECTS"}:
        return None
    if not re.fullmatch(r"[A-Z0-9][A-Z0-9'&./ -]{1,24}", text):
        return None
    return text


def load_effective_programmes() -> dict[str, dict[str, Any]]:
    programmes: dict[str, dict[str, Any]] = {}
    for filename in OFFERING_FILES:
        path = DATA / "jamb" / filename
        data = json.loads(path.read_text(encoding="utf-8"))
        for programme in data.get("programmes") or []:
            name = programme.get("jamb_name")
            if name:
                if name not in programmes:
                    programmes[name] = {**programme, "source_json": filename}
                    continue
                # The same JAMB name can appear in several faculty PDFs. Keep
                # the first canonical scalar row, but union the offering and
                # waiver evidence so the effective classifier matches the
                # seed generator's multi-source behaviour.
                current = programmes[name]
                institutions = list(current.get("institutions") or [])
                for institution in programme.get("institutions") or []:
                    if institution not in institutions:
                        institutions.append(institution)
                if institutions:
                    current["institutions"] = institutions
                waivers = list(current.get("institution_waivers") or [])
                for waiver in programme.get("institution_waivers") or []:
                    if not any(
                        existing.get("institution") == waiver.get("institution")
                        and existing.get("institutions") == waiver.get("institutions")
                        and existing.get("note") == waiver.get("note")
                        for existing in waivers
                    ):
                        waivers.append(waiver)
                if waivers:
                    current["institution_waivers"] = waivers
    enrich_overlays = []
    for path in sorted((DATA / "jamb" / "enrich").glob("*.json")):
        if path.name.startswith("_"):
            continue
        overlay = json.loads(path.read_text(encoding="utf-8"))
        enrich_overlays.append(overlay)
    import sys

    sys.path.insert(0, str(DATA))
    from _jamb_source_rules import apply_enrich_requirement_overlays  # type: ignore

    apply_enrich_requirement_overlays(programmes, enrich_overlays)
    override_path = DATA / "jamb" / "brochure_subject_overrides.json"
    if override_path.exists():
        overrides = json.loads(override_path.read_text(encoding="utf-8"))
        from _jamb_source_rules import apply_brochure_subject_overrides  # type: ignore
        apply_brochure_subject_overrides(programmes, overrides)
    from _jamb_source_rules import apply_source_rules_to_programmes  # type: ignore

    apply_source_rules_to_programmes(programmes)
    return programmes


def classify_national(layer: str, text: str, parse_utme, parse_olevel) -> dict[str, Any]:
    text = text.strip()
    if not text:
        return {"status": "empty", "reason": "no_source_text"}
    if layer == "direct_entry":
        return {"status": "direct_entry_route", "reason": "not_subject_picker_rule"}
    if re.search(r"\b(?:direct\s+entry|a\s*['’]?\s*level|ijmb|jupeb|nce|nd\s*/?\s*hnd|ond|hnd)\b", text, re.I):
        return {"status": "needs_review", "reason": "direct_entry_prose_in_subject_cell"}
    if layer == "utme":
        parsed = parse_utme(text)
        if isinstance(parsed, tuple) and parsed and parsed[0] == "ref":
            return {"status": "needs_review", "reason": "cross_reference", "reference": parsed[1]}
        if parsed:
            return {"status": "parsed", "reason": "structured_utme_rule"}
        if re.search(r"O.?\s*LEVEL|O/L|SSCE|credit\s+pass", text, re.I):
            return {"status": "needs_review", "reason": "utme_cell_contains_olevel_text"}
        if re.search(r"same\s+as|as\s+in|see\s+", text, re.I):
            return {"status": "needs_review", "reason": "cross_reference_or_shared_rule"}
        if re.search(r"requires?|accepts?|institution|university", text, re.I):
            return {"status": "needs_review", "reason": "institutional_or_unrecognized_prose"}
        return {"status": "needs_review", "reason": "unrecognized_utme_grammar"}
    parsed = parse_olevel(text)
    if parsed:
        return {"status": "parsed", "reason": "structured_olevel_rule", "minimumCredits": parsed[0]}
    if re.search(r"same\s+as|as\s+in|see\s+", text, re.I):
        return {"status": "needs_review", "reason": "cross_reference_or_shared_rule"}
    if not re.search(r"(?:credit|pass|ssce?|o.?\s*level)", text, re.I):
        return {"status": "needs_review", "reason": "missing_o_level_credit_statement"}
    if re.search(r"sittings?", text, re.I):
        return {"status": "needs_review", "reason": "sitting_condition"}
    return {"status": "needs_review", "reason": "unrecognized_olevel_grammar"}


def classify_all() -> dict[str, Any]:
    import sys

    sys.path.insert(0, str(DATA))
    from _parse_local_subject_exceptions import parse_local_exception  # type: ignore
    from _parse_subject_options import parse_olevel, parse_utme  # type: ignore

    programmes = load_effective_programmes()
    seed_text = (ROOT / "backend" / "seed_career_pilot.sql").read_text(encoding="utf-8")
    national_rows: list[dict[str, Any]] = []
    for name, programme in sorted(programmes.items()):
        for layer, field in (("utme", "utme_subjects"), ("olevel", "olevel_requirement"), ("direct_entry", "direct_entry")):
            text = as_text(programme.get(field)).strip()
            classification = classify_national(layer, text, parse_utme, parse_olevel)
            national_rows.append({
                "rowId": uid("national_requirement", name, layer),
                "jambName": name,
                "layer": layer,
                "sourceJson": programme.get("source_json"),
                "text": text,
                **classification,
            })

    exception_rows: list[dict[str, Any]] = []
    seen_exception_ids: set[str] = set()
    override_path = DATA / "jamb" / "brochure_subject_overrides.json"
    overrides = json.loads(override_path.read_text(encoding="utf-8")) if override_path.exists() else {}
    from _jamb_source_rules import apply_brochure_subject_overrides  # type: ignore

    # Match _gen_seed.py's authoritative source order: inspect each raw
    # offering file, apply the source-reviewed correction to that raw row, and
    # then deduplicate by the same deterministic exception id. This preserves
    # the first brochure source as provenance and avoids re-numbering waivers
    # after effective multi-file merging.
    for filename in OFFERING_FILES:
        path = DATA / "jamb" / filename
        data = json.loads(path.read_text(encoding="utf-8"))
        for raw_programme in data.get("programmes") or []:
            name = raw_programme.get("jamb_name") or ""
            corrected = {**raw_programme}
            apply_brochure_subject_overrides({name: corrected}, overrides)
            waiver_by_code: dict[str, list[str]] = {}
            for waiver in corrected.get("institution_waivers") or []:
                codes = waiver.get("institutions") or ([waiver["institution"]] if waiver.get("institution") else [])
                for institution in codes:
                    code = norm_code(institution)
                    note = (waiver.get("note") or "").strip()
                    if not code or not note:
                        continue
                    waiver_by_code.setdefault(code, []).append(note)
            for code, notes in waiver_by_code.items():
                for waiver_index, note in enumerate(notes):
                    classification = parse_local_exception(note)
                    exception_id = uid("spe", code, name, str(waiver_index), note)
                    if exception_id in seen_exception_ids:
                        continue
                    seen_exception_ids.add(exception_id)
                    exception_rows.append({
                        "rowId": uid("source_exception", filename, name, code, str(waiver_index), note),
                        "exceptionId": exception_id,
                        "jambName": name,
                        "institution": code,
                        "sourceJson": filename,
                        "sourceLabel": f"{filename}:{name}:{code}:{waiver_index}",
                        "text": note,
                        "rawRoute": "direct_entry" if re.search(r"DIRECT\s+ENTRY|A.?LEVEL|IJMB|JUPEB|NCE|ND|HND|OND", note, re.I) else "subject_or_general",
                        "seededOffering": f"'{exception_id}'" in seed_text,
                        **classification,
                    })

    return {
        "schemaVersion": 1,
        "generatedFrom": [f"data/career-mapping/jamb/{name}" for name in OFFERING_FILES],
        "counts": {
            "effectiveJambProgrammes": len(programmes),
            "nationalRequirementRows": len(national_rows),
            "universityExceptionRows": len(exception_rows),
            "nationalByStatus": dict(Counter(row["status"] for row in national_rows)),
            "nationalByReason": dict(Counter(row.get("reason") or "parsed_rule" for row in national_rows)),
            "exceptionsByStatus": dict(Counter(row["status"] for row in exception_rows)),
            "exceptionsByReason": dict(Counter(row.get("reason") or "parsed_rule" for row in exception_rows)),
            "exceptionsByExamType": dict(Counter(row.get("exam_type", "unclassified") for row in exception_rows)),
            "exceptionsByScope": dict(Counter(row.get("rule_scope", "unclassified") for row in exception_rows)),
            "sourceExceptionsSeeded": sum(1 for row in exception_rows if row["seededOffering"]),
            "sourceExceptionsNotSeededToOffering": sum(1 for row in exception_rows if not row["seededOffering"]),
        },
        "nationalRequirements": national_rows,
        "universityExceptions": exception_rows,
    }


def write_report(report: dict[str, Any], json_path: Path, md_path: Path) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = report["counts"]
    lines = [
        "# Complete brochure requirement and university-exception classification",
        "",
        "This inventory contains one row for every effective JAMB programme layer and every institution exception extracted from the brochure JSON. A parsed label means the current grammar can represent the text; it does not replace source verification.",
        "",
        "## Coverage",
        "",
        f"- Effective JAMB programmes: **{counts['effectiveJambProgrammes']}**",
        f"- National requirement rows: **{counts['nationalRequirementRows']}** (UTME, O-level and direct entry for each programme)",
        f"- University exception rows: **{counts['universityExceptionRows']}**",
        f"- Source exceptions linked to a seeded university offering: **{counts['sourceExceptionsSeeded']}**; source-only/unlinked rows retained in this inventory: **{counts['sourceExceptionsNotSeededToOffering']}**",
        "",
        "## National requirement classifications",
        "",
    ]
    for key, value in sorted(counts["nationalByStatus"].items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += ["", "## University exception classifications", ""]
    for key, value in sorted(counts["exceptionsByStatus"].items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += ["", "### Exception reasons", ""]
    for key, value in sorted(counts["exceptionsByReason"].items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += ["", "## Row inventory", "", "### National requirements", ""]
    for row in report["nationalRequirements"]:
        text = row["text"].replace("\n", " ")[:220]
        lines.append(f"- `{row['jambName']}` / `{row['layer']}` — `{row['status']}` / `{row['reason']}` — {text}")
    lines += ["", "### University exceptions", ""]
    for row in report["universityExceptions"]:
        text = row["text"].replace("\n", " ")[:220]
        lines.append(f"- `{row['institution']}` / `{row['jambName']}` — `{row['status']}` / `{row['reason']}` — {text}")
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=OUT / "complete-subject-requirement-classification-2026-08-18.json")
    parser.add_argument("--md", type=Path, default=OUT / "complete-subject-requirement-classification-2026-08-18.md")
    args = parser.parse_args()
    report = classify_all()
    write_report(report, args.json, args.md)
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()
