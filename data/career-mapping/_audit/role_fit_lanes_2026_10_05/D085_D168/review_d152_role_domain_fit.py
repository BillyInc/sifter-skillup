"""Build a source-grounded, exact-key parent-domain review for D152."""

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D152_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D152_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D152 role_key, parent scope and stored task descriptions.",
        "supports": "The specific recorded duties evaluated for each D152 mapping.",
        "limit": "This is the record under audit, not an independent verification of an occupation's complete scope.",
    },
    "ICOM_MUSEUM_DEFINITION": {
        "publisher": "International Council of Museums (ICOM)",
        "url": "https://icom.museum/en/news/icom-approves-a-new-museum-definition/",
        "locator": "ICOM-approved 2022 museum definition: museums research, collect, conserve, interpret and exhibit tangible and intangible heritage; they also support education and knowledge-sharing.",
        "supports": "The parent-domain boundary around museum collections, conservation, interpretation, exhibitions, research and public access.",
        "limit": "A global professional definition, not an occupational licensing rule or proof that every cultural venue is a museum.",
    },
    "UNESCO_MUSEUMS_RECOMMENDATION": {
        "publisher": "UNESCO",
        "url": "https://www.unesco.org/en/legal-affairs/recommendation-concerning-protection-and-promotion-museums-and-collections-their-diversity-and-their",
        "locator": "2015 Recommendation, especially functional policies §§24–26: preservation, research, education, communication, inventories and digitization of collections.",
        "supports": "Internationally agreed museum/collection functions and the distinction between heritage collection work and generic cultural programming.",
        "limit": "An international recommendation implemented through jurisdiction-specific law and policy; it does not define local job titles or authority.",
    },
    "ICA_ARCHIVIST_ROLE": {
        "publisher": "International Council on Archives (ICA)",
        "url": "https://www.ica.org/discover-archives/what-is-an-archivist/",
        "locator": "What is an archivist?: collecting, managing, preserving records and archives, maintaining provenance/original order, and enabling long-term access.",
        "supports": "The direct archival-records portion of the domain and the archivist/cultural-archive-manager mappings.",
        "limit": "Global professional guidance; local archival laws, qualifications and title conventions vary.",
    },
    "ICOM_CONSERVATION_SCOPE": {
        "publisher": "ICOM Committee for Conservation (ICOM-CC)",
        "url": "https://icom.museum/wp-content/uploads/2018/04/1_ICOM-CC.pdf",
        "locator": "Committee remit and working groups: conservation specialists safeguard cultural heritage and collections through conservation practice and research.",
        "supports": "Museum-object/cultural-heritage conservation as distinct from the queue's environmental-resource-management task profile for 'conservation scientist'.",
        "limit": "The committee describes conservation of cultural heritage; it does not establish that an identically named natural-resources occupation performs museum conservation.",
    },
    "ICOM_CODE_COLLECTIONS": {
        "publisher": "International Council of Museums (ICOM)",
        "url": "https://icom.museum/wp-content/uploads/2018/07/ICOM-code-En-web.pdf",
        "locator": "ICOM Code of Ethics for Museums, §§2.21–2.24: collections protection, preventive conservation, condition monitoring, conservation/restoration and documentation.",
        "supports": "Collection-care, registration and conservation duties within museums.",
        "limit": "Professional ethical standards, not a universal legal mandate or a substitute for task evidence.",
    },
    "ICOMOS_ARCHAEOLOGICAL_HERITAGE": {
        "publisher": "International Council on Monuments and Sites (ICOMOS), ICAHM",
        "url": "https://icahm.icomos.org/",
        "locator": "ICOMOS International Scientific Committee on Archaeological Heritage Management: standards and best practices for archaeological research and cultural-resource management; links to the 1990 Charter for Protection and Management of Archaeological Heritage.",
        "supports": "The archaeology portion of the parent scope and a separately recorded potential role-coverage gap.",
        "limit": "International guidance on archaeological heritage management; it does not validate any absent role mapping or one country's permitting rules.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

# Keyed by exact role key, never inferred from title, ISCO subgroup or frequency.
DECISIONS = {
    "D152|archivist": (S, "Collects, organizes, preserves and opens access to records across media, directly matching the archive and information-stewardship scope.", ["QUEUE_TASK_PROFILE", "ICA_ARCHIVIST_ROLE"]),
    "D152|conservation scientist": (U, "The recorded duties concern forests, parks, wildlife habitat, biodiversity and conservation lands—not conservation of museum objects or cultural heritage. The task description supports a candidate transfer to D121 Forestry and Wildlife Management for review; this proposal does not alter the mapping.", ["QUEUE_TASK_PROFILE", "ICOM_CONSERVATION_SCOPE"]),
    "D152|cultural archive manager": (S, "Manages and preserves a cultural institution's archives and collections, including digitization; this is directly within archival stewardship and collection access.", ["QUEUE_TASK_PROFILE", "ICA_ARCHIVIST_ROLE", "UNESCO_MUSEUMS_RECOMMENDATION"]),
    "D152|cultural centre director": (U, "Runs community cultural activities, events, staff and inclusion programmes. The recorded duties do not include heritage collections, archives, conservation, interpretation or archaeological work.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION", "UNESCO_MUSEUMS_RECOMMENDATION"]),
    "D152|cultural facilities manager": (C, "The task explicitly spans museums as well as theatres and concert halls. The museum-facility branch fits; the non-collection performing-arts venue branch does not. Keep only when the mapped assignment is a museum/cultural-heritage facility.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION"]),
    "D152|cultural policy officer": (C, "Develops policy to promote cultural activities and events but the task does not specify cultural-heritage or museum policy. Fit is conditional on a heritage/collections portfolio, not generic cultural programming.", ["QUEUE_TASK_PROFILE", "UNESCO_MUSEUMS_RECOMMENDATION"]),
    "D152|cultural visitor services manager": (S, "Plans visitor-facing interpretation and presentation of a cultural venue's artefacts/programmes, matching the museum function of interpreting and exhibiting heritage for the public.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION"]),
    "D152|energy conservation officer": (U, "Promotes energy efficiency in homes and businesses through efficiency measures and demand-management policy; the recorded work has no museum, archive, heritage or archaeology task. No transfer target is proposed without a supported catalogue match.", ["QUEUE_TASK_PROFILE"]),
    "D152|exhibition curator": (S, "Organizes and displays artworks and artefacts in museums, galleries, libraries, archives and other cultural institutions, directly matching collection interpretation and exhibition.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION"]),
    "D152|exhibition registrar": (S, "Documents and manages artefact movement among storage, display and exhibitions with museums and partner institutions, directly matching collections management and protection.", ["QUEUE_TASK_PROFILE", "ICOM_CODE_COLLECTIONS"]),
    "D152|museum director": (S, "Manages museum collections, artefacts, exhibition facilities, staff and finances; the institutional and collection remit directly fits the parent.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION", "UNESCO_MUSEUMS_RECOMMENDATION"]),
    "D152|museum scientist": (S, "Performs or manages curatorial and preparatory work and manages natural, historical and anthropological collections in museums and related institutions, directly fitting the parent scope.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION"]),
    "D152|zoo curator": (C, "Manages living animal collections, husbandry/welfare policy and exhibits in a zoo. The exhibition/institutional overlap is real, but the recorded core is zoological collection management rather than cultural archives, archaeology or museum-object stewardship; retain only if the particular institution is within the product's museum/natural-heritage scope.", ["QUEUE_TASK_PROFILE", "ICOM_MUSEUM_DEFINITION", "UNESCO_MUSEUMS_RECOMMENDATION"]),
}


