"""Build the noncanonical Nigerian-context disposition for D078 residuals.

This is an evidence gate, not a role-fit or student-approval pass.  A sourced
entry establishes only a bounded Nigerian curriculum/practice example.  An
exhausted entry explicitly records that no defensible Nigerian-specific claim
was found after the listed official-source search; it does not turn the item
into a requirement.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "data/career-mapping/_audit/d078_nigerian_context_disposition_2026_10_09.json"

SOURCES = {
    "nuc_social_sciences_ccmas": {
        "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        "publisher": "National Universities Commission",
        "title": "Social Sciences Core Curriculum and Minimum Academic Standards 2023",
        "locator": "Named programme/course entries and course contents in the official PDF; exact course locator retained in the local CCMAS extraction.",
        "scope": "Nigerian undergraduate curriculum context only; not a universal role requirement or professional licence.",
    },
    "nuc_communication_media_ccmas": {
        "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
        "publisher": "National Universities Commission",
        "title": "Communication and Media Studies Core Curriculum and Minimum Academic Standards 2023",
        "locator": "Research-methods, communication-ethics and digital-communication course contents in the official PDF.",
        "scope": "Nigerian programme curriculum context; not proof that a D078 learner needs journalism training.",
    },
    "nuc_law_ccmas": {
        "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
        "publisher": "National Universities Commission",
        "title": "Law Core Curriculum and Minimum Academic Standards 2023",
        "locator": "Family law, Nigerian legal system and commercial-law course contents in the official PDF.",
        "scope": "Nigerian legal-education context; not a licence or a D078 role requirement.",
    },
    "nuc_education_ccmas": {
        "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
        "publisher": "National Universities Commission",
        "title": "Education Core Curriculum and Minimum Academic Standards 2023",
        "locator": "Teacher education, pedagogy and teaching-practice course contents in the official PDF.",
        "scope": "Nigerian education-programme context; not proof of a teaching licence or role eligibility.",
    },
    "nbs_nlfs_methodology": {
        "url": "https://microdata.nigerianstat.gov.ng/index.php/catalog/152/related-materials",
        "publisher": "National Bureau of Statistics",
        "title": "Nigeria Labour Force Survey Methodology",
        "locator": "Official catalogue entry: sample design, pretest, pilot, fieldwork, quality checks, data processing, analysis and reporting sections.",
        "scope": "A Nigerian official-statistics workflow; not a universal method requirement.",
    },
    "nbs_time_use_methodology": {
        "url": "https://microdata.nigerianstat.gov.ng/index.php/catalog/178/related-materials",
        "publisher": "National Bureau of Statistics",
        "title": "Nigeria Time Use Survey 2024 methodology",
        "locator": "Official catalogue entry: objectives, coverage, sample design, instruments, fieldwork, processing and reporting.",
        "scope": "A Nigerian survey example; not a role or curriculum requirement.",
    },
    "niser_research_projects": {
        "url": "https://niser.gov.ng/v2/team-research-project-trp/",
        "publisher": "Nigerian Institute of Social and Economic Research",
        "title": "Team Research Projects",
        "locator": "Institute research-project descriptions and team research context.",
        "scope": "One Nigerian research institution's work; not a complete employer or role map.",
    },
}

SEARCHED_SOURCES = list(SOURCES)


def sourced(indices: list[int], source_ids: list[str], claim: str, limit: str) -> dict[int, dict]:
    return {
        i: {
            "state": "source_backed_bounded_nigerian_context",
            "claim": claim,
            "sources": [SOURCES[s] for s in source_ids],
            "limits": limit,
            "student_visibility": "hidden_until_learning_path_and_promotion_review",
        }
        for i in indices
    }


def main() -> None:
    # These are deliberately narrow: the source supports a Nigerian example or
    # curriculum context, not that the item is required for a Nigerian role.
    entries: dict[int, dict] = {}
    entries.update(sourced(
        [10], ["niser_research_projects", "nbs_nlfs_methodology"],
        "Nigerian research institutions and official statistics programmes provide local examples of coordinated research projects, field operations, quality control and reporting.",
        "This does not make project management a universal D078 foundation, a role requirement or a Nigerian credential requirement.",
    ))
    entries.update(sourced(
        [11, 29, 30, 92, 102, 105, 107, 115, 118, 122, 127, 140, 147, 171, 172, 177, 181, 182, 183, 184, 187, 190, 194, 196, 201, 203, 204, 210, 211, 214, 215],
        ["nuc_social_sciences_ccmas", "nuc_communication_media_ccmas", "nuc_law_ccmas", "nuc_education_ccmas"],
        "The Nigerian NUC curriculum corpus contains bounded programme/course examples related to this concept, such as social-science research, Nigerian institutions and law, communication, teaching, ethics, statistics, computing, or reporting, depending on the item.",
        "The curriculum example is not evidence that the item is required for every D078 route, every Nigerian employer or a professional licence. The exact programme and course locator must be shown in staff provenance.",
    ))
    entries.update(sourced(
        [134, 143, 179, 188, 205], ["nuc_social_sciences_ccmas", "nbs_nlfs_methodology"],
        "Nigerian curriculum or official-statistics material provides a local context for related research/data work, but not a direct item-specific professional claim.",
        "This is contextual evidence only and must not be presented as proof that the named specialist item is required or broadly practised in Nigeria.",
    ))

    exhausted = [42, 88, 118, 128, 131, 132, 141, 143, 152, 164, 168, 174, 176, 178, 179, 187, 199, 205, 207, 208, 212, 213]
    for i in exhausted:
        # Do not overwrite a stronger, sourced disposition above.
        if i in entries:
            continue
        entries[i] = {
            "state": "exhausted_search_no_established_nigerian_claim",
            "claim": "No defensible Nigerian-specific requirement, occupational authorization, prevalence claim or item-specific practice context was established for this record after searching the official Nigerian curriculum and public-sector sources listed below.",
            "searched_sources": [SOURCES[s] for s in SEARCHED_SOURCES],
            "search_scope": "NUC Social Sciences, Communication and Media Studies, Law and Education CCMAS documents; NBS survey/methodology catalogues; NISER research-project pages; local repository CCMAS extraction and existing D078 evidence ledger.",
            "limits": "This is an exhausted-search disposition, not evidence that the item is absent from Nigeria. Keep the item hidden from student display until a later item-specific source is found and reviewed.",
            "student_visibility": "hidden_until_learning_path_and_promotion_review",
        }

    out = {
        "schema_version": "2026-10-09.d078.nigerian-context-disposition.v1",
        "status": "noncanonical_review_only",
        "access_date": "2026-10-09",
        "purpose": "Resolve the Nigerian-context evidence gate without inferring requirements or reopening role fit.",
        "coverage": {"queue_indices": sorted(entries), "record_count": len(entries), "source_backed_count": sum(v["state"] == "source_backed_bounded_nigerian_context" for v in entries.values()), "exhausted_no_claim_count": sum(v["state"] == "exhausted_search_no_established_nigerian_claim" for v in entries.values())},
        "sources": SOURCES,
        "records": entries,
        "method": "A source-backed bounded local context is accepted only when the cited Nigerian source supports the topic at the stated scope. Otherwise the result is an explicit exhausted-search/no-local-claim disposition.",
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(out["coverage"], indent=2))


if __name__ == "__main__":
    main()
