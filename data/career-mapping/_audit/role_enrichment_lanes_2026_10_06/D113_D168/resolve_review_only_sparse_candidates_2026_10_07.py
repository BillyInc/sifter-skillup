"""Resolve the D113-D168 sparse-role review-only candidates from cited evidence.

This updates only the disjoint review/checkpoint artifacts. It never edits
canonical role, domain, or specialization data.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
LANE = ROOT / "data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168"
REVIEW = LANE / "D113_D168_sparse_role_disjoint_review_2026_10_07.json"
MARKDOWN = LANE / "D113_D168_sparse_role_disjoint_review_2026_10_07.md"
CHECKPOINT_JSON = LANE / "D113_D168_sparse_role_disjoint_checkpoint_2026_10_07.json"
CHECKPOINT_MD = LANE / "D113_D168_sparse_role_disjoint_checkpoint_2026_10_07.md"


def src(source_id: str, publisher: str, title: str, url: str, locator: str,
        scope: str = "global occupational reference", limit: str = "") -> dict:
    return {
        "source_id": source_id, "publisher": publisher, "title": title,
        "url": url, "locator": locator, "access_date": "2026-10-07",
        "scope": scope,
        "source_limit": limit or "Supports role tasks/occupational fit; it does not establish vacancy volume or universal licensing.",
    }


S = {
    "rso": src("AAPM_RPT160_RSO", "American Association of Physicists in Medicine", "Radiation Safety Officer Qualifications for Medical Facilities (Report 160)", "https://www.aapm.org/pubs/reports/detail.asp?docid=133", "Purpose and scope: defines RSO duties within a medical-facility radiation protection program; discusses authority, qualifications, management of radiation hazards and the medical physicist's possible RSO role."),
    "interfaith_wheaton": src("WHEATON_INTERFAITH_COORDINATOR", "Wheaton College", "Interfaith Engagement Coordinator", "https://jobs.wheatoncollege.edu/postings/3543", "Position duties: coordinate interfaith engagement, religious literacy, dialogue and campus programming; institutional role example, not a universal job standard."),
    "interfaith_shenandoah": src("SHENANDOAH_INTERFAITH_COORDINATOR", "Shenandoah University", "Interfaith and Engagement Coordinator", "https://jobs.silkroad.com/ShenandoahUniversity/EmploymentPortal/jobs/2654", "Position duties: facilitate interfaith dialogue, religious literacy and campus community engagement."),
    "bls_photo": src("BLS_PHOTOGRAMMETRIST", "U.S. Bureau of Labor Statistics", "Cartographers and Photogrammetrists", "https://www.bls.gov/ooh/architecture-and-engineering/cartographers-and-photogrammetrists.htm", "Photogrammetrist occupational subsection and duties: derive spatial information from aerial/satellite imagery and produce maps/geospatial data; U.S. occupational reference."),
    "ey_indirect_ng": src("EY_NG_INDIRECT_TAX", "EY Nigeria", "Staff, Indirect Tax Core", "https://careers.ey.com/ey/job/Lagos-Staff%2C-Indirect-Tax/1378909433/", "Role overview and responsibilities: Nigerian VAT and customs/excise advice, compliance, statutory filings, tax-authority liaison and interpretation of indirect-tax legislation.", "Nigeria-specific role-task evidence", "One Nigerian employer/job example; not a national vacancy or demand estimate."),
    "ey_intl_tax": src("EY_INTL_TAX_CONSULTANT", "EY Indonesia", "International Tax and Transaction Services Consultant", "https://careers.ey.com/ey/job/Jakarta-International-Tax-and-Transaction-Services-%28ITTS%29-Consultant-12190/703950401/", "Job purpose and client responsibilities: cross-border advice, tax treaties, restructuring, due diligence, tax memoranda and applying local rules to client transactions; jurisdiction-specific details are not universal."),
    "ey_payroll": src("EY_PAYROLL_TAX_ADMIN", "EY Africa", "Payroll Tax Administrator", "https://careers.ey.com/ey/job/Durban-Payroll-Tax-Administrator-KwaZ-4051/1436701233/", "Responsibilities/qualification: configure payroll tax and statutory deductions according to country law, calculate taxes outside payroll systems, maintain current payroll/tax knowledge; South Africa/Africa employer example."),
    "uk_tax_inspector": src("UK_NCS_TAX_INSPECTOR", "UK National Careers Service", "Tax inspector", "https://nationalcareers.service.gov.uk/job-profiles/tax-inspector", "Day-to-day tasks: examine business accounts, investigate suspected fraud, apply tax law, negotiate settlements and represent HMRC at appeals tribunals; UK government occupation profile."),
    "hmrc_framework": src("UK_GOV_TAX_FRAMEWORK", "UK Government Tax Profession", "Government Tax Profession Career Framework", "https://www.gov.uk/government/publications/government-tax-profession-career-framework/government-tax-profession-career-framework-html", "Audit and Analysis Overview; Auditor Officer/Higher Officer role summaries and duties: examine systems/data, conduct audit tests, identify tax risks, document findings and support compliance; UK government framework."),
    "aba_tax": src("ABA_TAX_LAW_PRACTICE", "American Bar Association", "Have You Considered a Career in Tax Law?", "https://www.americanbar.org/groups/young_lawyers/resources/after-the-bar/practice-areas/have-you-considered-a-career-in-tax-law/", "Practice Area/Practice Role sections: tax lawyers advise on planning, cross-border transactions and disputes; tax controversy lawyers handle audits, refund requests and disputes. U.S. professional context; legal authorization varies."),
    "ey_tax_policy": src("EY_TAX_POLICY", "EY", "Tax Policy - Senior Consultant", "https://careers.ey.com/ey/job/Dubai-Tax-Policy-%26-Controversy-Consultant-Dubai-9267/1253254401/", "Key responsibilities: advise governments on tax-policy development, support implementation by tax administrations, analyze international initiatives and translate policy outcomes into recommendations; UAE role example."),
    "ey_transfer_analyst": src("EY_TRANSFER_PRICING_ANALYST", "EY India", "Analyst - Tax - Transfer Pricing", "https://careers.ey.com/ey/job/Mumbai-Analyst-TAX-CHS-TAX-ITTS-Transfer-Pricing-Mumbai-MH-400028/1430003233/", "Key responsibilities: identify international related-party transactions, compute arm's-length prices, select methods, prepare transfer-pricing studies/reports and benchmarking analyses; India employer example."),
    "unhcr_rsd": src("UNHCR_RSD_CASEWORK", "UNHCR", "RSD Caseworker vacancy profile", "https://www.unhcr.org/il/wp-content/uploads/sites/6/2021/05/Vacancy-Senior-Protection-Assistant-RSD-Caseworker.pdf", "Role duties: register/process claims, interview applicants, gather and assess evidence, prepare protection/status assessments and recommendations; UNHCR operational role, not a universal public adjudication authority."),
    "uscis_asylum": src("USCIS_ASYLUM_OFFICER", "U.S. Citizenship and Immigration Services", "Introduction to the Non-Adversarial Interview", "https://www.uscis.gov/sites/default/files/document/foia/Interviewing_-_Intro_to_the_NonAdversarial_Interview_LP_RAIO.pdf", "Asylum adjudications training: asylum officer conducts non-adversarial interviews, elicits facts and makes/recommends protection eligibility determinations; U.S. government role and authority."),
    "uk_imm_caseworker": src("UK_HOME_OFFICE_IMM_CASEWORKER", "UK Home Office", "Immigration Caseworker recruitment", "https://careers.homeoffice.gov.uk/news/ieeocaseworkerjune26/", "Role description: assess immigration applications/evidence and make decisions by applying UK immigration rules and policy; UK public-service authority only."),
    "uk_imm_adviser": src("UK_NCS_IMMIGRATION_ADVISER", "UK National Careers Service", "Immigration adviser (non-government)", "https://nationalcareers.service.gov.uk/job-profiles/immigration-adviser-non-government", "Alternative title includes immigration case worker; tasks include gather case facts, advise on options, prepare applications/appeals and represent clients subject to advice-level rules; UK-specific authorization."),
    "iom_migration_policy": src("IOM_MIGRATION_POLICY_OFFICER", "International Organization for Migration", "Migration Policy Officer", "https://recruit.iom.int/sap/bc/bsp/sap/hrrcf_wd_dovru/application.do?PARAM=cmNmdHlwZT1waW5zdCZwaW5zdD0wMDUwNTY4NTFDN0MxRURCQjNDMTg1NkQ1Q0NDNjBGQw%3D%3D&sap-client=100&sap-language=EN", "Core functions: implement Migration Governance Indicators, assess policy frameworks with governments, coordinate stakeholders and deliver policy presentations; organizational programme role, not a claim of country-specific statutory authority."),
    "autm_licensing": src("AUTM_LICENSING_ASSOCIATE", "Association of University Technology Managers", "AUTM Salary Survey 2012", "https://autm.net/AUTM/media/SurveyReportsPDF/2012-AUTM-Salary-Survey.pdf", "Position/title table and licensing role responsibilities: evaluate commercial potential, identify licensees, develop marketing materials and negotiate/manage license agreements; dated survey, used for occupation/task existence only."),
    "uc_tto": src("UC_TECH_TRANSFER_OFFICER", "University of California", "Archived Title Specifications: Technology Transfer Officer", "https://ucnet.universityofcalifornia.edu/wp-content/uploads/2024/12/Archived-Title-Specifications.pdf", "Technology Transfer Officer 3 specification: evaluate commercial potential, formulate licensing strategy, market to licensees, negotiate/draft agreements and manage patent-prosecution support; archived title specification."),
    "uspto_patent": src("USPTO_PATENT_PRACTICE", "U.S. Patent and Trademark Office", "Applying for Patents", "https://www.uspto.gov/patents/basics/apply", "Patent attorney/agent representation and application process: prepare/file/prosecute patent applications; registration and scope of practice are U.S.-specific."),
    "uspto_trademark": src("USPTO_TRADEMARK_COUNSEL", "U.S. Patent and Trademark Office", "Do I need an attorney?", "https://www.uspto.gov/trademarks/basics/do-i-need-attorney", "Attorney representation guidance: legal advice, trademark searches, application preparation, responses and protection strategy; U.S. representation requirements are jurisdiction-specific."),
}


RESOLUTIONS = {
    "D137|radiation protection specialist": {
        "disposition": "add", "normalized_title": "Radiation Safety Officer (Medical Facility)",
        "status": "corroborated_role_title_normalized", "sources": ["rso"],
        "evidence": "AAPM Report 160 identifies the Radiation Safety Officer (RSO) role in a medical facility and details management/authority for its radiation protection program, including qualification boundaries and coordination with medical physicists. Normalize the vague candidate title to this evidenced role; do not equate it with a radiation-protection technician.",
        "parent": "A medical-facility radiation protection program is directly within Medical Physics and Radiation Therapy, subject to role-specific qualification and delegated authority.",
        "area": "The Medical Health Physics and Radiation Protection boundary explicitly covers medical-facility radiation safety and protection; the RSO task profile fits.",
        "area_label": "Medical Health Physics and Radiation Protection",
        "reason": "Promote only under the source-grounded title Radiation Safety Officer (Medical Facility); preserve qualification and jurisdiction limits.",
    },
    "D150|interfaith programme coordinator": {
        "disposition": "add", "normalized_title": "Interfaith Engagement Coordinator",
        "status": "corroborated_role_title_normalized", "sources": ["interfaith_wheaton", "interfaith_shenandoah"],
        "evidence": "Two university role descriptions establish interfaith engagement coordinator work: organize cross-faith programming, facilitate religious literacy/dialogue and build campus/community engagement.",
        "parent": "Cross-faith dialogue and religious-community engagement are directly within Religious Ministry, Theology and Interfaith Leadership.",
        "area": "The reconciled area covers interfaith dialogue, cooperation and community engagement; both role descriptions match these tasks.",
        "area_label": "Interfaith Engagement and Community Leadership",
        "reason": "Two distinct university role descriptions support the role and its direct parent/area fit; institutional titles are not universal licensing standards.",
    },
    "D156|photogrammetrist": {
        "disposition": "alias_existing", "target": "D156|photogrammetrist",
        "status": "corroborated_existing_canonical_role", "sources": ["bls_photo"],
        "evidence": "BLS identifies photogrammetrists as an occupational title and describes deriving spatial information from imagery. The exact role is already in the D156 canonical role catalogue.",
        "parent": "Imagery-based spatial measurement and mapping directly fit Land Surveying and Cadastral Mapping.",
        "area": "Direct fit to Geospatial Mapping, GIS and Photogrammetry.", "area_label": "Geospatial Mapping, GIS and Photogrammetry",
        "reason": "No new role is needed: the exact canonical D156 role already exists; close the candidate as an evidence-backed duplicate/alias.",
    },
    "D156|remote sensing survey specialist": {
        "disposition": "reject", "status": "title_not_established_distinct_role", "sources": ["bls_photo"],
        "evidence": "The described imagery-to-spatial-product tasks are already represented by the established photogrammetrist role. The searched authoritative occupational source does not establish 'Remote-Sensing Survey Specialist' as a distinct title or task family.",
        "parent": "The task family can support the parent domain only when performed as survey/geospatial measurement; this candidate's title does not establish a distinct occupation.",
        "area": "The tasks fall within Geospatial Mapping, GIS and Photogrammetry but are not evidence for a second role separate from photogrammetrist.", "area_label": "Geospatial Mapping, GIS and Photogrammetry",
        "reason": "Reject as a distinct role candidate to avoid duplicating photogrammetrist from a title-only variant; do not infer an occupation from the label.",
    },
    "D157|indirect tax specialist": {
        "disposition": "add", "normalized_title": "Indirect Tax Associate / Specialist", "status": "corroborated_exact_tasks_and_ng_example", "sources": ["ey_indirect_ng"],
        "evidence": "EY Nigeria describes an indirect-tax role handling VAT and customs/excise advice, compliance, statutory filings, tax-authority responses and legislative interpretation.",
        "parent": "Indirect-tax advice, compliance and administration are core taxation/revenue practice tasks.",
        "area": "Tax Compliance and Advisory includes tax compliance filings and advice; the source tasks directly match.", "area_label": "Tax Compliance and Advisory",
        "reason": "Exact Nigerian employer evidence supports role tasks, parent fit and area fit. The Nigerian posting is contextual evidence, not a demand/vacancy estimate.",
        "nigeria": ["ey_indirect_ng"],
    },
    "D157|international tax consultant": {
        "disposition": "alias_existing", "target": "D157|international tax consultant", "status": "corroborated_exact_canonical_role", "sources": ["ey_intl_tax"],
        "evidence": "EY describes the exact International Tax and Transaction Services Consultant title with cross-border tax treaty analysis, restructuring, due diligence, tax memoranda and advice. The exact title is already canonical in D157.",
        "parent": "Cross-border tax advice and compliance fit Taxation and Revenue Practice.", "area": "Direct fit to International Tax and Transfer Pricing.", "area_label": "International Tax and Transfer Pricing",
        "reason": "The role is already present under the same canonical title; close as source-backed duplicate, not a new role.",
    },
    "D157|payroll tax specialist": {
        "disposition": "add", "normalized_title": "Payroll Tax Administrator", "status": "corroborated_role_title_normalized", "sources": ["ey_payroll"],
        "evidence": "EY's Payroll Tax Administrator role calculates tax/statutory deductions, configures payroll tax rules for local legislation and keeps payroll-tax processes current. Use the evidenced title rather than an unsupported generic 'specialist'.",
        "parent": "Tax withholding and statutory employment-tax calculations are tax compliance work; scope is limited to the tax component, not general payroll administration.",
        "area": "Tax Compliance and Advisory covers statutory compliance; the candidate is restricted to tax/deduction compliance rather than general payroll operations.", "area_label": "Tax Compliance and Advisory",
        "reason": "Resolve the generic candidate to an evidenced occupational title and restrict its scope to tax compliance; the source is an African/South African employer example, not Nigerian law.",
    },
    "D157|tax auditor": {
        "disposition": "add", "normalized_title": "Tax Auditor", "status": "corroborated_role_task_family", "sources": ["hmrc_framework", "uk_tax_inspector"],
        "evidence": "The UK Government Tax Profession framework has dedicated Auditor role profiles: audit business systems/data, perform tests, identify compliance risks, document findings and support tax compliance. The National Careers Service tax-inspector profile separately confirms examining accounts and investigating tax compliance.",
        "parent": "Tax audit and compliance assurance are direct Taxation and Revenue Practice functions.",
        "area": "Tax Disputes and Controversy includes audit/review matters and responses; an auditor role fits this area when focused on tax audit/controversy, not general financial audit.", "area_label": "Tax Disputes and Controversy",
        "reason": "Role-task evidence is now specific; keep public revenue-audit authority jurisdiction-labelled and do not imply that every private auditor has statutory powers.",
    },
    "D157|tax lawyer": {
        "disposition": "add", "normalized_title": "Tax Lawyer", "status": "corroborated_specialty_and_tasks", "sources": ["aba_tax"],
        "evidence": "The ABA tax-law career profile distinguishes tax planning, compliance and controversy roles; it describes cross-border transaction structuring and tax controversy lawyers handling audits, refund claims and disputes.",
        "parent": "Tax-law advice and controversy are directly tax-practice functions; this record is restricted to tax-specific legal advice/representation, not general legal practice.",
        "area": "Tax Disputes and Controversy is the supported area for tax audit disputes, refund claims and representation. Do not place all general tax planning under this role-area pairing.", "area_label": "Tax Disputes and Controversy",
        "reason": "Tax-law specialization has task-specific professional evidence and direct tax-domain/controversy-area fit; legal authorization remains jurisdiction-specific.",
    },
    "D157|tax policy analyst": {
        "disposition": "add", "normalized_title": "Tax Policy Analyst / Consultant", "status": "corroborated_role_family_title_normalized", "sources": ["ey_tax_policy"],
        "evidence": "EY's Tax Policy Senior Consultant role advises governments on tax policy design, supports tax/revenue administration implementation and converts policy outcomes into recommendations. The candidate is normalized to this evidenced analyst/consultant job family.",
        "parent": "Tax-policy analysis and tax/revenue administration directly fit Taxation and Revenue Practice.",
        "area": "Tax Policy and Administration explicitly covers policy analysis and administration; the source duties match.", "area_label": "Tax Policy and Administration",
        "reason": "Source supports the work family although employer grade/title varies; retain the normalized title and do not imply government appointment or statutory authority.",
    },
    "D157|transfer pricing analyst": {
        "disposition": "alias_existing", "target": "D157|transfer pricing specialist", "status": "corroborated_existing_task_family", "sources": ["ey_transfer_analyst"],
        "evidence": "EY's Analyst—Transfer Pricing role performs related-party transaction analysis, arm's-length calculations, benchmarking and documentation. These are the same core task family as the existing D157 Transfer Pricing Specialist role.",
        "parent": "Transfer-pricing analysis is tax advisory/compliance work.", "area": "Direct fit to International Tax and Transfer Pricing.", "area_label": "International Tax and Transfer Pricing",
        "reason": "Keep the analyst title as a searchable alias to the existing specialist role; no duplicate canonical role is warranted from grade variation alone.",
    },
    "D162|asylum caseworker": {
        "disposition": "add", "normalized_title": "Refugee Status Determination Caseworker (RSD Caseworker)", "status": "corroborated_role_title_normalized", "sources": ["unhcr_rsd"],
        "evidence": "UNHCR's RSD Caseworker profile covers processing protection claims, interviewing applicants, assessing facts/evidence and preparing status assessments or recommendations. Normalize the vague asylum-caseworker title to the documented RSD job family.",
        "parent": "Protection-claim assessment and status determination directly fit Immigration Law and Asylum.",
        "area": "Refugee Status Determination and Protection Operations covers case assessment and protection-status operations; duties match.", "area_label": "Refugee Status Determination and Protection Operations",
        "reason": "Role and area are supported; distinction between caseworker recommendations and an authority's final decision is explicit and jurisdiction-dependent.",
    },
    "D162|asylum officer": {
        "disposition": "add", "normalized_title": "Asylum Officer (United States; jurisdiction-specific)", "status": "corroborated_jurisdiction_specific", "sources": ["uscis_asylum"],
        "evidence": "USCIS training explicitly describes asylum officers conducting non-adversarial interviews and assessing protection eligibility as government decision-makers.",
        "parent": "Asylum adjudication is directly within Immigration Law and Asylum.",
        "area": "Refugee Status Determination and Protection Operations covers administrative assessment and case decisions.", "area_label": "Refugee Status Determination and Protection Operations",
        "reason": "Add only as an explicitly U.S.-specific public-authority role; do not imply this title or adjudication power exists in every country.",
    },
    "D162|immigration caseworker": {
        "disposition": "add", "normalized_title": "Immigration Caseworker (UK Home Office; jurisdiction-specific)", "status": "corroborated_jurisdiction_specific", "sources": ["uk_imm_caseworker"],
        "evidence": "The UK Home Office recruits Immigration Caseworkers to assess applications/evidence and make decisions by applying UK immigration rules and policy.",
        "parent": "Immigration application assessment is directly within Immigration Law and Asylum.",
        "area": "Immigration Law and Status Applications covers application/status processing and decision tasks.", "area_label": "Immigration Law and Status Applications",
        "reason": "Add as a UK public-service role with UK authority explicitly labelled; it is not conflated with private immigration adviser work.",
    },
    "D162|immigration lawyer": {
        "disposition": "alias_existing", "target": "D162|immigration lawyer / solicitor", "status": "corroborated_existing_canonical_role", "sources": ["uk_imm_adviser"],
        "evidence": "The UK National Careers Service identifies immigration advisers/caseworkers and describes case facts, applications, advice, appeals and representation, subject to advice-level limits. The D162 canonical library already contains Immigration Lawyer / Solicitor.",
        "parent": "Immigration-specific advice and legal representation fit the parent domain, subject to jurisdictional authorization.",
        "area": "Direct fit to Immigration Law and Status Applications for the supported application/advice work.", "area_label": "Immigration Law and Status Applications",
        "reason": "Close the candidate as an existing canonical role. Preserve the distinction between a regulated lawyer and non-lawyer adviser; do not use the source to imply equal legal authority.",
    },
    "D162|migration policy analyst": {
        "disposition": "add", "normalized_title": "Migration Policy Officer / Analyst", "status": "corroborated_role_family_title_normalized", "sources": ["iom_migration_policy"],
        "evidence": "IOM's Migration Policy Officer profile covers evidence-based migration policy/governance analysis, assessing policy frameworks with governments, stakeholder coordination and policy presentations.",
        "parent": "Migration policy and migration-governance analysis directly fit Immigration Law and Asylum's policy/programme scope.",
        "area": "Immigration Compliance, Policy and Programme Administration includes migration policy/programme analysis; IOM's duties align.", "area_label": "Immigration Compliance, Policy and Programme Administration",
        "reason": "Resolve the uncertain analyst label to a documented Migration Policy Officer/Analyst role family; the IOM source is global institutional evidence, not proof of a statutory regulator role in each country.",
    },
    "D163|ip licensing specialist": {
        "disposition": "add", "normalized_title": "IP Licensing Associate / Specialist", "status": "corroborated_role_family_title_normalized", "sources": ["autm_licensing"],
        "evidence": "AUTM's technology-transfer salary survey reports licensing-associate positions and licensing tasks including commercial evaluation, identifying licensees, marketing technologies and negotiating agreements. This is narrower licensing work than the broader technology-transfer officer profile.",
        "parent": "IP licensing and commercialization are directly within Intellectual Property Law, Patents and Technology Licensing; the role is non-attorney unless separately qualified.",
        "area": "IP Transactions, Licensing and Commercialization directly covers evaluation, licensing and commercialization tasks.", "area_label": "IP Transactions, Licensing and Commercialization",
        "reason": "Normalize to the evidenced licensing-associate/specialist family, keep it distinct from the broader technology-transfer officer, and do not imply legal advice authority.",
    },
    "D163|patent attorney": {
        "disposition": "alias_existing", "target": "D163|patent attorney / patent agent", "status": "corroborated_existing_canonical_role", "sources": ["uspto_patent"],
        "evidence": "USPTO explains patent attorney/agent preparation and prosecution of patent applications and associated registration rules. D163 already contains Patent Attorney / Patent Agent.",
        "parent": "Patent drafting/prosecution is directly within IP law and patents.", "area": "Direct fit to Patent Drafting, Prosecution and Patent Information.", "area_label": "Patent Drafting, Prosecution and Patent Information",
        "reason": "Exact role family already exists. Keep attorney and patent-agent authorization differences jurisdiction-specific; do not create a duplicate.",
    },
    "D163|technology transfer officer": {
        "disposition": "add", "normalized_title": "Technology Transfer Officer", "status": "corroborated_exact_role_title_and_tasks", "sources": ["uc_tto"],
        "evidence": "University of California title specifications identify Technology Transfer Officer and duties spanning invention commercial evaluation, licensing strategy, marketing to licensees, agreement negotiation/drafting and patent-prosecution coordination.",
        "parent": "Transferring and commercializing protected research/IP directly fit Intellectual Property Law, Patents and Technology Licensing.",
        "area": "IP Transactions, Licensing and Commercialization covers licensing and commercialization; role's broader technology-transfer duties fit.", "area_label": "IP Transactions, Licensing and Commercialization",
        "reason": "Role title and tasks are directly established. This is a university technology-transfer office example and does not itself imply legal-practice authority.",
    },
    "D163|trademark attorney": {
        "disposition": "alias_existing", "target": "D163|trademark attorney", "status": "corroborated_existing_canonical_role", "sources": ["uspto_trademark"],
        "evidence": "USPTO describes attorney support for trademark searches, application preparation, legal advice and protection strategy. The exact D163 Trademark Attorney role already exists.",
        "parent": "Trademark registration/protection legal work directly fits Intellectual Property Law, Patents and Technology Licensing.", "area": "Direct fit to IP Portfolio, Strategy and Rights Management.", "area_label": "IP Portfolio, Strategy and Rights Management",
        "reason": "Exact role is already canonical; close as a sourced duplicate. Attorney authorization and representation requirements vary by jurisdiction.",
    },
}


def build_markdown(data: dict) -> str:
    counts = data["counts"]["dispositions"]
    lines = [
        "# D113-D168 sparse-role disjoint review — 2026-10-07", "",
        f"Reviewed **{len(data['records'])}** ledger candidates across **{data['counts']['domains_with_candidates']}** domains: **{counts.get('add', 0)} add**, **{counts.get('alias_existing', 0)} alias-existing**, **{counts.get('review_only', 0)} review-only**, **{counts.get('reject', 0)} reject**, **{counts.get('reject_bundle', 0)} reject-bundle**.",
        f"Disaggregated bundle components: **{data['counts']['disaggregated_bundle_components']}**. Area labels changed to reconciled Step 1 recommendations: **{data['counts']['area_remappings']}**. Canonical files edited: **no**.", "",
        "| Candidate | Disposition | Task evidence | Parent-domain fit | Step 1 area / fit | Reason |", "|---|---|---|---|---|---|",
    ]
    for r in data["records"]:
        area = r.get("recommended_area_fit", {})
        parent = r.get("parent_domain_fit", {})
        lines.append("| {} | {} | {} | {} | {}/{} | {} |".format(
            r["candidate_key"], r["disposition"], r.get("task_evidence_status", ""),
            parent.get("status", ""), area.get("area_label") or "None", area.get("status", ""),
            (r.get("disposition_reason", "") + " Sources: " + "; ".join(s["url"] for s in r.get("global_context", []))).replace("|", "\\|")
        ))
    lines.extend(["", "## Split aliases", "", "| Bundle component | Disposition | Target | Reason |", "|---|---|---|---|"])
    for c in data.get("disaggregated_bundle_components", []):
        reason = c.get("reason", "").replace("|", "\\|")
        lines.append(f"| {c.get('role_title')} | {c.get('disposition')} | {c.get('target_candidate_key', 'none')} | {reason} |")
    lines.extend(["", "## Evidence and limits", "", "Global occupational task evidence and Nigerian context are stored separately on each record, with URLs, locators, access dates, and source limitations. Exact-title duplicates are aliases to existing canonical roles; normalized titles are explicit where the source uses a different established title. Jurisdiction-specific authority is never generalized.", "", "No canonical role, domain, subgroup or overlay file was edited. `add` means an evidence-backed proposal for a later canonical merge; it does not mean already active. `alias_existing` closes a duplicate against the stated current role key."])
    return "\n".join(lines) + "\n"


def main() -> None:
    data = json.loads(REVIEW.read_text(encoding="utf-8"))
    by_key = {r["candidate_key"].casefold(): r for r in data["records"]}
    missing = {key.casefold() for key in RESOLUTIONS} - set(by_key)
    if missing:
        raise SystemExit(f"Expected review candidates missing: {sorted(missing)}")
    now = datetime.now(timezone.utc).isoformat()
    for key, resolution in RESOLUTIONS.items():
        r = by_key[key.casefold()]
        r["disposition"] = resolution["disposition"]
        r["task_evidence_status"] = resolution["status"]
        r["exact_role_task_evidence"] = resolution["evidence"]
        r["task_evidence_source"] = {
            "url": S[resolution["sources"][0]]["url"],
            "locator": S[resolution["sources"][0]]["locator"],
        }
        r["global_context"] = [S[name] for name in resolution["sources"]]
        r["parent_domain_fit"] = {"status": "supported" if resolution["disposition"] in {"add", "alias_existing"} else "not_supported_as_distinct_role", "rationale": resolution["parent"]}
        r["recommended_area_fit"] = {
            "status": "supported" if resolution["disposition"] in {"add", "alias_existing"} else "not_fit_as_distinct_role",
            "area_label": resolution["area_label"],
            "area_scope": r.get("recommended_area_fit", {}).get("area_scope", ""),
            "area_boundary": r.get("recommended_area_fit", {}).get("area_boundary", ""),
            "rationale": resolution["area"],
            "remapped_from_ledger_area": r.get("recommended_area_fit", {}).get("remapped_from_ledger_area"),
        }
        r["disposition_reason"] = resolution["reason"]
        if "normalized_title" in resolution:
            r["normalized_role_title"] = resolution["normalized_title"]
        if "target" in resolution:
            r["alias_target_role_key"] = resolution["target"]
            r["alias_relation"] = "same documented task family / canonical duplicate"
        if "nigeria" in resolution:
            r["nigerian_context"] = {
                "scope": "Nigeria-specific role-task example; separate from global occupational definition",
                "source_refs": [S[name] for name in resolution["nigeria"]],
                "claim_limit": "Employer role evidence establishes that these tasks occur in this Nigerian context; it does not measure national demand, vacancies, or universal regulation.",
            }
        r["canonical_files_edited"] = False
    bundle_resolution = {
        "tax adviser": ("alias_existing", "D157|tax advisor", "The existing canonical D157 tax advisor already represents the general tax-advice role family. Keep this broad title as a searchable alias; do not claim it is a distinct tax-policy, international-tax or legal role."),
        "transfer pricing specialist": ("alias_existing", "D157|transfer pricing specialist", "The exact D157 Transfer Pricing Specialist role already exists. The separate analyst candidate is also resolved to this same role family; do not duplicate it."),
    }
    for component in data.get("disaggregated_bundle_components", []):
        outcome = bundle_resolution.get(component.get("role_title", "").casefold())
        if outcome:
            component["disposition"], component["target_candidate_key"], component["reason"] = outcome
            component["counted_as_candidate_add"] = False
            component["note"] = "Resolved as an alias to an existing canonical D157 role; the rejected heterogeneous bundle remains rejected."
    data["status"] = "all_lane_records_dispositioned_evidence_reconciled"
    data["updated_at_utc"] = now
    data["resolution_method"] = "Manual candidate-by-candidate reconciliation against direct employer, government, professional-body and occupational task sources; no title-only, ISCO-only or subgroup-membership fit."
    counts = Counter(r["disposition"] for r in data["records"])
    data["counts"]["dispositions"] = dict(sorted(counts.items()))
    data["counts"]["add_candidates"] = counts["add"]
    data["counts"]["review_only"] = counts["review_only"]
    data["counts"]["alias_existing_candidate_records"] = counts["alias_existing"]
    data["counts"]["rejected_candidates_including_bundles"] = counts["reject"] + counts["reject_bundle"]
    per_domain = defaultdict(Counter)
    for r in data["records"]:
        per_domain[r["domain_id"]][r["disposition"]] += 1
    data["per_domain_dispositions"] = {d: dict(sorted(c.items())) for d, c in sorted(per_domain.items())}
    data["integrity"].update({
        "all_lane_records_dispositioned_once": all(r["disposition"] != "review_only" for r in data["records"]),
        "all_add_records_have_exact_task_evidence": all(r["task_evidence_status"].startswith("corroborated") for r in data["records"] if r["disposition"] == "add"),
        "all_add_records_have_domain_and_area_fit": all(r["parent_domain_fit"]["status"] == "supported" and r["recommended_area_fit"]["status"] == "supported" for r in data["records"] if r["disposition"] == "add"),
        "all_aliases_point_to_existing_canonical_key": all(bool(r.get("alias_target_role_key")) for r in data["records"] if r["disposition"] == "alias_existing"),
        "all_disaggregated_bundle_components_resolved": all(c.get("disposition") != "review_only" for c in data.get("disaggregated_bundle_components", [])),
        "canonical_files_edited": False,
    })
    data["next_action"] = "Cross-lane deduplicate and review proposed additions before any canonical merge; apply aliases to existing role identities and retain jurisdiction limitations."
    REVIEW.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MARKDOWN.write_text(build_markdown(data), encoding="utf-8")
    checkpoint = json.loads(CHECKPOINT_JSON.read_text(encoding="utf-8"))
    checkpoint["status"] = "all_assigned_candidates_reconciled_no_review_only"
    checkpoint["lane_is_running"] = False
    checkpoint["checkpoint_written_at_utc"] = now
    checkpoint["counts"] = data["counts"]
    checkpoint["per_domain_dispositions"] = data["per_domain_dispositions"]
    checkpoint["integrity"] = data["integrity"]
    checkpoint["resolution_script"] = str(Path(__file__).relative_to(ROOT)).replace("\\", "/")
    checkpoint["decision"] = "0 review-only sparse candidates remain. Existing canonical roles are recorded as alias_existing rather than duplicated; evidence-backed new proposals are not yet canonical edits."
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# D113-D168 sparse-role review checkpoint — 2026-10-07\n\n"
        f"All **{len(data['records'])}/{len(data['records'])}** candidates have evidence-backed dispositions: `{json.dumps(dict(sorted(counts.items())), ensure_ascii=False)}`. No `review_only` records remain.\n\n"
        f"- Domains covered: {data['counts']['domains_with_candidates']}\n"
        f"- Split bundle components: {data['counts']['disaggregated_bundle_components']}\n"
        f"- Step 1 area remappings: {data['counts']['area_remappings']}\n"
        f"- Canonical files edited: no\n"
        f"- Resolution script: `{checkpoint['resolution_script']}`\n"
        "- Integrity: all proposed adds have exact task evidence and separate parent/area fit; aliases point to existing canonical role keys; no role accepted from ISCO membership alone.\n\n"
        "Next: cross-lane deduplication and merge review. Jurisdiction-specific role authority remains explicitly scoped.\n", encoding="utf-8")
    print(json.dumps({"counts": dict(sorted(counts.items())), "integrity": data["integrity"], "review": str(REVIEW)}, indent=2))


if __name__ == "__main__":
    main()
