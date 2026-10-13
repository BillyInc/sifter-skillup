#!/usr/bin/env python3
"""Review and guardedly repair the 70 D085 role paths from exact ESCO tasks."""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[5]
LANE_DIR = Path(__file__).resolve().parent
QUEUE = LANE_DIR / "D085_D168_role_fit_queue_2026_10_05.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
ESCO = ROOT / "data/career-mapping/taxonomies/esco_occupations.json"

EUROSTAT_NACE = "https://ec.europa.eu/eurostat/documents/3859598/21633320/KS-GQ-24-007-EN-N.pdf"
UNSD_ISIC = "https://unstats.un.org/unsd/classifications/Econ/Structure/Detail/EN/2095/G"
CONDITIONAL = {
    "sales processor": "The exact task profile covers orders, delivery channels and client dispatch communications, but does not establish that the sales context is retail/final-consumer rather than wholesale or business-to-business. Keep the parent path conditional until that context is specified.",
    "street food vendor": "The profile combines direct point-of-sale activity with preparing food at the stall. The direct-sales task fits D085, but food preparation is a substantive second task outside a narrow resale/retail boundary; show only as a conditional cross-context path, not as a confirmed pure retail role.",
    "ticket issuing clerk": "The profile sells event tickets and fits customer-facing service sales, but the source does not establish a retail-shop context; ticketing/reservation sales should remain a conditional adjacent branch rather than a confirmed merchandise-retail path.",
}
UNSUPPORTED = {
    "lottery cashier": "The profile's defining tasks are selling lottery entries, paying gambling prizes, collecting player identification and enforcing anti-money-laundering controls. That is lottery/gaming operation, not general retail sales or shop operation. Exclude only the D085 student path; preserve the occupation and its other destinations, if any.",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def candidate_specialization(name: str, task: str) -> tuple[str, str]:
    n, t = name.casefold(), task.casefold()
    if "lottery cashier" in n:
        return "none", "unsupported"
    if "rental" in n or "leasing" in n or "vehicle rental" in n:
        return "Rental and Leasing Operations", "supported"
    if "specialised shop" in t or "specialised shops" in t or "specialized shop" in t:
        return "Product-Specialty Retail Sales", "supported"
    if any(x in n for x in ("cashier", "checkout", "shop assistant", "shop supervisor", "retail entrepreneur")):
        return "Store and Checkout Operations", "supported"
    if n in CONDITIONAL:
        return {
            "sales processor": "Sales Processing and Order Support",
            "street food vendor": "Food Vending and Point-of-Sale Preparation",
            "ticket issuing clerk": "Ticketing and Reservation Sales",
        }[n], "conditional"
    if any(x in n for x in ("call centre", "door to door", "market vendor", "personal shopper", "promotions demonstrator")):
        return "Direct and Non-Store Customer Sales", "supported"
    if n in {"sales assistant", "motor vehicles parts advisor", "motor vehicles specialised seller"}:
        return "Customer-Facing Product Sales", "supported"
    return "Product-Specialty Retail Sales", "supported"


def compile_review() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    queue = read_json(QUEUE)
    esco = read_json(ESCO)
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D085"]
    if len(rows) != 70 or len({row["role_key"] for row in rows}) != 70:
        raise RuntimeError(f"Expected 70 distinct unresolved D085 mappings, found {len(rows)}")
    decisions = []
    for row in sorted(rows, key=lambda r: r["role_key"]):
        uris = row.get("esco_occupation_uris") or []
        if len(uris) != 1 or uris[0] not in esco:
            raise RuntimeError(f"D085 row lacks one exact local ESCO URI join: {row['role_key']}")
        profile = esco[uris[0]]
        task = profile.get("definition") or ""
        if (profile.get("label") or "").casefold() != row["role_name"].casefold():
            raise RuntimeError(f"Exact ESCO label mismatch; hold rather than infer: {row['role_key']}")
        if row["role_name"] in UNSUPPORTED:
            status, basis = "not_supported", UNSUPPORTED[row["role_name"]]
        elif row["role_name"] in CONDITIONAL:
            status, basis = "conditional", CONDITIONAL[row["role_name"]]
        else:
            status = "supported"
            basis = f"The exact ESCO occupation task profile states: {task} This directly matches D085's checked-in scope of customer-facing retail selling or shop/rental operations."
        spec, spec_status = candidate_specialization(row["role_name"], task)
        refs = [
            {"url": uris[0], "authority": "European Commission ESCO", "locator": "Exact occupation URI; profile label, code and definition", "supports": task, "limitation": "ESCO describes occupation tasks; it does not itself decide fit to Sifter's parent domain or specialization."},
            {"url": EUROSTAT_NACE, "authority": "Eurostat / NACE Rev. 2.1", "locator": "Section G explanatory note, retailing scope", "supports": "Retailing is final-step resale to consumers across shops, stalls, mail order and door-to-door channels; distinguishes merchandise retail from other activities.", "limitation": "European economic-activity classification, not a global occupation taxonomy. Used as boundary corroboration, not as a rule that overrides D085's explicit broader customer-service/rental scope."},
            {"url": UNSD_ISIC, "authority": "United Nations Statistics Division / ISIC Rev. 5", "locator": "Section G explanatory note", "supports": "Global classification describes wholesale/retail as final merchandise distribution and retail sale to final consumers across channels.", "limitation": "Industry classification, not a role-fit decision; service-sales and mixed-task occupations can cross the category boundary."},
        ]
        decisions.append({
            "role_key": row["role_key"], "domain_id": "D085", "role_name": row["role_name"],
            "esco_uri": uris[0], "esco_label": profile.get("label"), "esco_code": profile.get("code"),
            "task_evidence": task, "domain_fit_status": status, "basis": basis,
            "candidate_specialization": spec, "specialization_fit_status": spec_status,
            "specialization_is_provisional_not_canonical": True,
            "student_path_status_recommendation": "excluded" if status == "not_supported" else ("review_required" if status == "conditional" else "active"),
            "source_refs": refs,
        })
    tally = Counter(d["domain_fit_status"] for d in decisions)
    summary = {
        "title": "D085 Retail Sales and Shop Operations role-fit review",
        "date": "2026-10-05",
        "scope": "All 70 D085 role-to-domain mappings in the refreshed unresolved lane; no other domain changed.",
        "method": "Exact linked ESCO URI-to-local-profile join, task-text versus D085 scope comparison, and global retail-boundary corroboration. No ISCO/subgroup/frequency/title similarity used as fit evidence.",
        "counts": {"mappings": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["not_supported"], "unresolved": tally["unresolved"]},
        "domain_scope_boundary_finding": "D085 explicitly includes customer-facing services and rental/leasing operations, broader than the merchandise-retail boundary in NACE/ISIC. The international classifications are cited as boundary evidence, not used to silently narrow the checked-in Sifter scope.",
        "specialization_caution": "Candidate practice-area buckets are analytical proposals only. D085's specialization set has not been source-reviewed or canonically implemented; subgroup membership is not changed by this audit.",
        "canonical_changes_proposed": [
            {"role_key": "D085|lottery cashier", "change": "exclude only this D085 path from student output", "reason": UNSUPPORTED["lottery cashier"]},
            {"role_key": "D085|rental service representative in personal and household goods", "change": "restore the truncated role description from the exact linked ESCO profile definition", "guard": "only if canonical description exactly equals the current inventory truncation and the exact URI is unchanged"},
        ],
        "academic_signoff": "not obtained; this is an evidence-backed lane decision, not external academic endorsement.",
    }
    return summary, decisions


def write_report(summary: dict[str, Any], decisions: list[dict[str, Any]]) -> None:
    LANE_DIR.mkdir(parents=True, exist_ok=True)
    (LANE_DIR / "D085_role_fit_decisions_2026_10_05.json").write_text(json.dumps({"summary": summary, "decisions": decisions}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D085 role-to-domain review", "", f"Scope: **{summary['scope']}**", "", f"Method: {summary['method']}", "", f"Disposition totals: **{summary['counts']}**", "", f"Boundary: {summary['domain_scope_boundary_finding']}", "", "The exact ESCO URI on each row below joins to the checked-in ESCO profile cache. ESCO task text supports role-task interpretation; Eurostat/UNSD add sector-boundary context only. Each source's specific support and limitations are recorded in the JSON ledger.", "", "| Role | Parent fit | Candidate specialization (provisional) | Task-based reason | Exact ESCO profile |", "|---|---|---|---|---|"]
    for d in decisions:
        reason = d["basis"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {d['role_name']} | {d['domain_fit_status']} | {d['candidate_specialization']} ({d['specialization_fit_status']}; provisional) | {reason} | [{d['esco_code']}]({d['esco_uri']}) |")
    lines.extend(["", f"**Specialization limitation:** {summary['specialization_caution']}", "", "## Guarded canonical changes", "", "Only two narrow edits are justified from this D085 pass: exclude the lottery-cashier path from D085 student output (occupation retained), and restore one exact-source-truncated description. No other canonical roles, subgroup assignments or shared inventories are changed.", ""])
    (LANE_DIR / "D085_role_fit_review_2026_10_05.md").write_text("\n".join(lines), encoding="utf-8")


def apply_guarded(summary: dict[str, Any], decisions: list[dict[str, Any]]) -> list[str]:
    raw = ROLE_LIBRARY.read_text(encoding="utf-8")
    roles = json.loads(raw)
    lane_roles = [row for row in roles if row.get("domain_id") == "D085"]
    by_key = {f"{row.get('domain_id')}|{row.get('role_name')}": row for row in lane_roles}
    if len(lane_roles) != 70 or len(by_key) != 70:
        raise RuntimeError("Canonical D085 role set changed; guarded apply stopped")
    if set(by_key) != {d["role_key"] for d in decisions}:
        raise RuntimeError("Canonical D085 role keys do not exactly match reviewed lane keys")
    changed = []
    replacements: list[tuple[int, int, str, str]] = []
    for decision in decisions:
        row = by_key[decision["role_key"]]
        prior_status = row.get("domain_fit_review_status")
        if prior_status not in (None, "", decision["domain_fit_status"]):
            raise RuntimeError(f"Refusing to overwrite pre-existing fit status for {decision['role_key']}: {prior_status}")
        additions = {
            "domain_fit_review_status": decision["domain_fit_status"],
            "domain_fit_review_basis": decision["basis"],
            "domain_fit_review_source_refs": [ref["url"] for ref in decision["source_refs"]],
        }
        if decision["domain_fit_status"] == "not_supported":
            prior_path = row.get("student_path_status")
            if prior_path not in (None, "", "excluded"):
                raise RuntimeError(f"Refusing to overwrite existing student path state for {decision['role_key']}: {prior_path}")
            additions["student_path_status"] = "excluded"
            additions["student_path_exclusion_reason"] = decision["basis"]
        elif decision["domain_fit_status"] == "conditional":
            prior_path = row.get("student_path_status")
            if prior_path not in (None, "", "review_required"):
                raise RuntimeError(f"Refusing to overwrite existing student path state for {decision['role_key']}: {prior_path}")
            additions["student_path_status"] = "review_required"
        if decision["role_key"] == "D085|rental service representative in personal and household goods":
            old = row.get("description") or ""
            expected_prefix = "Rental service representatives in personal and household goods are in charge of renting out equipment and determining specific periods of usage. Personal and household goods are all goods use within households"
            profile = read_json(ESCO)[decision["esco_uri"]]
            if not old.startswith(expected_prefix) or len(old) >= len(profile["definition"]):
                raise RuntimeError("Description no longer matches the reviewed truncation; refusing repair")
            additions["description"] = profile["definition"]

        # Patch only this exact JSON object, retaining every other byte in the
        # large, already-dirty role library (a whole-file json.dump would
        # reformat and alter unrelated records).
        pattern = re.compile(
            r'(?ms)^ \{\n(?:(?!^ \{\n).)*?^  "domain_id": "D085",\n(?:(?!^ \{\n).)*?^  "role_name": '
            + re.escape(json.dumps(decision["role_name"], ensure_ascii=False))
            + r",\n(?:(?!^ \{\n).)*?^ \},?$")
        matches = list(pattern.finditer(raw))
        if len(matches) != 1:
            raise RuntimeError(f"Expected one exact D085 text record for {decision['role_key']}, found {len(matches)}")
        match = matches[0]
        fragment = match.group(0)
        if any(re.search(rf'^  "{re.escape(key)}":', fragment, re.MULTILINE) for key in additions if key != "description"):
            raise RuntimeError(f"Reviewed metadata already exists in canonical record {decision['role_key']}; refusing overwrite")
        closing = re.search(r"(?m)^ \}(,?)$", fragment)
        if closing is None:
            raise RuntimeError(f"Could not locate JSON object boundary for {decision['role_key']}")
        extra = "".join(f"\n  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}" for key, value in additions.items() if key != "description")
        if "description" in additions:
            old_line = next((line for line in fragment.splitlines() if line.startswith('  "description": ')), None)
            if old_line is None:
                raise RuntimeError(f"Description field missing for {decision['role_key']}")
            new_line = f'  "description": {json.dumps(additions["description"], ensure_ascii=False)}'
            fragment = fragment.replace(old_line, new_line, 1)
        insertion_at = closing.start()
        before = fragment[:insertion_at].rstrip()
        if before.endswith(","):
            before = before[:-1]
        patched = before + "," + extra + "\n " + closing.group(1)
        replacements.append((match.start(), match.end(), patched, decision["role_key"]))
        changed.append(decision["role_key"])

    for start, end, patched, _ in sorted(replacements, reverse=True):
        raw = raw[:start] + patched + raw[end:]
    # Validate the surgical output before persisting.
    check = json.loads(raw)
    check_by_key = {f'{row.get("domain_id")}|{row.get("role_name")}': row for row in check if row.get("domain_id") == "D085"}
    if len(check_by_key) != 70:
        raise RuntimeError("Post-patch D085 canonical key count changed")
    ROLE_LIBRARY.write_text(raw, encoding="utf-8", newline="")
    for decision in decisions:
        row = check_by_key[decision["role_key"]]
        assert row["domain_fit_review_status"] == decision["domain_fit_status"]
        if decision["domain_fit_status"] == "not_supported":
            assert row.get("student_path_status") == "excluded"
        if decision["domain_fit_status"] == "conditional":
            assert row.get("student_path_status") == "review_required"
    return changed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply only the guarded D085 role-source changes")
    args = parser.parse_args()
    summary, decisions = compile_review()
    write_report(summary, decisions)
    changed = apply_guarded(summary, decisions) if args.apply else []
    print(json.dumps({"counts": summary["counts"], "report": str(LANE_DIR / "D085_role_fit_review_2026_10_05.md"), "decisions": str(LANE_DIR / "D085_role_fit_decisions_2026_10_05.json"), "canonical_apply": args.apply, "changed_role_keys": changed}, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
