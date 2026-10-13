"""Build exact-key D066 Veterinary Science role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D066_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D066_role_domain_fit_review_2026_10_05.md"
WOAH_CODES = "https://www.woah.org/en/what-we-do/standards/"
WOAH_AQUATIC = "https://www.woah.org/en/what-we-do/animal-health-and-welfare/aquatic-animals/"
WOAH_PVS = "https://www.woah.org/en/what-we-offer/improving-veterinary-services/pvs-pathway/"
FAO_AQUATIC = "https://www.fao.org/in-action/aquatic-health-management-biosecurity/our-work/en"
AVMA_ALT_THERAPY = "https://ebusiness.avma.org/files/productdownloads/VetTherapeutics.pdf"

DECISIONS = {
    "alternative animal therapist": ("conditional", "The task treats sick/injured animals with alternative modalities. Animal treatment is within the subject matter, but the supplied description does not establish evidence, authorization or a veterinarian's diagnosis/referral; do not present alternative therapies as validated veterinary treatment.", "lawful, veterinarian-directed or referred practice within locally authorized scope, with evidence and welfare safeguards"),
    "animal artificial insemination technician": ("supported", "The task performs animal insemination under applicable law; the stored domain explicitly includes veterinary breeding procedures. This does not establish independent veterinary authority.", None),
    "animal behaviourist": ("supported", "The task assesses animal behaviour and develops environmental/management responses to problematic behaviour, directly matching veterinary animal behaviour and welfare work.", None),
    "animal chiropractor": ("conditional", "The task performs spinal/manual therapy only following veterinary diagnosis or referral and under applicable law. The link is limited to that supervised animal-rehabilitation remit.", "veterinary diagnosis/referral and locally authorized scope; do not imply independent diagnosis"),
    "animal embryo transfer technician": ("supported", "The task assists embryo transfer under veterinary supervision, directly matching the domain's veterinary breeding procedures.", None),
    "animal feed nutritionist": ("supported", "The task evaluates animal-feed nutrition and provides dietary advice, research and technical updates; this directly matches animal nutrition and health within the stored scope.", None),
    "animal hydrotherapist": ("conditional", "The task provides water-based rehabilitation after veterinary diagnosis/referral. It fits the animal-rehabilitation branch only within that referral and authorized practice boundary.", "veterinary diagnosis/referral and locally authorized rehabilitation duties"),
    "animal massage therapist": ("conditional", "The task uses soft-tissue treatment after veterinary diagnosis/referral. The link is limited to a supervised rehabilitation assignment, not independent veterinary treatment.", "veterinary diagnosis/referral and locally authorized rehabilitation duties"),
    "animal osteopath": ("conditional", "The task uses manual techniques for animal strain/injury following veterinary diagnosis/referral. Include only as a legally authorized, veterinary-directed rehabilitation task.", "veterinary diagnosis/referral and locally authorized rehabilitation duties"),
    "animal physiotherapist": ("supported", "The task provides physical therapy/exercise for animal recovery after surgery or injury, directly matching rehabilitation in the domain scope; the role's own text requires veterinary referral.", None),
    "animal therapist": ("conditional", "The task is animal therapy following veterinary diagnosis/referral, which is related to veterinary rehabilitation, but the generic title does not specify modality, qualification or legal scope.", "a named, locally authorized rehabilitation modality under veterinary diagnosis/referral"),
    "aquaculture biologist": ("conditional", "The task primarily improves aquaculture production and environmental interactions, but explicitly includes preventing/resolving animal-health problems. The veterinary-domain link applies to that health/welfare remit, not general aquaculture biology or production.", "aquatic animal health, welfare, disease prevention or diagnosis as a substantive assignment"),
    "aquatic animal health professional": ("supported", "The task diagnoses, prevents and treats aquatic-animal disease and injury. WOAH defines dedicated aquatic animal health services and standards for these functions.", None),
    "equine dental technician": ("conditional", "The task provides routine equine dental care. Include only within the locally authorized delegated scope and referral/supervision boundaries; it does not establish independent veterinary diagnosis or treatment authority.", "locally authorized equine dental duties with required veterinary oversight/referral"),
    "food biotechnologist": ("conditional", "The task addresses food-borne pathogens and food safety, which can intersect veterinary public health, but the supplied description does not establish animal-origin foods, zoonoses or veterinary-service duties.", "a defined veterinary-public-health/zoonosis or animal-origin food-safety assignment"),
    "general veterinarian": ("supported", "The task is independent veterinary practice across animal health and welfare, diagnosis, treatment and public health; this is the core of the domain.", None),
    "official veterinarian": ("supported", "The task performs official veterinary functions for animal health/welfare and public health under applicable authority; it directly fits the parent domain.", None),
    "specialised veterinarian": ("supported", "The task is specialist veterinary practice in animal medicine and welfare; it directly fits the parent domain, while the particular specialty remains outside this parent-fit review.", None),
    "veterinary nurse": ("supported", "The task supports animals receiving veterinary treatment and promotes animal health/disease prevention, directly matching the domain's clinical support remit.", None),
    "veterinary scientist": ("supported", "The task conducts animal-model/basic biology research and translates findings across species, directly fitting veterinary and comparative animal science.", None),
    "veterinary technician": ("supported", "The task provides technical and administrative support to veterinarians, directly fitting the veterinary-service team described in the domain.", None),
}


def _urls(refs: list[str]) -> list[str]:
    result = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            result.append(url)
    return list(dict.fromkeys(result))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D066"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 21 or len(by_name) != 21 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D066 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _urls(row["task_source_refs"])
        refs.extend([WOAH_CODES, WOAH_PVS])
        if any(x in name for x in ("aquatic", "aquaculture")):
            refs.extend([WOAH_AQUATIC, FAO_AQUATIC])
        if "alternative" in name:
            refs.append(AVMA_ALT_THERAPY)
        action = ("retain_parent_domain_link_candidate" if status == "supported" else
                  "do_not_present_as_confirmed_D066_role_without_assignment_evidence")
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "domain_fit_status": status,
                          "task_evidence": row["role_task_text"], "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "WOAH standards define international animal-health, welfare and veterinary-public-health boundaries; they do not replace national scope-of-practice law. ESCO task text describes the occupation concept, not local registration. Conditional classifications are not endorsements of modality efficacy, credentials or independent practice. The stored domain scope itself cites Nigerian registration, but this review makes no country-specific licensing determination.",
                          "recommended_action": action})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D066", "domain_name": "Veterinary Science",
            "scope": "D066 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Reviewed all 21 exact mappings against the stored scope: animal health/welfare, treatment, rehabilitation, breeding procedures, behaviour/nutrition, veterinary practice and public health. WOAH standards corroborate animal-health, welfare, aquatic-health and veterinary-service boundaries. Conditional cases require a specified supervised/authorized scope or an animal-health/veterinary-public-health assignment; occupational proximity does not establish credentials or endorse treatment efficacy.",
            "scope_sources": [WOAH_CODES, WOAH_AQUATIC, WOAH_PVS, FAO_AQUATIC, AVMA_ALT_THERAPY],
            "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. Conditional entries must not be presented as confirmed student routes without the stated assignment and scope evidence. No canonical changes or alternative assignments are made."}


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D066 — Veterinary Science: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/21 exact mappings reviewed against role tasks and the stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", f"| Supported | {c['supported']} |", f"| Conditional | {c['conditional']} |", f"| Unsupported | {c['unsupported']} |", f"| Unresolved | {c['unresolved']} |", "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" + (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |" for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"[WOAH international standards]({WOAH_CODES}) cover terrestrial animal health/welfare and veterinary public health, and establish separate aquatic-health codes. WOAH's [aquatic animal work]({WOAH_AQUATIC}) describes the role of veterinarians and aquatic animal-health professionals in health, welfare and disease controls. The [WOAH PVS Pathway]({WOAH_PVS}) addresses veterinary-service capability. FAO's [aquatic health-management work]({FAO_AQUATIC}) provides complementary context. The [AVMA complementary/alternative veterinary-medicine guidance]({AVMA_ALT_THERAPY}) is a US professional source and does not determine authorization elsewhere.",
                  "", "Conditional is not confirmed: animal manual therapies require diagnosis/referral and legal scope; aquaculture and food biotechnology fit only on the stated health/public-health assignment. This review does not establish local registration or student eligibility.",
                  f"", f"- Exact queue-key coverage: {c['reviewed_role_mappings']}/21; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- Every decision preserves local task evidence, rationale, sources, limitations and recommended action.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
