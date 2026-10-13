"""Build exact-key D073 library/archive role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D073_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D073_role_domain_fit_review_2026_10_05.md"

ICA_ARCHIVIST = "https://www.ica.org/discover-archives/what-is-an-archivist/"
ICOM_MUSEUM = "https://icom.museum/en/resources/standards-guidelines/museum-definition/"
ICOM_DOCUMENTATION = "https://icom-documentation.mini.icom.museum/standards/museum-documentation-definition/"
IFLA_LIBRARY_SERVICES = "https://www.ifla.org/publications/riss-statement-on-libraries-and-development/"
IFLA_ABOUT = "https://www.ifla.org/about-us/"
CCI_COLLECTION_CARE = "https://www.canada.ca/en/conservation-institute/services/agents-deterioration/dissociation.html"
CCI_OBJECT_CARE = "https://www.canada.ca/en/conservation-institute/services/learning-activities/care-objects.html"

DECISIONS = {
    "archivist": ("supported", "The task collects, organises, preserves and provides access to records in analogue and digital formats; the International Council on Archives describes archivists as managing and enabling long-term access to records and archives.", None),
    "art handler": ("supported", "The task directly handles and cares for museum/gallery objects in coordination with registrars, collection managers, conservators and curators, matching the domain's collections-care scope.", None),
    "big data archive librarian": ("supported", "The task classifies, catalogues, maintains digital media libraries and applies metadata standards, directly matching digital collection organisation and access.", None),
    "collection manager": ("supported", "The task is explicitly the care and preservation of museum, library and archive objects and collections.", None),
    "conservator": ("supported", "The task preserves/restores artworks, buildings, books and furniture and plans conservation; this directly matches preservation of cultural collections and heritage.", None),
    "cultural archive manager": ("supported", "The task manages and develops cultural-institution archives and collections, including digitisation, directly matching archive stewardship and access.", None),
    "cultural visitor services manager": ("supported", "The task plans visitor-facing programmes and interpretation concerning a cultural venue's artefacts or programme, directly supporting museum communication, interpretation and public access.", None),
    "exhibition curator": ("supported", "The task organises and interprets exhibitions of artworks and artefacts in museums, galleries, libraries, archives and cultural institutions, directly matching curation and display.", None),
    "exhibition registrar": ("supported", "The task documents and manages artefact movement between storage, display and exhibitions, directly matching collection documentation and custody.", None),
    "information manager": ("conditional", "The task manages systems for storing, retrieving and communicating information, but its stated remit spans public and private work environments and is not necessarily library, archive or cultural-collection work.", "Count as a D073 role only when the actual remit governs library/archive collections, records, metadata, preservation or user access; generic enterprise information systems alone are insufficient."),
    "librarian": ("supported", "The task develops, manages and provides access to discoverable library information resources, a core library function affirmed by IFLA.", None),
    "library assistant": ("supported", "The task helps users find and borrow library materials and maintains shelves, directly supporting library access and collection operations.", None),
    "museum scientist": ("supported", "The task performs curatorial, preparatory and collection-management work with natural, historical and anthropological material in museums and related collections.", None),
    "taxidermist": ("conditional", "The task prepares animal specimens for display, education or study. That can support natural-history collections, but taxidermy is not inherently archive, library or collection-preservation work.", "Count as D073 only when commissioned for the preparation, conservation or interpretation of a documented museum/scientific collection; commercial trophy mounting alone does not establish D073 fit."),
    "zoo registrar": ("conditional", "The task organises current and historic records about animals and their care in zoological collections. The records function is clear, but the supplied task does not establish archival/cultural-collection stewardship as opposed to operational animal records.", "Count as D073 only where the remit includes accessioned collection records, archival preservation, documentation or public research access; routine husbandry records alone are insufficient."),
}


def _source_urls(refs: list[str]) -> list[str]:
    urls: list[str] = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D073"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 15 or len(by_name) != 15 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D073 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    sources = [ICA_ARCHIVIST, ICOM_MUSEUM, ICOM_DOCUMENTATION,
               IFLA_LIBRARY_SERVICES, IFLA_ABOUT, CCI_COLLECTION_CARE, CCI_OBJECT_CARE]
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _source_urls(row["task_source_refs"])
        refs.extend(sources)
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ICA, ICOM, IFLA and the Canadian Conservation Institute are professional/institutional boundary sources; ESCO/O*NET task profiles identify the mapped tasks. These references do not establish Nigerian demand, universal regulation or individual qualifications. This is parent-domain fit only, not subgroup/specialization fit or student career eligibility.",
            "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "retain_only_with_task_scope_condition",
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D073", "domain_name": "Library and Archive Work",
        "scope": "D073 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compared all exact D073 task profiles with organising, preserving and sharing information, records and cultural collections, including library access, archive stewardship, museum collection care, curation, conservation and digitisation. Generic information-management work and adjacent animal specimen/record work remain conditional unless their actual assignment establishes this domain's collection/archive duties. ISCO/subgroup membership and title similarity are not fit evidence.",
        "scope_sources": sources,
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = payload["counts"]
    lines = ["# D073 — Library and Archive Work: role-to-parent-domain fit", "",
             f"**Slice:** {counts['reviewed_role_mappings']}/15 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|",
             *[f"| {s.title()} | {counts[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" +
                 (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |"
                 for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [International Council on Archives]({ICA_ARCHIVIST}) describes archivists' work in managing and providing long-term access to records. [ICOM's museum definition]({ICOM_MUSEUM}) identifies research, collecting, conservation, interpretation and exhibition; [ICOM Documentation]({ICOM_DOCUMENTATION}) covers collection documentation, management, accessibility and conservation. [IFLA library services]({IFLA_LIBRARY_SERVICES}) describes library access, reference, circulation and user support. The [Canadian Conservation Institute's collection documentation guidance]({CCI_COLLECTION_CARE}) identifies registrar/collection-manager duties in documenting and tracking collections, and its [object-care guidance]({CCI_OBJECT_CARE}) addresses handling, condition reporting and preservation.",
                  "", "The conditions on information manager, taxidermist and zoo registrar preserve the boundary between general information/animal operations and the domain's library, archival or cultural-collection remit.",
                  "", f"- Exact queue coverage: {counts['reviewed_role_mappings']}/15; {counts['supported']} supported, {counts['conditional']} conditional, {counts['unsupported']} unsupported, {counts['unresolved']} unresolved.",
                  "- No canonical taxonomy or specialization files were edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(counts, sort_keys=True))


if __name__ == "__main__":
    main()
