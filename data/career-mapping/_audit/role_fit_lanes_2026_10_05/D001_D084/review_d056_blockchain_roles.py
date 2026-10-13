"""Build the exact-key D056 Blockchain and Decentralised Systems role review."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D045_D084_parent_domain_review_worklist.json"
OUT_JSON=HERE/"D056_role_domain_fit_review_2026_10_05.json"
OUT_MD=HERE/"D056_role_domain_fit_review_2026_10_05.md"
NIST="https://csrc.nist.gov/pubs/ir/8202/final"

CONDITIONS={
"artificial intelligence engineer":"Include only when the assigned work develops or deploys AI components specifically for a blockchain/DLT system; the stored task profile describes general AI engineering.",
"chief ICT security officer":"Include only when the security remit explicitly covers blockchain nodes, consensus, wallets, smart contracts, or DLT infrastructure; current duties cover the organisation's information systems generally.",
"computer scientist":"Include only when research or system design is specifically about distributed ledgers, consensus, cryptography, or smart contracts; the current role profile is general computer-science research.",
"cybersecurity risk manager":"Include only when the assessed ICT infrastructure is a blockchain/DLT system; the current task description is system-neutral cybersecurity risk management.",
"data analyst":"Include only for blockchain transaction/ledger analytics or other explicit DLT data work; current tasks cover business data generally.",
"data engineer":"Include only when the pipeline, warehouse, or data architecture specifically serves a blockchain/DLT application; current tasks are generic data infrastructure.",
"data scientist":"Include only when the data/model work is explicitly on-chain or supports a DLT system; current tasks cover broad data science.",
"enterprise architect":"Include only if the enterprise architecture assignment explicitly designs or governs a blockchain/DLT solution; current duties cover all organisational ICT assets.",
"ethical hacker":"Include only where the authorized assessment targets blockchain protocols, nodes, wallets, or smart contracts; the current definition covers systems generally.",
"ICT business analysis manager":"Include only when the business/system change being analysed is an evidenced blockchain/DLT initiative; current tasks do not specify that technology.",
"ICT business analyst":"Include only for requirements analysis of a defined blockchain/DLT product or process; current tasks describe generic organisational systems.",
"ICT consultant":"Include only when the consultancy remit evaluates or implements a blockchain/DLT solution; the current profile is technology-neutral.",
"ICT research consultant":"Include only when the research question is specifically about blockchain/DLT; the current role describes general ICT research methods.",
"ICT security administrator":"Include only when administering security controls for blockchain nodes, wallets, contracts, or DLT infrastructure; current duties cover information systems generally.",
"ICT system analyst":"Include only when the analysed system is a blockchain/DLT application; current tasks are general systems analysis.",
"ICT system architect":"Include only when the designed multi-component system is explicitly decentralized or blockchain-based; the current profile describes general ICT architecture.",
"ICT system developer":"Include only when the support system being maintained or developed is blockchain/DLT-based; current tasks cover organisational systems generally.",
"ICT system integration consultant":"Include only when integrating a DLT component or blockchain network with other systems; current tasks describe generic enterprise interoperability.",
"integration engineer":"Include only when the integration solution connects blockchain/DLT components or services; current tasks are enterprise application integration generally.",
"IT auditor":"Include only when the audit scope explicitly includes DLT controls, ledger integrity, consensus, or smart-contract processes; current duties cover IT systems generally.",
"software analyst":"Include only when requirements/specifications concern a blockchain platform, protocol, or smart-contract application; current tasks cover software generally.",
"software architect":"Include only when the designed software architecture is for a blockchain/DLT system; current tasks are technology-neutral software architecture.",
"software developer":"Include only when the implementation is blockchain/DLT software (for example, a ledger client or smart contract); current tasks cover software systems generally.",
}

def source_urls(refs):
    out=[]
    for ref in refs:
        source,value=ref.split(":",1); url=value.split("@",1)[0]
        if source=="ONET" and not url.startswith(("http://","https://")):
            url=f"https://www.onetonline.org/link/summary/{url}"
        out.append(url)
    return list(dict.fromkeys(out))

def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows=[r for r in q["role_mappings"] if r["domain_id"]=="D056"]
    by_name={r["role_name"]:r for r in rows}
    if len(rows)!=25 or len(by_name)!=25 or set(by_name)!=(set(CONDITIONS)|{"blockchain architect","blockchain developer"}):
        raise SystemExit(f"D056 exact queue changed; got {len(rows)} rows and keys {sorted(by_name)}")
    decisions=[]
    for name,row in sorted(by_name.items()):
        direct=name in {"blockchain architect","blockchain developer"}
        task=row["role_task_text"]
        if direct:
            status="supported"
            basis=("The occupation task itself explicitly designs blockchain-based decentralized systems." if name=="blockchain architect" else "The occupation task itself explicitly implements blockchain-based software and uses blockchain platforms.")
            condition=None
        else:
            status="conditional"
            condition=CONDITIONS[name]
            basis=f"The stored task describes a general ICT/AI/data/security/software function, not a blockchain-specific task. {condition}"
        refs=source_urls(row["task_source_refs"])+[NIST]
        decisions.append({"role_key":row["role_key"],"role_name":name,"domain_fit_status":status,
            "task_evidence":task,"basis":basis,"conditional_scope":condition,
            "source_refs":refs,
            "source_limit":"ESCO is the exact mapped occupation task record; O*NET is US task corroboration where linked. NIST IR 8202 defines the technology boundary (distributed ledger, cryptographic linkage, validation/consensus); it is not occupational evidence. A conditional result is not a confirmed student role path and does not establish job demand or credentials." ,
            "recommended_action":"retain_as_confirmed_D056_role" if direct else "do_not_show_as_confirmed_D056_role_without_blockchain_specific_assignment_evidence"})
    counts=Counter(d["domain_fit_status"] for d in decisions)
    payload={"schema_version":1,"domain_id":"D056","domain_name":"Blockchain and Decentralised Systems",
        "scope":"D056 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope":rows[0]["parent_domain_scope"],
        "method":"Reviewed all 25 exact D056 keys from the regenerated lane queue. Checked each role's own ESCO task definition and linked O*NET task references against the stored D056 scope. NIST IR 8202 was used only to define the technology boundary. ISCO/subgroup, title similarity, and frequency were not fit evidence.",
        "scope_sources":[NIST],
        "source_limit_policy":"NIST IR 8202 establishes what blockchain/DLT means technically, not which occupations belong to the domain. ESCO/O*NET describe the mapped occupation tasks but generic ICT tasks are not assumed to be blockchain work. Conditional links are withheld from confirmed student paths until the specific DLT assignment is evidenced.",
        "counts":{"reviewed_role_mappings":25,**{s:counts.get(s,0) for s in ("supported","conditional","unsupported","unresolved")}},
        "decisions":decisions,"canonical_changes":0,"canonical_correction_ready":False,
        "correction_note":"Only the two blockchain-specific task profiles are confirmed. The 23 generic ICT/AI/data/security/software mappings require domain-specific assignment evidence and must not appear as confirmed D056 paths; do not delete or remap canonical records until cross-lane reconciliation."}
    OUT_JSON.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=["# D056 — Blockchain and Decentralised Systems: role-to-parent fit","",
      "**Slice:** 25/25 exact mappings reviewed against role tasks and the parent scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.","",
      "| Disposition | Count |","|---|---:|",f"| Supported | {counts['supported']} |",f"| Conditional | {counts['conditional']} |","",
      "Only blockchain architect and blockchain developer have tasks that explicitly name blockchain/DLT. The other 23 profiles describe cross-domain ICT, AI, data, security, analysis, or software work; they are conditional on an actual blockchain-specific assignment and are not confirmed student paths by default.","",
      "## Exact decisions","","| Role | Result | Task evidence and decision |","|---|---|---|"]
    lines += [f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" for d in decisions]
    lines += ["","## Evidence boundary","",f"[NIST IR 8202](https://csrc.nist.gov/pubs/ir/8202/final) describes blockchain as a distributed, tamper-evident/tamper-resistant ledger and discusses cryptographic links, validation, and consensus. It is used only to define the technology boundary. Each role's exact ESCO task text, source locators, and limits are retained in the JSON report. Generic IT work is not treated as blockchain work just because the same skills could be used on a blockchain project.","","Conditional mappings should not be rendered as confirmed domain roles or student requirements without evidence that the role assignment actually concerns blockchain/DLT. No alternative domain or canonical correction is inferred.","","## Validation","","- Exact queue-key coverage: 25/25; 2 supported and 23 conditional.","- Each row includes exact task text, rationale/condition, source locators, and limitations.","- No canonical data changed."]
    OUT_MD.write_text("\n".join(lines)+"\n",encoding="utf-8")
    print(json.dumps(payload["counts"],sort_keys=True))

if __name__=="__main__":main()
