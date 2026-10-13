"""Build the evidence-backed D055 Chemical Engineering role/domain review."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D055_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D055_role_domain_fit_review_2026_10_05.md"
ROLES = {"biochemical engineer", "cosmetics production machine operator", "textile chemist"}
ICHEME = "https://www.icheme.org/about-us/what-is-chemical-engineering/"

def main():
    queue=json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows=[r for r in queue["role_mappings"] if r["domain_id"]=="D055"]
    if len(rows)!=3 or {r["role_name"] for r in rows}!=ROLES:
        raise SystemExit("D055 exact role queue changed; re-review keys")
    decisions=[]
    for r in sorted(rows,key=lambda x:x["role_name"]):
        n=r["role_name"]
        if n=="biochemical engineer":
            evidence="Develops life-science findings into chemical solutions such as vaccines, tissue repair, crop improvement, and cleaner fuels."
            basis="Biochemical engineering is explicitly a branch of chemical engineering; the role develops biologically informed products and processes, matching the parent scope's medicines, chemicals, and industrial products."
        elif n=="cosmetics production machine operator":
            evidence="Sets up, operates, cleans, and maintains machinery used to manufacture cosmetic products."
            basis="This is direct process-equipment operation in manufacturing consumer chemical products; the stored parent scope expressly covers operators and everyday products."
        else:
            evidence="Coordinates and supervises chemical processes such as textile dyeing and finishing."
            basis="The role applies and supervises chemical transformation processes in fiber/fabric manufacture, consistent with chemical/process engineering's transformation of raw materials into useful products. The textile end-use does not make the process non-chemical."
        refs=[]
        for ref in r["task_source_refs"]:
            source,value=ref.split(":",1); locator=value.split("@",1)[0]
            if source=="ONET" and not locator.startswith(("http://","https://")):
                locator=f"https://www.onetonline.org/link/summary/{locator}"
            refs.append(locator)
        refs.append(ICHEME)
        decisions.append({"role_key":r["role_key"],"role_name":n,"domain_fit_status":"supported",
            "task_evidence":evidence,"basis":basis,"source_refs":list(dict.fromkeys(refs)),
            "source_limit":"IChemE provides an international professional-body scope for chemical and biochemical engineering; ESCO supplies the exact occupation task record and O*NET is US task corroboration where present. These sources establish domain fit, not local licensing or demand."})
    payload={"schema_version":1,"domain_id":"D055","domain_name":"Chemical Engineering",
        "scope":"D055 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope":rows[0]["parent_domain_scope"],
        "method":"Reviewed all exact D055 keys using the checked-in role task text and linked sources; tested task fit against the parent scope and IChemE's international definition emphasizing transformation of raw materials into useful products and biochemical/process engineering. No ISCO/subgroup, title, or frequency inference.",
        "scope_sources":[ICHEME,"https://www.icheme.org/education-career/discoverchemeng/young-people/chemical-engineering-frequently-asked-questions/"],
        "source_limit_policy":"IChemE describes global professional scope but does not set every jurisdiction's licensure rules. ESCO/O*NET task records identify the occupations and task contexts; alternative-domain placement is not inferred.",
        "counts":{"reviewed_role_mappings":3,"supported":3,"conditional":0,"unsupported":0,"unresolved":0},
        "decisions":decisions,"canonical_changes":0,"canonical_correction_ready":False,
        "correction_note":"No D055 role-domain correction identified in these three exact mappings; no shared canonical edit made."}
    OUT_JSON.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=["# D055 — Chemical Engineering: role-to-parent fit","",
      "**Slice:** 3/3 exact D055 mappings reviewed; 3 supported, no conditional/unsupported/unresolved. No subgroup or role-to-specialization decisions; canonical mapping unchanged.","",
      "| Role | Task-based fit |","|---|---|"]
    lines += [f"| {d['role_name']} | {d['basis']} |" for d in decisions]
    lines += ["","## Evidence boundary","",f"The [IChemE chemical-engineering overview]({ICHEME}) describes chemical engineering as transformation of raw materials into useful everyday products and expressly includes chemical, biochemical, and process engineers. Exact occupation tasks and source locators are retained per role in the JSON report. This review supports parent-domain fit, not local licensing or labour demand.","","## Validation","","- Exact queue coverage: 3/3.","- All records carry exact-key task evidence, rationale, source locators, and limitations.","- No canonical taxonomy data changed."]
    OUT_MD.write_text("\n".join(lines)+"\n",encoding="utf-8")
    print(json.dumps(payload["counts"],sort_keys=True))

if __name__=="__main__": main()
