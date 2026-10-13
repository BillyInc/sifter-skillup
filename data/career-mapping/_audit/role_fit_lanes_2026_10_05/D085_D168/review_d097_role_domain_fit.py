"""Compile the manually assessed D097 role-to-parent-domain decisions.

The script is a deterministic queue join/validation and artifact builder. It
does not infer a decision from ISCO, subgroup, title similarity, or a keyword.
Each decision rule below was reviewed against the exact task text in the lane
queue and the D097 parent scope. No canonical files are read for writing.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
QUEUE_PATH = HERE / "D085_D168_role_fit_queue_2026_10_05.json"
JSON_OUT = HERE / "D097_role_domain_fit_review_2026_10_05.json"
MD_OUT = HERE / "D097_role_domain_fit_review_2026_10_05.md"

# Role-specific findings, not taxonomy-derived decisions. `supported` means
# the supplied task is within metal shaping/joining, metal-product manufacture,
# or craft metal repair expressly covered by D097. Conditional means the task
# profile is materially broader or leaves the metal-work connection unclear.
DECISIONS = {
    "blacksmith": ("supported", "Shapes and repairs metal in a forge; ornamental metalwork and horseshoe making are directly within the parent description."),
    "boilermaker": ("supported", "Cuts, forms, assembles, repipes, and retubes metal boiler and pressure-vessel components."),
    "brazier": ("supported", "Joins metal pieces by heating and flowing filler metal, a direct metal-joining process."),
    "casting mould maker": ("conditional", "Makes patterns for casting, but the profile permits metal, wood, or plastic models and does not establish that this role's work is specifically metal casting."),
    "chain making machine operator": ("supported", "Operates a production process that forms metal wire into metal chain products."),
    "computer numerical control machine operator": ("conditional", "Sets up and operates CNC equipment, but the stored role task does not identify the workpiece material; D097 fit cannot be inferred from the title."),
    "container equipment assembler": ("supported", "Builds boilers and pressure vessels by assembling metal components, piping, and fittings."),
    "coppersmith": ("supported", "Forms and repairs practical or artistic objects from copper and other non-ferrous metals."),
    "coquille casting worker": ("supported", "Controls molten ferrous/non-ferrous metal casting into permanent moulds to produce metal sections and products."),
    "dismantling worker": ("unsupported_for_domain", "The task is general dismantling of industrial equipment, machinery, or buildings; it does not establish metal fabrication, welding, or metal craft as the work performed."),
    "drill press operator": ("supported", "Drills or enlarges holes in fabricated metal workpieces using a drill press."),
    "drilling machine operator": ("supported", "Programs and operates drilling machines on metal workpieces and interprets their production instructions."),
    "drop forging hammer worker": ("supported", "Uses forging hammers and dies to reshape ferrous and non-ferrous metal workpieces."),
    "electron beam welder": ("supported", "Joins metal workpieces using electron-beam welding."),
    "farrier": ("supported", "The role makes and fits horseshoes; D097's own parent description explicitly names farriers among its craft-metal examples."),
    "fitter and turner": ("supported", "Machines and modifies metal parts to specification so they can be fitted into machinery assemblies."),
    "foundry moulder": ("supported", "Makes cores used in metal moulds for casting metal products."),
    "foundry operative": ("supported", "Operates foundry processes that pour ferrous/non-ferrous molten metal into moulds to produce castings."),
    "grinding machine operator": ("supported", "Grinds metal workpieces to remove material and achieve specified surfaces and dimensions."),
    "ground rigger": ("unsupported_for_domain", "The task is rigging temporary performance suspension structures; no metal fabrication or metal-product task is established."),
    "gunsmith": ("supported", "Modifies and repairs fabricated metal firearms using metalworking machines and hand tools."),
    "heat treatment furnace operator": ("conditional", "Treats castings in a furnace, a metal-manufacturing process, but the described task is heat treatment rather than the parent scope's stated shaping, joining, or metal craft work."),
    "hydraulic forging press worker": ("supported", "Uses compressive hydraulic forging to shape ferrous and non-ferrous metal workpieces."),
    "laser beam welder": ("supported", "Joins metal workpieces using laser-beam welding."),
    "laser cutting machine operator": ("supported", "Cuts excess material from metal workpieces using a controlled laser process."),
    "laser marking machine operator": ("supported", "Engraves or marks metal workpiece surfaces as a metal-product finishing process."),
    "lathe and turning machine operator": ("supported", "Turns metal workpieces to specification on machine tools."),
    "locksmith": ("unsupported_for_domain", "Installs and repairs locking/security systems and duplicates keys; the task is access security service, not the D097 metal fabrication/craft remit."),
    "mechanical forging press worker": ("supported", "Uses a mechanical press to forge ferrous and non-ferrous metal workpieces into shaped products."),
    "metal nibbling operator": ("supported", "Cuts detailed shapes from metal sheet using nibbling tools and machines."),
    "metal planer operator": ("supported", "Removes material from metal workpieces with a planer to produce specified linear surfaces."),
    "metal polisher": ("supported", "Finishes fabricated metal workpieces by polishing and buffing their surfaces."),
    "metal sawing machine operator": ("supported", "Cuts and trims metal stock/workpieces with sawing and shearing equipment."),
    "metalworking lathe operator": ("supported", "Turns metal stock on a lathe to produce components of a required shape and size."),
    "milling machine operator": ("supported", "Machines metal workpieces with a milling cutter to meet production specifications."),
    "moulding machine operator": ("conditional", "Operates mould-production machinery, but the task spans metal casting and non-metal moulded materials; the metal-specific share is not established."),
    "mouldmaker": ("supported", "Makes foundry moulds and cores for metal products using patterns and moulding materials."),
    "ornamental metal worker": ("supported", "Shapes and finishes fabricated ornamental metal components such as railings, stairs, and gates."),
    "oxy fuel burning machine operator": ("supported", "Cuts metal workpieces by controlled oxy-fuel heating and oxidation."),
    "pipe welder": ("supported", "Welds and installs pipeline parts and components; the task expressly concerns joining metal pipeline components."),
    "plasma cutting machine operator": ("supported", "Cuts metal workpieces with a plasma torch, a direct metal-fabrication process."),
    "precision mechanic": ("supported", "Manufactures and assembles precision metal components; additional measuring/control-component work does not displace the direct metal task."),
    "punch press operator": ("supported", "Forms or cuts workpieces with a press and die; the stored profile concerns metal fabrication production."),
    "rigger": ("unsupported_for_domain", "Lifts and positions heavy objects with cranes/derricks; the role task does not establish metal fabrication or welding work."),
    "rigging supervisor": ("unsupported_for_domain", "Supervises lifting/rigging crews and equipment; the task is not metal shaping, joining, or repair."),
    "riveter": ("supported", "Fastens metal components with rivets using hand tools or riveting machines."),
    "scrap metal operative": ("unsupported_for_domain", "Cuts scrap metal for smelting, a recycling/raw-material preparation task rather than the D097 scope of fabricating, joining, or repairing metal products."),
    "screw machine operator": ("supported", "Turns processed metal into threaded screws using a screw machine."),
    "sheet metal worker": ("supported", "Measures, cuts, bends, shapes, and installs sheet-metal products and structures."),
    "shipwright": ("conditional", "Builds and repairs vessels, but the stored task includes broad boatbuilding and does not establish that metal fabrication is the defining material/task."),
    "solderer": ("supported", "Joins metal items with a lower-melting filler using soldering processes."),
    "spot welder": ("supported", "Joins metal workpieces by resistance spot welding."),
    "stamping press operator": ("supported", "Forms metal workpieces with a die and stamping press."),
    "straightening machine operator": ("supported", "Straightens metal workpieces by applying controlled machine pressure."),
    "structural ironworker": ("supported", "Installs structural iron/steel frameworks and reinforcing bars in construction."),
    "swaging machine operator": ("supported", "Forms ferrous and non-ferrous metal workpieces by rotary swaging and compressive dies."),
    "thread rolling machine operator": ("supported", "Forms internal/external threads on metal blanks by pressing thread dies against the workpiece."),
    "tool and die maker": ("supported", "Designs, machines, fits, and finishes metal tools and dies used to cut, shape, and form products."),
    "tool grinder": ("supported", "Grinds, sharpens, and finishes metal tools and workpieces to specification."),
    "upsetting machine operator": ("supported", "Uses forging presses and dies to reshape metal wire, rods, or bars by compression."),
    "water jet cutter operator": ("supported", "Cuts excess material from metal workpieces with a high-pressure water/abrasive jet."),
    "welder": ("supported", "Joins metal workpieces with fusion-welding processes and inspects welds."),
    "welding coordinator": ("supported", "Coordinates and supervises welding applications and weld quality; this is directly within the parent welding remit."),
}

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": QUEUE_PATH.name,
        "locator": "Exact D097 role_description and esco_occupation_uris for each decision.",
        "supports": "The stated tasks used for comparison against the D097 parent scope.",
        "limit": "Cached/check-in task text is not a live refetch of the individual ESCO page; it does not independently establish licensing or job prevalence.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URI is retained on each decision; task text is the queue's checked-in ESCO description.",
        "supports": "The occupation task profile as represented in the source-backed local queue.",
        "limit": "Individual ESCO pages could not be live-refetched in this pass; ESCO occupation labels are not treated as proof of fit to Sifter's parent domains.",
    },
    "BLS_WELDING": {
        "publisher": "U.S. Bureau of Labor Statistics",
        "url": "https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm",
        "locator": "Duties: joining/cutting metal, welding, soldering and brazing; machine-operated processes are referred to the metal-machine profile.",
        "supports": "Metal joining/cutting task family for welding, soldering, brazing, and cutting roles.",
        "limit": "US occupational corroboration only; not a global classification or a claim that all listed roles share one occupation.",
    },
    "BLS_METAL_MACHINE": {
        "publisher": "U.S. Bureau of Labor Statistics",
        "url": "https://www.bls.gov/ooh/production/metal-and-plastic-machine-workers.htm",
        "locator": "Tasks include cutting, shaping, forming, casting, forging, milling, drilling, grinding, polishing, and heat treatment of metal/plastic workpieces.",
        "supports": "Manufacturing task families represented among metal machine operators and foundry/casting roles.",
        "limit": "US classification groups metal and plastic jobs; where the local role task does not specify material or spans non-metal work, it remains conditional.",
    },
    "BLS_MACHINISTS": {
        "publisher": "U.S. Bureau of Labor Statistics",
        "url": "https://www.bls.gov/ooh/production/machinists-and-tool-and-die-makers.htm",
        "locator": "Machining precision metal parts; tool/die production; lathe, milling, drilling, grinding, CNC and workpiece verification duties.",
        "supports": "Precision metal-machining and tooling tasks.",
        "limit": "US occupational corroboration only; not a global taxonomy.",
    },
    "BLS_BOILERMAKERS": {
        "publisher": "U.S. Bureau of Labor Statistics",
        "url": "https://www.bls.gov/ooh/construction-and-extraction/boilermakers.htm",
        "locator": "Boilermaker summary: assemble, install, maintain, and repair boilers, closed vats, and large vessels/containers.",
        "supports": "Boiler and pressure-vessel construction/repair tasks.",
        "limit": "US occupational corroboration only.",
    },
    "BLS_SHEET_IRON": {
        "publisher": "U.S. Bureau of Labor Statistics",
        "url": "https://www.bls.gov/ooh/construction-and-extraction/structural-iron-and-steel-workers.htm",
        "locator": "Structural iron/steel workers install structural frameworks and reinforcing iron/steel in construction.",
        "supports": "Structural metal installation work.",
        "limit": "US occupational corroboration only; sheet-metal task corroboration is also included in the BLS metal-machine and production sources.",
    },
    "OSHA_DEMOLITION": {
        "publisher": "U.S. Occupational Safety and Health Administration",
        "url": "https://www.osha.gov/demolition",
        "locator": "Demolition is defined as dismantling, razing, destroying, or wrecking a building/structure; hazards and planning are described separately from fabrication.",
        "supports": "Boundary distinction for generic dismantling work.",
        "limit": "US workplace safety source; it does not classify occupations globally.",
    },
    "OSHA_RIGGING": {
        "publisher": "U.S. Occupational Safety and Health Administration",
        "url": "https://www.osha.gov/etools/shipyard/shipbreaking/material-handling",
        "locator": "Rigging equipment connects loads to lifting machinery; guidance concerns material handling/load safety.",
        "supports": "Boundary distinction between general lifting/rigging and metal fabrication work.",
        "limit": "US shipyard safety guidance; not occupational taxonomy.",
    },
    "IAPF_FARRIER": {
        "publisher": "International Association of Professional Farriers",
        "url": "https://professionalfarriers.com/frequently_asked_questions.php",
        "locator": "Definition covers equine hoof management/trimming/shoeing and fabrication or alteration of horseshoes.",
        "supports": "Farrier task includes making/adapting horseshoes, consistent with the D097 parent scope's explicit farrier example.",
        "limit": "Professional association source; supports farrier task context, not a universal licensing requirement.",
    },
}


def main() -> None:
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    rows = [r for r in queue["unresolved_rows"] if r["domain_id"] == "D097"]
    expected = {r["role_name"] for r in rows}
    if len(rows) != 63 or expected != set(DECISIONS):
        missing = sorted(expected - set(DECISIONS))
        extra = sorted(set(DECISIONS) - expected)
        raise SystemExit(f"D097 queue mismatch: rows={len(rows)} missing={missing} extra={extra}")

    all_keys = [r["role_key"] for r in rows]
    if len(all_keys) != len(set(all_keys)):
        raise SystemExit("Duplicate exact role_key in D097 queue")

    decisions = []
    for row in rows:
        status, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE"]
        role = row["role_name"]
        if status == "unsupported_for_domain" and role == "dismantling worker":
            refs.append("OSHA_DEMOLITION")
        elif status == "unsupported_for_domain" and role in {"ground rigger", "rigger", "rigging supervisor"}:
            refs.append("OSHA_RIGGING")
        elif role == "farrier":
            refs.append("IAPF_FARRIER")
        elif role in {"boilermaker", "container equipment assembler"}:
            refs.append("BLS_BOILERMAKERS")
        elif role in {"computer numerical control machine operator", "fitter and turner", "precision mechanic", "tool and die maker"}:
            refs.append("BLS_MACHINISTS")
        elif "welder" in role or role in {"brazier", "solderer"}:
            refs.append("BLS_WELDING")
        elif role in {"structural ironworker", "sheet metal worker"}:
            refs.append("BLS_SHEET_IRON")
        elif role == "heat treatment furnace operator":
            refs.append("BLS_METAL_MACHINE")
        elif status == "conditional" or "machine operator" in role or role in {
            "blacksmith", "coppersmith", "coquille casting worker", "foundry moulder",
            "foundry operative", "grinding machine operator", "hydraulic forging press worker",
            "laser cutting machine operator", "laser marking machine operator",
            "metal nibbling operator", "metal planer operator", "metal polisher",
            "metal sawing machine operator", "metalworking lathe operator", "milling machine operator",
            "mouldmaker", "ornamental metal worker", "oxy fuel burning machine operator",
            "plasma cutting machine operator", "punch press operator", "riveter",
            "scrap metal operative", "screw machine operator", "stamping press operator",
            "straightening machine operator", "swaging machine operator", "thread rolling machine operator",
            "tool grinder", "upsetting machine operator", "water jet cutter operator",
        }:
            refs.append("BLS_METAL_MACHINE")

        decisions.append({
            "role_key": row["role_key"],
            "role_name": role,
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": status,
            "rationale": rationale,
            "source_refs": list(dict.fromkeys(refs)),
        })

    counts = Counter(d["domain_fit"] for d in decisions)
    unsupported = counts.pop("unsupported_for_domain", 0)
    result = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": "2026-10-05",
        "domain_id": "D097",
        "domain_name": rows[0]["domain_name"],
        "scope": "Role-task fit against the parent domain only; no subgroup or specialization fit.",
        "method": "Compared each exact queued role task with the D097 scope: metal shaping, joining, fabrication, and metal craft repair in workshops, factories, and construction. ISCO/subgroup, title similarity, and canonical placement were not used as fit evidence. Broad tasks without an established metal task were conditional or unsupported.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": counts["supported"],
            "conditional": counts["conditional"],
            "unsupported_for_domain": unsupported,
            "unresolved": counts["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "notes": [
            "All D097 queue role keys are represented once and only once.",
            "Unsupported/conditional dispositions are audit findings only; no canonical link or student visibility changed.",
            "The ESCO URI is retained per role; live retrieval of individual ESCO pages was unavailable in this pass, so the checked-in queue task text is explicitly identified as the inspected task evidence.",
            "BLS and OSHA sources are US-specific corroboration; they are not presented as global occupational taxonomies.",
            "No subgroup or specialization fit was assessed; no canonical mappings were changed.",
        ],
    }
    JSON_OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D097 role-to-parent-domain fit review",
        "",
        "Audit date: 2026-10-05  ",
        "Scope: compare role tasks only with **Welding, Fabrication and Blacksmithing**. No subgroup or specialization fit is assessed; canonical mappings are not changed.",
        "",
        "## Result",
        "",
        f"Reviewed **{len(decisions)}/{len(rows)}** exact queued mappings: **{counts['supported']} supported, {counts['conditional']} conditional, {unsupported} unsupported, {counts['unresolved']} unresolved**.",
        "",
        "Conditional roles are casting mould maker, CNC machine operator, heat-treatment furnace operator, moulding-machine operator, and shipwright only if applicable. (See the decision table for the full role-specific rationale.)",
        "",
        "Unsupported roles are general dismantling worker, performance ground rigger, locksmith, general rigger, rigging supervisor, and scrap-metal operative. Their task descriptions do not establish the D097 metal-fabrication/craft remit.",
        "",
        "## Decision ledger",
        "",
        "| Role | Decision | Task-level reason |",
        "|---|---|---|",
    ]
    for d in decisions:
        lines.append(f"| {d['role_name']} | {d['domain_fit']} | {d['rationale']} |")
    lines += [
        "",
        "## Sources and limits",
        "",
        "- The exact checked-in task description and ESCO URI are preserved on every decision in the JSON ledger. Individual ESCO profile pages could not be independently live-refetched during this pass; this limitation is not hidden.",
        "- The U.S. BLS distinguishes metal joining/cutting roles, machine operators, precision machinists/tool-and-die makers, and boilermaker work. These are corroborating task-family references, not a global taxonomy.",
        "- OSHA defines demolition as dismantling/razing structures and treats rigging as load-handling safety work, supporting exclusion of generic demolition/rigging tasks when no metal-fabrication task is given.",
        "- The International Association of Professional Farriers describes horseshoe fabrication/adaptation, corroborating the direct D097 parent example for farriers.",
        "",
        "No canonical role-domain rows, student visibility, subgroup, or specialization data were changed.",
        "",
        f"Machine-readable exact-key ledger: `{JSON_OUT.name}`.",
    ]
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"domain_id": "D097", "reviewed": len(decisions), "counts": result["counts"], "json": str(JSON_OUT), "markdown": str(MD_OUT)}, indent=2))


if __name__ == "__main__":
    main()