def main():
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D152"]
    by_key = {row["role_key"]: row for row in rows}
    if set(by_key) != set(DECISIONS):
        raise SystemExit(f"D152 exact-key mismatch: queue={sorted(by_key)} decisions={sorted(DECISIONS)}")

    decisions = []
    for key, (fit, rationale, refs) in DECISIONS.items():
        row = by_key[key]
        decisions.append({
            "role_key": key,
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "1.0",
        "audit_date": date.today().isoformat(),
        "domain_id": "D152",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Exact-key assessment of each recorded task profile against the parent-domain scope. The role task record is compared independently; titles, ISCO groups, role frequency and subgroup membership are not fit evidence. Primary international museum/archive/heritage sources clarify boundaries and source limitations are recorded. No role-to-specialization assignment is made.",
        "counts": {
            "mappings_reviewed": len(decisions), "supported": tally[S],
            "conditional": tally[C], "unsupported_for_domain": tally[U],
            "unresolved": tally["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "correction_proposals": [
            {
                "role_key": "D152|conservation scientist",
                "action": "remove_from_parent_domain_or_reassign_after_owner_review",
                "candidate_transfer_domain": "D121",
                "candidate_transfer_domain_name": "Forestry and Wildlife Management",
                "evidence_basis": "The exact task profile is explicitly about forests, parks, natural resources, wildlife habitat and biodiversity; D121's checked-in scope covers forestry and wildlife management.",
                "canonical_change_made": False,
            },
            {
                "role_key": "D152|energy conservation officer",
                "action": "remove_from_parent_domain",
                "candidate_transfer_domain": None,
                "evidence_basis": "The exact task profile is residential/business energy-efficiency advice and demand management; no alternate catalogue parent is asserted by this review.",
                "canonical_change_made": False,
            },
            {
                "role_key": "D152|cultural centre director",
                "action": "remove_from_parent_domain",
                "candidate_transfer_domain": None,
                "evidence_basis": "The exact task profile is community cultural programming and event operations, with no museum, collection, archive, heritage or archaeology duties.",
                "canonical_change_made": False,
            },
        ],
        "separate_coverage_candidates": [
            {
                "domain_id": "D152",
                "candidate_gap": "No queued role explicitly performs archaeology or archaeological-heritage management, despite archaeology being named in the parent domain.",
                "evidence": "ICOMOS ICAHM describes archaeological research and cultural-resource management as distinct practice areas; the D152 exact-key queue contains no role task with those duties.",
                "next_validation": "Check the complete active role inventory and internationally recognized occupational sources before proposing any role title; this is a coverage signal, not an added role or a fit disposition.",
            }
        ],
        "notes": [
            "All 13 D152 exact queued role keys were reviewed against their recorded duties; title and subgroup alone were not used to infer fit.",
            "Conditional means the task record spans in-scope and out-of-scope contexts or does not establish a necessary heritage assignment; it is not an unconditional student requirement.",
            "International professional guidance is used for global functional boundaries. It does not set local law, licensure, institutional remit or job-title requirements.",
            "The archaeology coverage signal is kept separate from existing-link fit. It does not justify inventing or adding an occupation.",
            "No canonical taxonomy/mapping file or role-to-specialization assignment was changed.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"# D152 role-to-parent-domain fit review — {payload['audit_date']}", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**",
        f"- Unsupported for this parent: **{tally[U]}**",
        f"- Unresolved: **{tally['unresolved']}**", "",
        "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Non-canonical correction proposals", ""])
    for proposal in payload["correction_proposals"]:
        dest = proposal["candidate_transfer_domain"] or "none established"
        lines.append(f"- `{proposal['role_key']}` — {proposal['action']}; candidate destination: **{dest}**. {proposal['evidence_basis']} No canonical change was made.")
    lines.extend(["", "## Separate role-coverage candidate", "", "- Archaeological-heritage practice is in the domain scope but is not represented by an exact queued role task. Validate against the full active inventory and authoritative occupational sources before proposing titles; no role is added here.", "", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
