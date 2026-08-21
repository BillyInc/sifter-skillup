"""Apply source-reviewed JAMB brochure requirement repairs.

The source-rule file records when a blank brochure cell inherits a requirement
from the previous populated programme block.  This helper applies only safe
canonical repairs: one unique source text, replacing blank fields or obvious
waiver-contaminated national fields.
"""

from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
DEFAULT_RULES = HERE / "_audit" / "jamb_brochure_source_rules_2026-08-19.json"
FIELD_BY_LAYER = {
    "direct_entry": "direct_entry",
    "olevel": "olevel_requirement",
    "utme": "utme_subjects",
}
LAYER_BY_FIELD = {value: key for key, value in FIELD_BY_LAYER.items()}
SAFE_STATUSES = {"exact", "inherited_shared"}


def as_text(value: Any) -> str:
    if isinstance(value, list):
        return "; ".join(str(item) for item in value if item)
    return str(value or "")


def apply_brochure_subject_overrides(
    programmes: dict[str, dict[str, Any]],
    overrides: dict[str, dict[str, Any]],
) -> dict[str, int]:
    """Apply source-reviewed brochure corrections consistently to every path.

    The raw PDF extraction is intentionally left untouched.  This overlay is
    used by seed generation, classification, and option parsing so a
    university-specific special-consideration row cannot leak into a national
    requirement in one generated artifact while being absent from another.
    """
    stats = {"applied": 0, "missing_programme": 0, "waivers_added": 0}
    scalar_fields = {"utme_subjects", "olevel_requirement", "direct_entry"}
    for name, override in (overrides or {}).items():
        programme = programmes.get(name)
        if programme is None:
            stats["missing_programme"] += 1
            continue
        changed = False
        for field in scalar_fields:
            if field in override and override[field] is not None:
                programme[field] = override[field]
                changed = True
        for field in override.get("clear_fields", []):
            if field in scalar_fields:
                programme[field] = None
                changed = True

        institutions = list(programme.get("institutions") or [])
        for institution in override.get("add_institutions", []):
            if institution not in institutions:
                institutions.append(institution)
                changed = True
        if institutions:
            programme["institutions"] = institutions

        waivers = list(programme.get("institution_waivers") or [])
        for waiver in override.get("add_institution_waivers", []):
            duplicate = any(
                existing.get("institution") == waiver.get("institution")
                and existing.get("note") == waiver.get("note")
                for existing in waivers
            )
            if not duplicate:
                waivers.append(waiver)
                stats["waivers_added"] += 1
                changed = True
        if waivers:
            programme["institution_waivers"] = waivers
        if changed:
            stats["applied"] += 1
    return stats


