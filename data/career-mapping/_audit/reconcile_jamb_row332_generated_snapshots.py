"""Fail-close the stale generated snapshots for JAMB row 332 only.

The canonical source mapping is D_custom with no CCMAS component. This
mechanical reconciliation deliberately does not rebuild any catalogue-wide
artifact, seed, or SQL file.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
NAME = "Environmental Science and Technology"
NOTE = (
    "The source mapping is D_custom with no CCMAS component. The exact Wesley "
    "University award identity and programme-specific curriculum remain "
    "unverified. A broad NUC historical accreditation search hit for "
    "Environmental Science was not tied to Wesley in the retrieved row context "
    "and is not proof of a Wesley award. NOUN's Environmental Science and "
    "Resource Management curriculum is a separate institution's evidence lead, "
    "not a Wesley curriculum. Do not substitute Environmental Health Science, "
    "Environmental Management, Environmental Standards, or NOUN's curriculum "
    "based on name similarity. Keep student paths closed until the exact "
    "Wesley award and authoritative programme-specific curriculum are verified."
)
MAPPING_NOTE = (
    "JAMB lists Environmental Science and Technology under Sciences for WESLEYUNI. "
    "Keep D_custom with no CCMAS component and no student domain paths pending exact "
    "award/curriculum verification. NUC's Environmental Sciences CCMAS lists the "
    "distinct programmes Environmental Management and Environmental Standards; "
    "neither is an evidenced equivalent. NOUN's B.Sc. Environmental Science and "
    "Resource Management is a separate institution's curriculum and cannot be "
    "assigned to Wesley. A broad NUC historical accreditation search hit for "
    "Environmental Science was not tied to Wesley in the retrieved row context; "
    "do not use it as evidence of a Wesley award. Do not substitute Environmental "
    "Health Science or nearby programmes by name similarity."
)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, payload, *, indent: int = 2) -> None:
    # Preserve the existing serializer style of the large source artifacts so
    # this row-only change does not reformat the rest of the catalogue.
    if path.name in {"programme_mapping.json", "jamb_curriculum_scopes_2026-08-17.json"}:
        indent = 1
    path.write_bytes((json.dumps(payload, ensure_ascii=False, indent=indent) + "\n").encode("utf-8"))


def one_row(rows, label):
    matches = [row for row in rows if isinstance(row, dict) and row.get("jamb_name") == NAME]
    if len(matches) != 1:
        raise SystemExit(f"Expected one {label} row for {NAME!r}; found {len(matches)}")
    return matches[0]


scope_path = ROOT / "data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json"
canonical_path = ROOT / "data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json"
derived_path = ROOT / "data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json"
active_path = ROOT / "data/career-mapping/jamb_domain_map.json"
backup_path = AUDIT / "jamb_row332_pre_reconciliation_snapshot_2026-09-25.json"

scope_doc = load(scope_path)
canonical_doc = load(canonical_path)
derived_doc = load(derived_path)
active_doc = load(active_path)
mapping_doc = load(ROOT / "data/career-mapping/programme_mapping.json")

scope = one_row(scope_doc["rows"], "scope")
canonical = one_row(canonical_doc["rows"], "canonical")
source = one_row(mapping_doc["mappings"], "source mapping")
derived = derived_doc.get(NAME)
active = active_doc.get(NAME)
if not isinstance(derived, dict) or not isinstance(active, dict):
    raise SystemExit("Expected row 332 entries in derived and active maps")

# Preserve the exact row-level pre-state once, rather than copying large files.
if not backup_path.exists():
    save(backup_path, {
        "recorded": "2026-09-25",
        "jamb_name": NAME,
        "source_mapping": source,
        "scope_before": scope,
        "canonical_before": canonical,
        "derived_before": derived,
        "active_before": active,
    })

scope.update({
    "mapping_type": "D_custom",
    "inheritance_type": "external_sources_required",
    "component_refs": [],
    "scope_status": "external_scope_review_required",
    "scope_reason": NOTE,
    "scope_approval": "external_required",
    "scope_selection_method": "external_programme_specific_source_required",
    "selected_courses": [],
    "domain_links": [],
})

source["mapping_type"] = "D_custom"
source["ccmas_code"] = None
source["ccmas_discipline"] = None
source["ccmas_name"] = None
source["mapping_note"] = MAPPING_NOTE

canonical.update({
    "mapping_type": "D_custom",
    "inheritance_type": "external_sources_required",
    "primary_component": None,
    "supporting_components": [],
    "component_refs": [],
    "curriculum_scope": {
        "status": "external_source_required",
        "source": "official JAMB Sciences identity; Wesley/NUC and NOUN leads reconciled 2026-09-25",
        "note": NOTE,
        "approval": "external_required",
        "selected_course_count": 0,
        "selected_course_codes": [],
    },
    "component_domain_evidence": [],
    "domain_links": [],
    "candidate_ccmas_domain_links": [],
    "current_jamb_domain_link_count": 0,
    "mapping_status": "review_required",
    "status_reason": NOTE,
})

derived.update({
    "links": [],
    "inheritance_type": "external_sources_required",
    "mapping_status": "review_required",
    "status_reason": NOTE,
    "ccmas_components": [],
    "curriculum_scope": {
        "status": "external_source_required",
        "source": "official JAMB Sciences identity; Wesley/NUC and NOUN leads reconciled 2026-09-25",
        "note": NOTE,
        "approval": "external_required",
        "selected_course_count": 0,
        "selected_course_codes": [],
    },
    "source": "row-specific fail-closed reconciliation 2026-09-25; see append-only checkpoint",
})

# Refuse to overwrite if active student state changed meanwhile.
if source.get("mapping_type") != "D_custom" or source.get("ccmas_name") is not None:
    raise SystemExit("Source mapping no longer matches the reviewed D_custom/no-CCMAS state")
if active.get("mapping_status") != "review_required" or active.get("links") or active.get("ccmas_components"):
    raise SystemExit("Active map is not fail-closed; refusing to alter its student paths")
active["inheritance_type"] = "external_sources_required"
active["status_reason"] = NOTE
active["source"] = "row-specific fail-closed reconciliation 2026-09-25; see append-only checkpoint"

save(ROOT / "data/career-mapping/programme_mapping.json", mapping_doc)
save(scope_path, scope_doc)
save(canonical_path, canonical_doc)
save(derived_path, derived_doc)
save(active_path, active_doc)
print("Reconciled row 332 only across source, scope, canonical, derived, and active maps; student paths remain empty.")