def normalize(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def programme_name_in_course(name: str, course_cell: Any) -> bool:
    raw = str(course_cell or "")
    identities = [str(name or "").strip()]
    law_suffix = re.sub(
        r"\s*\(printed\s+under\s+Law\s+faculty\s+block\)\s*$",
        "",
        identities[0],
        flags=re.I,
    ).strip()
    if law_suffix and law_suffix != identities[0]:
        identities.append(law_suffix)
    for identity in identities:
        parts = re.findall(r"[A-Za-z0-9]+", identity)
        phrase = r"[\s\-_/&,\.]*".join(re.escape(part) for part in parts)
        if not phrase:
            continue
        match = re.search(rf"(?<![A-Z0-9]){phrase}(?![A-Z0-9])", raw, re.I)
        if not match:
            continue
        # Do not let a shorter catalogue name claim a longer compound
        # programme row. Institution codes after the full title remain valid.
        if re.match(r"\s*(?:and|&)\b", raw[match.end():], re.I):
            continue
        return True
    return False


def readable_source_text(value: Any) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    text = re.sub(r",(?=\S)", ", ", text)
    text = re.sub(r"\((\d+)\)(?=[A-Za-z])", r"(\1) ", text)
    text = re.sub(r"(?i)\bSSCcredit\b", "SSC credit", text)
    text = re.sub(r"(?i)\bSSCEcredit\b", "SSCE credit", text)
    text = re.sub(r"(?i)\bpassesin\b", "passes in", text)
    text = re.sub(r"(?i)\bpasseschosenfrom\b", "passes chosen from", text)
    text = re.sub(r"(?i)\bandany\b", "and any", text)
    text = re.sub(r"(?i)\bof([A-Z][a-z])", r"of \1", text)
    text = re.sub(r"(?i)\bfrom([A-Z][a-z])", r"from \1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def contaminated_national_text(layer: str, value: Any) -> bool:
    text = as_text(value)
    if not text:
        return False
    if re.search(r"UTMESUBJECTS|DIRECTENTRY|\bSPECIAL\b", text, re.I):
        return True
    if layer == "utme" and re.search(
        r"^\s*\(?[ivxlcdm]+\)?\s+[A-Z0-9'&./ -]{2,}\s+(?:accepts?|requires?|does\s+not)",
        text,
        re.I,
    ):
        return True
    return False


def should_replace(layer: str, value: Any) -> bool:
    text = as_text(value).strip()
    return not text or contaminated_national_text(layer, text)


def apply_enrich_requirement_overlays(
    programmes: dict[str, dict[str, Any]],
    overlays: list[dict[str, Any]],
) -> dict[str, int]:
    """Apply only unambiguous enrichment values to effective requirements.

    Enrichment files are source-derived variants. A clean requirement from
    the primary offering catalogue must not be overwritten merely because a
    later filename sorts after it. Conflicting values remain for source-rule
    review and are preserved separately in the source-variant inventory.
    """
    grouped: dict[str, dict[str, list[Any]]] = {}
    skipped_missing = 0
    for overlay in overlays:
        name = overlay.get("jamb_name")
        if not name or name not in programmes:
            skipped_missing += 1
            continue
        fields = grouped.setdefault(name, {})
        for field in FIELD_BY_LAYER.values():
            value = overlay.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                continue
            fields.setdefault(field, []).append(value)

    applied = 0
    conflicts = 0
    for name, fields in grouped.items():
        programme = programmes[name]
        for field, values in fields.items():
            layer = LAYER_BY_FIELD[field]
            current = programme.get(field)
            if current and not contaminated_national_text(layer, current):
                continue
            normalized_values = {
                re.sub(r"\s+", " ", as_text(value)).strip().lower(): value
                for value in values
            }
            if len(normalized_values) != 1:
                conflicts += 1
                if current and contaminated_national_text(layer, current):
                    programme[field] = None
                continue
            programme[field] = as_text(next(iter(normalized_values.values())))
            applied += 1
    return {"applied": applied, "conflicts": conflicts, "skipped_missing": skipped_missing}


def match_programme_from_course_cell(course_cell: Any, programmes: dict[str, dict[str, Any]]) -> str | None:
    if not normalize(course_cell):
        return None
    candidates = []
    for name in programmes:
        normal_name = normalize(name)
        if normal_name and programme_name_in_course(name, course_cell):
            candidates.append((len(normal_name), name))
    if not candidates:
        return None
    return sorted(candidates, reverse=True)[0][1]


def replacement_text_for_variant(
    variant: dict[str, Any],
    field: str,
    programmes_snapshot: dict[str, dict[str, Any]],
) -> str:
    rule = variant["source_variant"]
    source = rule.get("inherited_from") or rule.get("source") or {}
    source_name = match_programme_from_course_cell(source.get("course_cell"), programmes_snapshot)
    if source_name:
        source_value = as_text(programmes_snapshot.get(source_name, {}).get(field)).strip()
        if source_value and not contaminated_national_text(variant["layer"], source_value):
            return source_value
    return readable_source_text(rule.get("text"))


def apply_source_rules_to_programmes(
    programmes: dict[str, dict[str, Any]],
    rules_path: str | Path | None = None,
) -> dict[str, int]:
    path = Path(rules_path) if rules_path else DEFAULT_RULES
    stats = {
        "rules_missing": 0,
        "rows_seen": 0,
        "applied": 0,
        "skipped_existing": 0,
        "skipped_missing_programme": 0,
        "skipped_unresolved": 0,
        "skipped_multiple_source_texts": 0,
    }
    if not path.exists():
        stats["rules_missing"] = 1
        return stats

    report = json.loads(path.read_text(encoding="utf-8"))
    snapshot = deepcopy(programmes)
    for row in report.get("rows") or []:
        stats["rows_seen"] += 1
        jname = row.get("jamb_name")
        layer = row.get("layer")
        field = FIELD_BY_LAYER.get(str(layer))
        if not field or jname not in programmes:
            stats["skipped_missing_programme"] += 1
            continue
        if not should_replace(str(layer), programmes[jname].get(field)):
            stats["skipped_existing"] += 1
            continue

        replacements = []
        for variant in row.get("source_variants") or []:
            rule = variant.get("source_variant") or {}
            if rule.get("status") not in SAFE_STATUSES or not rule.get("text"):
                continue
            replacement = replacement_text_for_variant(variant, field, snapshot)
            if replacement:
                replacements.append(replacement)
        unique = {re.sub(r"\s+", " ", text).strip().lower(): text for text in replacements}
        if not unique:
            stats["skipped_unresolved"] += 1
            if contaminated_national_text(str(layer), programmes[jname].get(field)):
                programmes[jname][field] = None
                programmes[jname].setdefault("_source_rule_repairs", {})[field] = {
                    "layer": layer,
                    "resolution": "cleared_contaminated_text_no_source_variant",
                    "source_variant_count": row.get("source_variant_count", 0),
                }
            continue
        if len(unique) > 1:
            stats["skipped_multiple_source_texts"] += 1
            if contaminated_national_text(str(layer), programmes[jname].get(field)):
                programmes[jname][field] = None
                programmes[jname].setdefault("_source_rule_repairs", {})[field] = {
                    "layer": layer,
                    "resolution": "cleared_contaminated_text_multiple_source_variants",
                    "source_variant_count": row.get("source_variant_count", 0),
                }
            continue

        programmes[jname][field] = next(iter(unique.values()))
        programmes[jname].setdefault("_source_rule_repairs", {})[field] = {
            "layer": layer,
            "resolution": row.get("resolution"),
            "source_variant_count": row.get("source_variant_count", 0),
        }
        stats["applied"] += 1
    return stats
