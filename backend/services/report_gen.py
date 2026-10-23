"""
report_gen — server-side career report + login card generation.

Assembles a per-student career report from ALREADY-REAL taxonomy (chosen
direction → domain → foundation skills → roles → programme → admission
context). It deliberately OMITS demand/salary/postings numbers, which are still
zeroed/coming_soon — every line on the page is honest today; the market layer
slots in later as enrichment.

Two artifacts, no third-party dependency (uses only the stdlib):
  - build_report_docx(...)  -> .docx bytes  (editable; WhatsApp/email friendly)
  - build_report_html(...)  -> HTML string  (print-to-PDF in any browser)
  - build_login_card_html(...) -> HTML string for the detachable claim card
    (the CREDENTIAL is kept on its own card, never in the report body).

PRIVACY: takes only the student's name/class, the chosen direction, and the
taxonomy it resolves to — never grades or source documents.
"""
import html
import io
import json
import zipfile
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote
from typing import List, Optional

from pydantic import BaseModel, Field


def _clean_report_text(value: object) -> str:
    """Remove characters forbidden in HTML/XML text and retain ordinary Unicode."""
    return "".join(
        character for character in str(value or "")
        if character in "\t\n\r"
        or "\x20" <= character <= "\ud7ff"
        or "\ue000" <= character <= "\ufffd"
        or "\U00010000" <= character <= "\U0010ffff"
    )


def _html_text(value: object) -> str:
    return html.escape(_clean_report_text(value))


class ReportContext(BaseModel):
    """Everything needed to render a report — resolved from the taxonomy, no PII
    beyond name/class and no academic record."""
    student_name: str
    student_identity_label: Optional[str] = None
    student_class: Optional[str] = None
    stream: Optional[str] = None
    school_name: Optional[str] = None
    domain_name: Optional[str] = None
    domain_description: Optional[str] = None
    foundation_skills: List[str] = Field(default_factory=list)
    roles: List[str] = Field(default_factory=list)
    programme_name: Optional[str] = None
    admission_note: Optional[str] = None
    # Full selected-path payload. Empty for legacy report callers, which keep
    # using the original compact context until their caller is upgraded.
    full_path: dict = Field(default_factory=dict)
    generated_on: str = ""  # caller stamps this (Date is unavailable in some contexts)


# ─────────────────────────────────────────────────────────────
# HTML report (print-to-PDF)
# ─────────────────────────────────────────────────────────────

def _html_list(values: list, empty: str = "Not supplied in the available source data.") -> str:
    items = []
    for value in values or []:
        if isinstance(value, dict):
            value = value.get("name") or value.get("label") or value.get("skill")
        if value:
            items.append(f"<li>{html.escape(str(value))}</li>")
    return "".join(items) or f"<li>{html.escape(empty)}</li>"


def _html_tools(tools: list) -> str:
    items = []
    for tool in tools or []:
        if not isinstance(tool, dict):
            continue
        name = tool.get("name") or tool.get("tool")
        if not name:
            continue
        detail = f" - {tool.get('description')}" if tool.get("description") else ""
        items.append(f"<li><strong>{html.escape(str(name))}</strong>{html.escape(str(detail))}</li>")
    return "".join(items) or "<li>No role-specific or group-specific tools are recorded for this selection.</li>"


def _html_certs(certs: list) -> str:
    items = []
    for cert in certs or []:
        if not isinstance(cert, dict):
            continue
        name = cert.get("name")
        if not name:
            continue
        detail = cert.get("body") or cert.get("gateReason") or cert.get("level")
        suffix = f" - {detail}" if detail else ""
        items.append(f"<li><strong>{html.escape(str(name))}</strong>{html.escape(str(suffix))}</li>")
    return "".join(items) or "<li>No certifications are recorded for this selection.</li>"


def _guidance_focus(domain: dict, subgroups: list, roles: list) -> str:
    """Render the staged learning explanation without inventing a ranking."""
    match_type = str(domain.get("matchType") or "").lower()
    incomplete = domain.get("dataState") in {"partial", "unsourced"} or domain.get("sourceConfidence") in {"low", "unsourced"}
    if match_type in {"functional", "adjacent"}:
        bridge = "This is a possible pivot. Your current foundation helps, but you " + ("may need" if incomplete else "need") + " this bridge before specializing."
    else:
        bridge = "You already have partial preparation from your programme and primary domain. These are the " + ("additional skills you may need." if incomplete else "additional skills you need.")
    subgroup_names = [str(item.get("name")) for item in subgroups if item.get("name")]
    role_names = [str(item.get("name")) for item in roles if item.get("name")]
    subgroup_text = ", ".join(subgroup_names) if subgroup_names else "the selected subgroup"
    role_text = ", ".join(role_names) if role_names else "the selected role"
    return f"""
      <div class='focus entity'>
        <h4>What to focus on next</h4>
        <p>{html.escape(bridge)}</p>
        <ol>
          <li><strong>Portable domain foundation:</strong> start with the foundation competencies listed for this domain.</li>
          <li><strong>Additional subgroup capabilities:</strong> build the capabilities introduced by {html.escape(subgroup_text)}.</li>
          <li><strong>Role-specific proof, tools and credentials:</strong> apply the foundation and bridge to {html.escape(role_text)}; optional or advanced items can wait.</li>
        </ol>
      </div>"""


def _guidance_data_notes(domains: list) -> str:
    """Explain missing selected-entity fields without treating absence as rank."""
    notes: list[str] = []
    for domain in domains or []:
        name = str(domain.get("name") or "the selected domain")
        if domain.get("dataState") in {"partial", "unsourced"}:
            notes.append(f"Some source fields for {name} are incomplete; unavailable fields are not treated as lower priority.")
        if not domain.get("skills"):
            notes.append(f"No domain foundation competencies were supplied for {name} in the selected source record.")
        for subgroup in domain.get("subgroups") or []:
            subgroup_name = str(subgroup.get("name") or "the selected subgroup")
            if not subgroup.get("skills"):
                notes.append(f"No subgroup competencies were supplied for {subgroup_name} in the selected source record.")
        for role in domain.get("roles") or []:
            role_name = str(role.get("name") or "the selected role")
            role_skills = role.get("skills") if isinstance(role.get("skills"), dict) else {}
            if not role_skills.get("essential"):
                notes.append(f"No essential role competencies were supplied for {role_name} in the selected source record.")
    if not notes:
        notes.append("The report includes only the selected source-backed path. Missing local, remote or global signals are not interpreted as proof that an item is unimportant.")
    return "".join(f"<li>{html.escape(note)}</li>" for note in notes)


def _report_title(academic: dict) -> str:
    """Use the student's route language in the printable heading."""
    user_type = str(academic.get("userType") or "").lower()
    student_class = str(academic.get("class") or "").lower()
    if user_type == "senior_secondary":
        return f"{student_class.upper()} Guidance Summary" if student_class in {"ss1", "ss2"} else "Secondary Student Guidance Summary"
    if user_type == "ss3_secondary":
        return "SS3 Guidance Summary"
    if user_type == "jamb":
        return "JAMB Guidance Summary"
    if user_type == "student":
        return "Undergraduate Guidance Summary"
    return "Student Guidance Summary"


def _guidance_requirement_rows(path: dict) -> list[tuple[str, str]]:
    """Return only student-facing requirement fields for the selected route.

    Direct Entry is intentionally excluded from the ordinary supported student
    routes. National and university-specific text are both retained and
    labelled; a university row must never silently replace the national row.
    """
    national = path.get("requirements") if isinstance(path.get("requirements"), dict) else {}
    university = path.get("universityRequirements") if isinstance(path.get("universityRequirements"), dict) else {}
    rows: list[tuple[str, str]] = []
    rows.append(("National UTME subjects", str(national.get("utmeSubjects") or "Not recorded in the current source data.")))
    rows.append(("National O-level requirements", str(national.get("olevelRequirement") or "Not recorded in the current source data.")))
    rows.append(("University UTME subjects", str(university.get("utmeSubjects") or "Not recorded for the selected university.")))
    rows.append(("University O-level requirements", str(university.get("olevelRequirement") or "Not recorded for the selected university.")))
    if university.get("note"):
        rows.append(("Additional university note", str(university["note"])))
    status = str(national.get("requirementStatus") or "").lower()
    if status in {"review_only", "source_missing"}:
        rows.append(("Requirement evidence", "The published text is shown for reference and should be checked against the current university notice."))
    return rows


def _subject_match_status(path: dict) -> tuple[str, str]:
    """Make the evidence state visible instead of implying eligibility."""
    payload = path.get("subjectMatch") if isinstance(path.get("subjectMatch"), dict) else {}
    status = str(payload.get("status") or "not_checked").lower()
    if status == "verified":
        return "Checked", "The selected subjects were checked against the structured rule available for this path."
    if status == "partial":
        return "Partial check", "The subject check was partial. Review the requirement gaps before treating this as a possible fit."
    if status == "unavailable":
        return "Unavailable", "Structured subject matching was not available for this path. This report is not eligibility confirmation."
    return "Not checked", "Subject matching was not used for this programme search."


def _learning_focus_id(item: dict) -> str:
    """Use the same stable item key as the client learning-plan adapter."""
    level = "area" if item.get("contextLevel") == "subgroup" else str(item.get("contextLevel") or "item")
    return f"{level}:{item.get('contextKey')}:{item.get('itemType')}:{item.get('itemKey')}"


def _learning_plan_html(path: dict) -> str:
    """Render the saved focused-plan snapshot without treating selection as mastery."""
    snapshot = path.get("learningPlanSnapshot") if isinstance(path.get("learningPlanSnapshot"), dict) else {}
    focus = [item for item in (path.get("learningFocus") or []) if isinstance(item, dict)]
    stacks = snapshot.get("stacks") if isinstance(snapshot.get("stacks"), list) else []
    if not stacks and not focus:
        return ""

    names: dict[str, str] = {}
    programme = path.get("programme") if isinstance(path.get("programme"), dict) else {}
    if programme.get("id") and programme.get("name"):
        names[str(programme["id"])] = str(programme["name"])
    for key in ("domains", "subgroups", "roles"):
        for item in path.get(key) or []:
            if not isinstance(item, dict):
                continue
            item_id = item.get("id") or item.get("roleKey")
            if item_id and item.get("name"):
                names[str(item_id)] = str(item["name"])

    def route_name(route: dict) -> str:
        values = [route.get("programmeId"), route.get("domainId"), route.get("areaId"), route.get("roleId")]
        return " → ".join(html.escape(names.get(str(value), str(value))) for value in values if value)

    focus_by_id = {_learning_focus_id(item): item for item in focus}
    blocks: list[str] = []
    report_warnings = snapshot.get("routeWarnings") if isinstance(snapshot.get("routeWarnings"), list) else []
    warning_html = ""
    if report_warnings:
        warning_html = "<div class='entity nested'><strong>Route note</strong><ul>" + "".join(
            f"<li>{html.escape(str(warning.get('message') or 'This report contains more than one route.'))}</li>"
            for warning in report_warnings if isinstance(warning, dict)
        ) + "</ul></div>"
    for stack in stacks:
        if not isinstance(stack, dict):
            continue
        selected_ids = [str(value) for value in (stack.get("selectedIds") or [])]
        # The sequence engine stores the dependency-checked learner order
        # separately from the selection set. Prefer that order for the printed
        # route; older snapshots may not have it, so retain their saved list.
        requested_order = [str(value) for value in (stack.get("order") or [])]
        ordered_ids = list(dict.fromkeys(
            [value for value in requested_order if value in selected_ids]
            + [value for value in selected_ids if value not in requested_order]
        ))
        summaries = [item for item in (stack.get("itemSummaries") or []) if isinstance(item, dict)]
        summary_by_id = {str(item.get("id")): item for item in summaries if item.get("id")}
        selected_items = []
        for item_id in ordered_ids:
            item = dict(summary_by_id.get(item_id) or focus_by_id.get(item_id) or {})
            if item:
                selected_items.append(item)
        rows = []
        for step_number, item in enumerate(selected_items, start=1):
            layer = item.get("layer") or item.get("contextLevel") or "item"
            level = "Area of specialization" if layer == "subgroup" else str(layer).replace("_", " ").title()
            explanation = str(item.get("explanation") or "").strip()
            link = str(item.get("linkUrl") or "").strip()
            detail_parts = []
            item_type = str(item.get("itemType") or "").strip()
            theme = str(item.get("themeLabel") or "").strip()
            use_case = str(item.get("useCaseKey") or "").strip()
            requirement = str(item.get("requirementLevel") or "").strip()
            plain_meaning = str(item.get("plainMeaning") or "").strip()
            contextual_use = str(item.get("contextualUse") or "").strip()
            expected_output = str(item.get("expectedOutput") or "").strip()
            if explanation:
                detail_parts.append(f"<p class='muted'>{html.escape(explanation)}</p>")
            if item_type:
                detail_parts.append(f"<p><strong>Type:</strong> {html.escape(item_type.replace('_', ' '))}</p>")
            if theme:
                detail_parts.append(f"<p><strong>Theme:</strong> {html.escape(theme)}</p>")
            if use_case:
                detail_parts.append(f"<p><strong>Use case:</strong> {html.escape(use_case.replace('_', ' '))}</p>")
            if requirement:
                detail_parts.append(f"<p><strong>Why it is shown:</strong> {html.escape(requirement.replace('_', ' '))}</p>")
            if plain_meaning and plain_meaning != explanation:
                detail_parts.append(f"<p><strong>What it is:</strong> {html.escape(plain_meaning)}</p>")
            if contextual_use:
                detail_parts.append(f"<p><strong>In this route:</strong> {html.escape(contextual_use)}</p>")
            if expected_output:
                detail_parts.append(f"<p><strong>What you can produce:</strong> {html.escape(expected_output)}</p>")
            prerequisites = [str(value).strip() for value in (item.get("prerequisites") or []) if str(value).strip()]
            if prerequisites:
                detail_parts.append(
                    "<p><strong>Learn or review first:</strong> "
                    + html.escape(", ".join(prerequisites))
                    + "</p>"
                )
            relationships = [relation for relation in (item.get("relationships") or []) if isinstance(relation, dict)]
            relationship_lines = []
            for relation in relationships:
                relation_type = str(relation.get("type") or "").replace("_", " ").strip()
                target = str(relation.get("targetName") or relation.get("targetId") or "").strip()
                relation_explanation = str(relation.get("explanation") or "").strip()
                if not relation_type or not target:
                    continue
                suffix = f": {relation_explanation}" if relation_explanation else ""
                source_references = [
                    reference for reference in (relation.get("sourceReferences") or [])
                    if isinstance(reference, dict) and str(reference.get("url") or "").startswith("https://")
                ]
                source_links = "".join(
                    f" <a href='{html.escape(str(reference['url']))}'>"
                    f"Evidence: {html.escape(str(reference.get('title') or 'Source'))}</a>"
                    for reference in source_references
                )
                relationship_lines.append(
                    f"<li><strong>{html.escape(relation_type.title())}:</strong> "
                    f"{html.escape(target)}{html.escape(suffix)}{source_links}</li>"
                )
            if relationship_lines:
                detail_parts.append("<p><strong>How it connects:</strong></p><ul>" + "".join(relationship_lines) + "</ul>")
            limitations = [str(value).strip() for value in (item.get("limitations") or []) if str(value).strip()]
            if limitations:
                detail_parts.append(
                    "<p><strong>Limits:</strong> " + html.escape("; ".join(limitations)) + "</p>"
                )
            source_rows = []
            source_references = [
                reference for reference in (item.get("sourceReferences") or [])
                if isinstance(reference, dict) and str(reference.get("url") or "").startswith("https://")
            ]
            locators = [locator for locator in (item.get("sourceLocators") or []) if isinstance(locator, dict)]
            for reference in source_references:
                title = str(reference.get("title") or "Supporting source")
                url = str(reference["url"])
                ref_id = reference.get("id")
                locator = next((entry for entry in locators if ref_id and entry.get("sourceId") == ref_id), None)
                locator_text = str(locator.get("locator") or "").strip() if locator else ""
                source_rows.append(
                    f"<li><a href='{html.escape(url)}'>{html.escape(title)}</a>"
                    + (f" — Where to look: {html.escape(locator_text)}" if locator_text else "")
                    + "</li>"
                )
            if source_rows:
                detail_parts.append("<p><strong>Evidence for this item:</strong></p><ul>" + "".join(source_rows) + "</ul>")
            detail = "".join(detail_parts)
            if link.startswith("https://"):
                detail += f"<p><a href='{html.escape(link)}'>Open learning resource</a></p>"
            rows.append(
                f"<li><strong>Step {step_number} · {html.escape(level)}:</strong> "
                f"{html.escape(str(item.get('name') or item.get('itemKey') or 'Selected item'))}{detail}</li>"
            )
        if not rows and selected_ids:
            rows.append(f"<li>{len(selected_ids)} selected item(s) are stored in this route snapshot.</li>")
        removed_ids = [str(value) for value in (stack.get("removedIds") or [])]
        if removed_ids:
            rows.append(
                f"<li class='muted'>{len(removed_ids)} item(s) were deliberately not included in this route focus. "
                "This does not remove them from the canonical route.</li>"
            )
        alternative_groups = [group for group in (stack.get("alternativeSummaries") or []) if isinstance(group, dict)]
        alternative_rows = []
        for group in alternative_groups:
            options = [item for item in (group.get("options") or []) if isinstance(item, dict)]
            if not options:
                continue
            selected = summary_by_id.get(str(group.get("selectedId") or ""), {})
            selected_name = str(selected.get("name") or "the selected option")
            option_rows = []
            for option in options:
                name = str(option.get("name") or "Option")
                details = []
                item_type = str(option.get("itemType") or "").strip()
                meaning = str(option.get("plainMeaning") or option.get("explanation") or "").strip()
                contextual_use = str(option.get("contextualUse") or "").strip()
                expected_output = str(option.get("expectedOutput") or "").strip()
                limitations = [str(value).strip() for value in (option.get("limitations") or []) if str(value).strip()]
                link = str(option.get("linkUrl") or "").strip()
                if item_type:
                    details.append(f"<p><strong>Type:</strong> {html.escape(item_type.replace('_', ' '))}</p>")
                if meaning:
                    details.append(f"<p><strong>What it is:</strong> {html.escape(meaning)}</p>")
                if contextual_use:
                    details.append(f"<p><strong>In this route:</strong> {html.escape(contextual_use)}</p>")
                if expected_output:
                    details.append(f"<p><strong>What it helps you produce:</strong> {html.escape(expected_output)}</p>")
                if limitations:
                    details.append(f"<p><strong>Limits:</strong> {html.escape('; '.join(limitations))}</p>")
                if link.startswith("https://"):
                    details.append(f"<p><a href='{html.escape(link)}'>Explore this alternative</a></p>")
                option_rows.append(
                    f"<li><strong>{html.escape(name)}</strong><span class='muted'> — not selected</span>{''.join(details)}</li>"
                )
            alternative_rows.append(
                f"<li><strong>Other options compared with {html.escape(selected_name)}</strong>"
                "<ul>" + "".join(option_rows) + "</ul>"
                "<p class='muted'>These options remain outside your selected learning focus.</p></li>"
            )
        if alternative_rows:
            rows.append(
                "<li><strong>Alternatives not selected</strong><ul>"
                + "".join(alternative_rows)
                + "</ul></li>"
            )
        blocks.append(
            f"<div class='entity nested'><h4>{route_name(stack.get('route') or {}) or 'Selected route'}</h4>"
            "<p class='muted'>Items follow the saved order for this route. Programme, domain, area and role labels show where an item belongs; they do not make every item in one layer a prerequisite for the next. Only an explicitly reviewed, route-specific prerequisite constrains order.</p>"
            f"<ol class='learning-plan-steps'>{''.join(rows) or '<li>No granular item has been selected on this route.</li>'}</ol></div>"
        )
    if not blocks and focus:
        blocks.append("<div class='entity nested'><h4>Current learning focus</h4><ul>" + "".join(
            f"<li>{html.escape(str(item.get('name') or item.get('itemKey') or 'Selected item'))}</li>" for item in focus
        ) + "</ul></div>")
    return (
        "<section class='entity page-break'><div class='entity-kicker'>Focused learning plan</div>"
        "<h3>Your selected learning focus</h3>"
        "<p>This is a personal focus list, not a test result, mastery claim or employment guarantee. "
        "Items stay grouped by their selected route.</p>"
        + warning_html
        + "".join(blocks)
        + "</section>"
    )


@lru_cache(maxsize=1)
def _d078_nodes() -> dict:
    """Read display labels from the checked-in D078 route contract."""
    source = Path(__file__).resolve().parents[2] / "src" / "data" / "d078MethodAwareUiData.json"
    try:
        payload = json.loads(source.read_text(encoding="utf-8"))
        return payload.get("nodes_by_id") if isinstance(payload.get("nodes_by_id"), dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def _d078_saved_route(path: dict, selection: Optional[dict] = None) -> Optional[dict]:
    snapshot = path.get("learningPlanSnapshot") if isinstance(path.get("learningPlanSnapshot"), dict) else {}
    if snapshot.get("dataVersion") != "guided-experience-d078-v1":
        return None
    selections = snapshot.get("d078SelectionsByRoute")
    if not isinstance(selections, dict):
        return None
    if selection is None:
        entries = _d078_selection_entries(path)
        active_id = snapshot.get("d078ActiveStackId")
        selection = next((value for stack_id, value in entries if stack_id == active_id), None)
        if selection is None and entries:
            # A stale/missing active id must not make a valid multi-route
            # snapshot fall back to legacy report rendering.
            selection = entries[0][1]
    if selection is None:
        return None
    data = _d078_route_data()
    nodes = _d078_nodes()

    def strings(values: object) -> list[str]:
        return list(dict.fromkeys(value for value in values if isinstance(value, str))) if isinstance(values, list) else []

    methods_by_id = {str(value) for value in data.get("method_node_ids", [])}
    selected_methods = [value for value in strings(selection.get("methodIds")) if value in methods_by_id]
    combo_rows = [row for row in data.get("combination_designs", []) if isinstance(row, dict) and isinstance(row.get("id"), str)]
    combos_by_id = {row["id"]: row for row in combo_rows}
    selected_combos = [value for value in strings(selection.get("combinationIds")) if value in combos_by_id]
    raw_components = selection.get("componentMethodIds") if isinstance(selection.get("componentMethodIds"), dict) else {}
    selected_components: dict[str, list[str]] = {}
    for combo_id in selected_combos:
        allowed = set(strings(combos_by_id[combo_id].get("selectable_component_method_ids")))
        chosen = [value for value in strings(raw_components.get(combo_id)) if value in allowed]
        if chosen:
            selected_components[combo_id] = chosen

    area_routes: list[dict] = []
    role_routes: list[dict] = []
    allowed_roles: set[tuple[str, str]] = set()
    allowed_domain_items: set[str] = set()
    allowed_tools: set[str] = set()
    allowed_domain_items_by_area: dict[str, set[str]] = {}
    allowed_tools_by_area: dict[str, set[str]] = {}
    allowed_area_items: dict[str, set[str]] = {}
    allowed_role_items: dict[tuple[str, str], set[str]] = {}

    def add_route(route: dict) -> None:
        area_id = route.get("area_id")
        if not isinstance(area_id, str):
            return
        area_domain_items = allowed_domain_items_by_area.setdefault(area_id, set())
        area_tools = allowed_tools_by_area.setdefault(area_id, set())
        allowed_area_items.setdefault(area_id, set()).update(strings(route.get("area_item_ids")))
        route_domain_items = strings(route.get("task_linked_domain_item_ids")) + strings(route.get("domain_downstream_item_ids")) + strings(route.get("available_item_ids"))
        route_tools = strings(route.get("tool_ids")) + strings(route.get("domain_tool_ids"))
        allowed_domain_items.update(route_domain_items)
        allowed_tools.update(route_tools)
        area_domain_items.update(route_domain_items)
        area_tools.update(route_tools)
        for role_id in strings(route.get("role_ids")):
            if role_id in nodes:
                allowed_roles.add((area_id, role_id))

    method_routes = [row for row in data.get("method_area_routes", []) if isinstance(row, dict)]
    method_role_routes = [row for row in data.get("method_area_role_routes", []) if isinstance(row, dict)]
    combo_area_routes = [row for row in data.get("combination_area_routes", []) if isinstance(row, dict)]
    combo_role_routes = [row for row in data.get("combination_area_role_routes", []) if isinstance(row, dict)]
    for method_id in selected_methods:
        for route in method_routes:
            if route.get("method_id") == method_id:
                add_route(route)
                area_routes.append(route)
        for route in method_role_routes:
            if route.get("method_id") == method_id and isinstance(route.get("area_id"), str) and isinstance(route.get("role_id"), str):
                allowed_roles.add((route["area_id"], route["role_id"]))
                role_routes.append(route)

    for combo_id in selected_combos:
        combo = combos_by_id[combo_id]
        explicit_routes = [row for row in combo_area_routes if row.get("combination_id") == combo_id]
        if explicit_routes:
            for route in explicit_routes:
                add_route(route)
                area_routes.append(route)
            for route in combo_role_routes:
                if route.get("combination_id") == combo_id and isinstance(route.get("area_id"), str) and isinstance(route.get("role_id"), str):
                    allowed_roles.add((route["area_id"], route["role_id"]))
                    role_routes.append(route)
        else:
            method_ids = strings(combo.get("required_method_ids")) + selected_components.get(combo_id, [])
            for method_id in dict.fromkeys(method_ids):
                for route in method_routes:
                    if route.get("method_id") == method_id:
                        add_route(route)
                        area_routes.append(route)
                for route in method_role_routes:
                    if route.get("method_id") == method_id and isinstance(route.get("area_id"), str) and isinstance(route.get("role_id"), str):
                        allowed_roles.add((route["area_id"], route["role_id"]))
                        role_routes.append(route)

    raw_area = selection.get("areaId")
    area_nodes = {str(node.get("area_id")): str(node.get("id"))
                  for node in nodes.values() if isinstance(node, dict) and node.get("kind") == "area_of_specialization"}
    area_id = raw_area if isinstance(raw_area, str) and raw_area in allowed_area_items else None
    if area_id is None and isinstance(raw_area, str):
        area_id = next((key for key, node_id in area_nodes.items() if node_id == raw_area and key in allowed_area_items), None)
    role_id = selection.get("roleId")
    if not (area_id and isinstance(role_id, str) and (area_id, role_id) in allowed_roles):
        role_id = None

    allowed_items = (set(allowed_domain_items_by_area.get(area_id, set())) | set(allowed_tools_by_area.get(area_id, set()))
                     if area_id else set(allowed_domain_items) | set(allowed_tools))
    if area_id:
        allowed_items.update(allowed_area_items.get(area_id, set()))
    if area_id and isinstance(role_id, str):
        for route in role_routes:
            if route.get("area_id") == area_id and route.get("role_id") == role_id:
                allowed_role_items.setdefault((area_id, role_id), set()).update(strings(route.get("role_item_ids")))
        allowed_items.update(allowed_role_items.get((area_id, role_id), set()))
    if raw_area and not area_id:
        allowed_items.clear()
    added_items = [item_id for item_id in strings(selection.get("addedItemIds"))
                   if item_id in allowed_items and item_id in nodes]

    def label(node_id: object) -> str:
        if not isinstance(node_id, str):
            return ""
        node = nodes.get(node_id)
        return str(node.get("label")) if isinstance(node, dict) and node.get("label") else ""
    def labels(ids: object) -> list[str]:
        return [value for item_id in strings(ids) if (value := label(item_id))]
    methods = labels(selected_methods)
    combinations = []
    for combo_id in selected_combos:
        combo_node = nodes.get(combo_id)
        combinations.append(str(combo_node.get("label")) if isinstance(combo_node, dict) and combo_node.get("label") else str(combos_by_id[combo_id].get("design") or combo_id).replace("_", " ").title())
    components = labels([item_id for ids in selected_components.values() for item_id in ids])
    area_node_id = area_nodes.get(area_id or "")
    area_node = nodes.get(area_node_id or "")
    area = str(area_node.get("label")) if isinstance(area_node, dict) else ""
    role = label(role_id)
    if role:
        role = role.title()
    stop_point = role or area or "Field only"
    return {
        "foundations": labels(data.get("foundation_item_ids")),
        "methods": methods,
        "combinations": combinations,
        "components": components,
        "area": area,
        "role": role,
        "stop_point": stop_point,
        "added_items": labels(added_items),
    }


def _d078_selection_entries(path: dict) -> list[tuple[str, dict]]:
    snapshot = path.get("learningPlanSnapshot") if isinstance(path.get("learningPlanSnapshot"), dict) else {}
    if snapshot.get("dataVersion") != "guided-experience-d078-v1":
        return []
    selections = snapshot.get("d078SelectionsByRoute")
    if not isinstance(selections, dict):
        return []
    programme = path.get("programme") if isinstance(path.get("programme"), dict) else {}
    programme_id = str(programme.get("jambProgrammeId") or programme.get("jamb_programme_id") or programme.get("id") or "programme-not-selected")
    prefix = f"{programme_id}::D078"
    rows: list[tuple[str, dict]] = []
    legacy = selections.get(prefix)
    if isinstance(legacy, dict):
        rows.append(("d078-route-1", legacy))
    explicit_ids = snapshot.get("d078RouteStackIds")
    if isinstance(explicit_ids, list):
        ordered_ids = [value for value in explicit_ids if isinstance(value, str) and value]
    else:
        ordered_ids = []
    for stack_id in ordered_ids:
        if stack_id == "d078-route-1":
            continue
        selection = selections.get(f"{prefix}::{stack_id}")
        if isinstance(selection, dict):
            rows.append((stack_id, selection))
    if not rows:
        for key, selection in selections.items():
            if isinstance(key, str) and key.startswith(f"{prefix}::") and isinstance(selection, dict):
                stack_id = key[len(prefix) + 2:]
                if stack_id and not any(existing == stack_id for existing, _ in rows):
                    rows.append((stack_id, selection))
        if not rows:
            candidates = [(str(key), value) for key, value in selections.items()
                          if str(key).endswith("::D078") and isinstance(value, dict)]
            if len(candidates) == 1:
                rows.append(("d078-route-1", candidates[0][1]))
    return rows


def _d078_saved_routes(path: dict) -> list[tuple[str, dict]]:
    return [(stack_id, route) for stack_id, selection in _d078_selection_entries(path)
            if (route := _d078_saved_route(path, selection)) is not None]


@lru_cache(maxsize=1)
def _d078_route_data() -> dict:
    source = Path(__file__).resolve().parents[2] / "src" / "data" / "d078MethodAwareUiData.json"
    try:
        return json.loads(source.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _d078_route_html(path: dict) -> str:
    routes = _d078_saved_routes(path)
    if not routes:
        return ""
    e = html.escape
    sections = []
    for index, (stack_id, route) in enumerate(routes, start=1):
        lists = (
            ("Field foundations", route["foundations"]),
            ("Selected methods", route["methods"]),
            ("Selected combinations", route["combinations"]),
            ("Methods within selected combinations", route["components"]),
            ("Items you added", route["added_items"]),
        )
        content = "".join(
            f"<p><strong>{e(title)}:</strong> {e('; '.join(values) if values else 'None selected or recorded.')}</p>"
            for title, values in lists
        )
        route_context = "".join(
            f"<p><strong>{e(title)}:</strong> {e(value)}</p>"
            for title, value in (("Area", route["area"]), ("Role", route["role"]), ("Stop point", route["stop_point"])) if value
        )
        sections.append(
            "<section class='entity'><div class='entity-kicker'>"
            f"Saved D078 route {index}</div>"
            "<h3>Sociology to Social Sciences &amp; Behavioural Research</h3>"
            "<p>This records your choices. Selection does not show mastery or make a method a job requirement.</p>"
            f"{route_context}{content}</section>"
        )
    return "".join(sections)


def _report_access_block(access_code: object) -> str:
    """Render a real provisioned-student handoff, when one exists."""
    if not access_code:
        return ""
    code = str(access_code)
    claim_url = f"https://levelup.com.ng/settings/my-school?claim={quote(code)}"
    qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + quote(claim_url, safe="")
    return f"""<section class='access entity'>
      <h2>Student access</h2>
      <p>Use this code to claim the school-created account. Keep it private.</p>
      <div class='access-code'>{html.escape(code)}</div>
      <img class='qr' src='{html.escape(qr_url)}' alt='Scan to open the student claim page' />
    </section>"""


def _saved_programmes(path: dict) -> list[tuple[dict, dict]]:
    """Return the saved programme/university pairs in display order."""
    raw = path.get("programmes") if isinstance(path.get("programmes"), list) else []
    pairs: list[tuple[dict, dict]] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        programme = item.get("programme") if isinstance(item.get("programme"), dict) else item
        university = item.get("university") if isinstance(item.get("university"), dict) else {}
        pairs.append((programme, university))
    if not pairs:
        programme = path.get("programme") if isinstance(path.get("programme"), dict) else {}
        university = path.get("university") if isinstance(path.get("university"), dict) else {}
        if programme or university:
            pairs.append((programme, university))
    return pairs


def build_full_guidance_report_html(ctx: ReportContext) -> str:
    """Render the complete selected path without importing unselected data."""
    e = _html_text
    path = ctx.full_path
    academic = path.get("academicContext") or {}
    subjects = path.get("subjects") or {}
    programme = path.get("programme") or {}
    university = path.get("university") or {}
    attached_institution = path.get("attachedInstitution") or {}
    d078_route = _d078_saved_route(path)
    d078_route_html = _d078_route_html(path)
    domains = [] if d078_route else path.get("domains") or []
    watermark = "Sifter LevelUp" + (f" - {academic.get('schoolName')}" if academic.get("schoolName") else "")
    subject_rows = "".join(
        f"<div class='row'><strong>{e(label)}</strong><span>{e(', '.join(values or []) or 'None recorded')}</span></div>"
        for label, values in (("O-level subjects", subjects.get("olevel")), ("UTME subjects", subjects.get("utme")))
    )
    context_rows = "".join(
        f"<div class='row'><strong>{e(label)}</strong><span>{e(str(value))}</span></div>"
        for label, value in ((
            ("Student type", academic.get("userType")),
            ("Class", academic.get("class")),
            ("Stream", academic.get("stream")),
            ("School", academic.get("schoolName")),
            ("Tutorial centre", academic.get("tutorialCentreName")),
            (
                "Attached institution",
                f"{attached_institution.get('institutionTypeLabel')}: {attached_institution.get('name')}"
                if attached_institution.get("name") and attached_institution.get("institutionTypeLabel")
                else None,
            ),
        )) if value
    )
    requirement_rows = "".join(
        f"<div class='row'><strong>{e(label)}</strong><span>{e(value)}</span></div>"
        for label, value in _guidance_requirement_rows(path)
    ) or "<p class='muted'>The published requirement details were not available for this selection.</p>"
    subject_status, subject_status_text = _subject_match_status(path)
    subject_status_html = (
        f"<div class='row'><strong>{e(subject_status)}</strong>"
        f"<span>{e(subject_status_text)}</span></div>"
    )
    domain_blocks = []
    for domain in domains:
        domain_sg = domain.get("subgroups") or []
        domain_roles = domain.get("roles") or []
        subgroup_blocks = []
        for subgroup in domain_sg:
            subgroup_blocks.append(f"""
              <div class='entity nested'>
                <h4>{e(str(subgroup.get('name') or 'Selected sub-group'))}</h4>
                <p>{e(str(subgroup.get('description') or ''))}</p>
                <h5>Sub-group competencies</h5><ul>{_html_list(subgroup.get('skills'))}</ul>
                <h5>Sub-group tools</h5><ul>{_html_tools(subgroup.get('tools'))}</ul>
                <h5>Sub-group certifications</h5><ul>{_html_certs(subgroup.get('certifications'))}</ul>
              </div>""")
        role_blocks = []
        for role in domain_roles:
            role_skills = role.get("skills") or {}
            role_blocks.append(f"""
              <div class='entity nested'>
                <h4>{e(str(role.get('name') or 'Selected role'))}</h4>
                <p class='muted'>{e(str(role.get('tier') or 'Career role'))}</p>
                <h5>Essential role competencies</h5><ul>{_html_list(role_skills.get('essential'))}</ul>
                <h5>Supplementary role competencies</h5><ul>{_html_list(role_skills.get('supplementary'))}</ul>
                <h5>Role tools</h5><ul>{_html_tools(role.get('tools'))}</ul>
                <h5>Role certifications</h5><ul>{_html_certs(role.get('certifications'))}</ul>
              </div>""")
        domain_blocks.append(f"""
          <section class='entity page-break'>
            <div class='entity-kicker'>{e('Primary route' if domain.get('intent') == 'primary' else str(domain.get('matchType') or 'Selected domain'))}</div>
            <h3>{e(str(domain.get('name') or 'Selected domain'))}</h3>
            <p>{e(str(domain.get('description') or ''))}</p>
            {_guidance_focus(domain, domain_sg, domain_roles)}
            <h4>Domain competencies</h4><ul>{_html_list(domain.get('skills'))}</ul>
            <h4>Domain tools</h4><ul>{_html_tools(domain.get('tools'))}</ul>
            <h4>Domain certifications</h4><ul>{_html_certs(domain.get('certifications'))}</ul>
            {('<h4>Selected sub-groups</h4>' + ''.join(subgroup_blocks)) if subgroup_blocks else '<p class="muted">No sub-group was selected under this domain.</p>'}
            {('<h4>Selected roles</h4>' + ''.join(role_blocks)) if role_blocks else '<p class="muted">No role was selected under this domain.</p>'}
          </section>""")
    domains_html = "".join(domain_blocks) or ("" if d078_route else "<p class='muted'>No domain, sub-group, or role has been selected for this report yet.</p>")
    learning_plan_html = "" if d078_route else _learning_plan_html(path)
    discovery_door = path.get("discoveryDoor") or "Not recorded"
    data_notes_html = _guidance_data_notes(domains)
    school = academic.get("schoolName") or ctx.school_name
    access_block = _report_access_block(path.get("accessCode"))
    programme_blocks = []
    saved_programmes = [(programme, university)] if d078_route and programme else _saved_programmes(path)
    for saved_programme, saved_university in saved_programmes:
        address = f"<p><strong>Address:</strong> {e(str(saved_university.get('address')))}</p>" if saved_university.get("address") else ""
        university_copy = (
            "<p>University-specific admission requirements are not included in this saved learning route.</p>"
            if d078_route and not saved_university.get("name")
            else f"<p><strong>University:</strong> {e(str(saved_university.get('name') or 'Not confirmed'))}</p>{address}"
        )
        programme_blocks.append(
            f"<div class='entity'><h3>{e(str(saved_programme.get('name') or 'Programme not confirmed'))}</h3>"
            f"{university_copy}</div>"
        )
    programme_html = "".join(programme_blocks) or "<p class='muted'>No programme choice has been recorded yet.</p>"
    return f"""<!doctype html>
<html><head><meta charset='utf-8'><title>Guidance report - {e(ctx.student_name)}</title>
<style>
@media print {{ @page {{ margin: 16mm; }} .toolbar {{ display:none; }} .page-break {{ break-before: page; }} }}
body {{ font-family: Arial, sans-serif; color:#202124; max-width:820px; margin:0 auto; padding:28px; line-height:1.45; user-select:none; -webkit-user-select:none; -webkit-user-drag:none; }}
.watermark {{ position:fixed; top:44%; left:50%; transform:translate(-50%,-50%) rotate(-28deg); color:rgba(242,137,0,.10); font-size:42px; font-weight:800; white-space:nowrap; pointer-events:none; }}
.content {{ position:relative; z-index:1; }} .toolbar {{ text-align:right; margin-bottom:18px; }}
button {{ padding:9px 14px; border:1px solid #bbb; border-radius:6px; background:#fff; user-select:auto; -webkit-user-select:auto; cursor:pointer; }}
.head {{ border-bottom:2px solid #202124; padding-bottom:14px; }} h1 {{ margin:4px 0; font-size:28px; }}
h2 {{ margin-top:28px; border-bottom:1px solid #ddd; padding-bottom:6px; }} h3 {{ margin-bottom:4px; font-size:21px; }}
h4 {{ margin:18px 0 6px; font-size:14px; text-transform:uppercase; letter-spacing:.5px; }} h5 {{ margin:12px 0 3px; font-size:13px; }}
.eyebrow,.entity-kicker {{ color:#8b5700; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }}
.row {{ display:grid; grid-template-columns:minmax(150px, .35fr) 1fr; gap:14px; padding:6px 0; border-bottom:1px solid #eee; }}
.entity {{ margin-top:18px; padding:16px; border:1px solid #ddd; border-radius:6px; }} .nested {{ margin-top:12px; background:#fafafa; }}
.access {{ text-align:center; }} .access-code {{ font-family: 'Courier New', monospace; font-size:26px; font-weight:700; letter-spacing:3px; margin:12px 0; }} .qr {{ width:180px; height:180px; display:block; margin:12px auto; }}
ul {{ margin:5px 0 10px; padding-left:22px; }} li {{ margin:3px 0; }} .muted {{ color:#5f6368; }}
.foot {{ margin-top:30px; padding-top:12px; border-top:1px solid #ddd; font-size:11px; color:#5f6368; }}
</style></head><body><div class='toolbar'><button onclick='window.print()'>Print / save PDF</button></div>
<div class='watermark'>{e(watermark)}</div><div class='content'>
<header class='head'><div class='eyebrow'>{e(str(school or 'Sifter LevelUp'))}</div>{f"<div class='muted'>{e(ctx.student_identity_label)}:</div>" if ctx.student_identity_label else ''}<h1>{e(ctx.student_name)}</h1><div class='muted'>{e(_report_title(academic))} - generated {e(ctx.generated_on)}</div></header>
<h2>Your guidance context</h2><div>{context_rows or '<p class="muted">No additional academic context was recorded.</p>'}</div>
<h2>What you selected</h2><div class='row'><strong>Discovery door</strong><span>{e(str(discovery_door))}</span></div>
<h2>Subjects you entered</h2><div>{subject_rows or '<p class="muted">No subjects were recorded.</p>'}</div>
<h2>Programmes you saved</h2>{programme_html}<p class='muted'>Current guidance path: {e(str(programme.get('name') or 'Programme not confirmed'))}{f" at {e(str(university.get('name')))}" if university.get('name') else ""}.</p>
{'' if d078_route and not university.get('name') else f"<h2>Admission requirements</h2><div>{requirement_rows}</div><h2>Subject check status</h2><div>{subject_status_html}</div>"}
{'' if d078_route else f"<h2>Selected intelligence path</h2>{domains_html}"}
{d078_route_html}
{learning_plan_html}
<h2>Data notes</h2><ul>{data_notes_html}</ul>
{access_block}
<div class='foot'>This report contains the source-backed selections made during guidance. It does not include unselected catalogue entities, unsupported demand claims, or Post-UTME claims. Guidance is not an admission, employment, salary, immigration, legal or professional guarantee. Verify current requirements with the relevant Nigerian institution or regulator before acting. Generated by Sifter LevelUp.</div>
</div></body></html>"""


def build_report_html(ctx: ReportContext) -> str:
    if ctx.full_path:
        return build_full_guidance_report_html(ctx)
    e = _html_text
    skills = "".join(f"<li>{e(s)}</li>" for s in ctx.foundation_skills[:12]) or "<li>No mapped foundation skills are available yet.</li>"
    roles = "".join(f"<li>{e(r)}</li>" for r in ctx.roles[:12]) or "<li>No mapped roles are available yet.</li>"
    direction = e(ctx.domain_name or "Career direction to be chosen")
    desc = f"<p class='desc'>{e(ctx.domain_description)}</p>" if ctx.domain_description else ""
    programme = (
        f"<div class='block'><h2>Recommended programme</h2><p>{e(ctx.programme_name)}</p></div>"
        if ctx.programme_name else ""
    )
    admission = (
        f"<div class='block'><h2>Admission context</h2><p>{e(ctx.admission_note)}</p></div>"
        if ctx.admission_note else ""
    )
    school = f"<div class='school'>{e(ctx.school_name)}</div>" if ctx.school_name else ""
    watermark = "Sifter LevelUp" + (f" - {ctx.school_name}" if ctx.school_name else "")
    meta = " / ".join(part for part in [ctx.student_class, ctx.stream] if part)
    cls = f" / {e(meta)}" if meta else ""

    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Career pathway plan - {e(ctx.student_name)}</title>
<style>
  @media print {{ @page {{ margin: 18mm; }} }}
  .toolbar {{ position: sticky; top: 12px; display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px; }}
  .toolbar button {{ border: 1px solid #bbb; border-radius: 6px; background: #fff; padding: 8px 12px; cursor: pointer; user-select: auto; -webkit-user-select: auto; }}
  @media print {{ .toolbar {{ display: none; }} }}
  body {{ font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 720px;
         margin: 0 auto; padding: 32px; line-height: 1.55; user-select: none;
         -webkit-user-select: none; -webkit-user-drag: none; }}
  .watermark {{ position: fixed; top: 42%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg);
         font-family: Arial, sans-serif; font-size: 42px; font-weight: 800; letter-spacing: 2px;
         color: rgba(31, 94, 255, 0.08); white-space: nowrap; z-index: 0; pointer-events: none; }}
  .content {{ position: relative; z-index: 1; }}
  .head {{ border-bottom: 2px solid #1a1a1a; padding-bottom: 14px; margin-bottom: 22px; }}
  .school {{ font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #666; }}
  h1 {{ font-size: 26px; margin: 6px 0 2px; }}
  .sub {{ color: #555; font-size: 14px; }}
  h2 {{ font-size: 15px; text-transform: uppercase; letter-spacing: .5px; color: #333;
        border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 26px 0 10px; }}
  .direction {{ font-size: 20px; font-weight: bold; margin: 4px 0; }}
  .desc {{ color: #444; }}
  ul {{ margin: 8px 0; padding-left: 22px; }}
  ol {{ margin: 8px 0; padding-left: 22px; }}
  li {{ margin: 3px 0; }}
  .block {{ margin-top: 8px; }}
  .foot {{ margin-top: 34px; padding-top: 12px; border-top: 1px solid #ddd;
           font-size: 11px; color: #888; }}
</style></head>
<body>
  <div class="toolbar"><button onclick="window.print()">Print / save PDF</button></div>
  <div class="watermark">{e(watermark)}</div>
  <div class="content">
  <div class="head">
    {school}
    {f"<div class='sub'>{e(ctx.student_identity_label)}:</div>" if ctx.student_identity_label else ""}
    <h1>{e(ctx.student_name)}</h1>
    <div class="sub">Career pathway plan{cls}</div>
  </div>

  <h2>Direction</h2>
  <div class="direction">{direction}</div>
  {desc}

  <h2>Build next</h2>
  <ul>{skills}</ul>

  <h2>Possible role directions</h2>
  <ul>{roles}</ul>

  {programme}
  {admission}

  <h2>How to use this plan</h2>
  <ol>
    <li>Use the direction and programme sections to confirm the next academic decision.</li>
    <li>Build the listed skills through lessons, projects, or supervised practice.</li>
    <li>Recheck current institution requirements before submitting an application.</li>
  </ol>

  <div class="foot">
    Prepared {e(ctx.generated_on)} by Sifter LevelUp. This plan is based on
    the selected programme and mapped taxonomy; it is not an admission offer or
    legal, financial, immigration or professional advice. Verify current
    requirements with the relevant Nigerian institution or regulator.
  </div>
  </div>
</body></html>"""


# ─────────────────────────────────────────────────────────────
# Login card (detachable — credential lives here, not in the report)
# ─────────────────────────────────────────────────────────────

def build_login_card_html(
    student_name: str,
    claim_code: str,
    school_name: Optional[str] = None,
    student_class: Optional[str] = None,
    stream: Optional[str] = None,
) -> str:
    e = html.escape
    school = f"<div class='school'>{e(school_name)}</div>" if school_name else ""
    meta = " · ".join(part for part in [student_class, stream] if part)
    cls = f" · {e(meta)}" if meta else ""
    claim_url = f"https://levelup.com.ng/settings/my-school?claim={quote(claim_code)}"
    qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + quote(claim_url, safe="")
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Login card — {e(student_name)}</title>
<style>
  body {{ font-family: Georgia, serif; padding: 32px; }}
  .card {{ max-width: 420px; margin: 0 auto; border: 2px dashed #1a1a1a; border-radius: 12px;
           padding: 28px; text-align: center; }}
  .school {{ font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #666; }}
  .name {{ font-size: 20px; font-weight: bold; margin: 6px 0 2px; }}
  .sub {{ color: #555; font-size: 13px; margin-bottom: 18px; }}
  .label {{ font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #888; }}
  .code {{ font-family: 'Courier New', monospace; font-size: 34px; font-weight: bold;
           letter-spacing: 6px; margin: 6px 0 14px; }}
  .how {{ font-size: 12px; color: #555; line-height: 1.5; }}
  .qr {{ width: 180px; height: 180px; margin: 14px auto; display: block; }}
</style></head>
<body>
  <div class="card">
    {school}
    <div class="name">{e(student_name)}</div>
    <div class="sub">Sifter LevelUp{cls}</div>
    <div class="label">Your claim code</div>
    <div class="code">{e(claim_code)}</div>
    <img class="qr" src="{e(qr_url)}" alt="Scan to open the claim page" />
    <div class="how">
      Scan the code or open Sifter LevelUp → Settings → My School → “Have a claim
      code?” and enter this code to make your account yours. Keep this card private.
    </div>
  </div>
</body></html>"""


# ─────────────────────────────────────────────────────────────
# DOCX report (stdlib zipfile — no python-docx dependency)
# ─────────────────────────────────────────────────────────────

def _p(text: str, bold: bool = False, size: Optional[int] = None, heading: bool = False) -> str:
    """One Word paragraph (Office Open XML). size is half-points (e.g. 28 = 14pt)."""
    runs_props = ""
    if bold:
        runs_props += "<w:b/>"
    if size:
        runs_props += f'<w:sz w:val="{size}"/>'
    rpr = f"<w:rPr>{runs_props}</w:rPr>" if runs_props else ""
    ppr = '<w:pPr><w:spacing w:before="160" w:after="60"/></w:pPr>' if heading else ""
    return (
        f"<w:p>{ppr}<w:r>{rpr}"
        f'<w:t xml:space="preserve">{_xml(text)}</w:t></w:r></w:p>'
    )


def _bullet(text: str) -> str:
    return (
        '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
        f'<w:r><w:t xml:space="preserve">{_xml(text)}</w:t></w:r></w:p>'
    )


def _xml(text: str) -> str:
    # XML 1.0 forbids most C0 control characters. Drop them before escaping so
    # user-provided usernames and saved labels cannot make a DOCX unreadable.
    text = _clean_report_text(text)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def build_report_docx(ctx: ReportContext) -> bytes:
    if ctx.full_path:
        return build_full_guidance_report_docx(ctx)
    body_parts: List[str] = []
    if ctx.school_name:
        body_parts.append(_p(ctx.school_name, size=18))
    if ctx.student_identity_label:
        body_parts.append(_p(f"{ctx.student_identity_label}:"))
    body_parts.append(_p(ctx.student_name, bold=True, size=36))
    meta = " / ".join(part for part in [ctx.student_class, ctx.stream] if part)
    sub = "Career pathway plan" + (f" / {meta}" if meta else "")
    body_parts.append(_p(sub, size=22))

    body_parts.append(_p("Direction", bold=True, size=26, heading=True))
    body_parts.append(_p(ctx.domain_name or "Career direction to be chosen", bold=True, size=28))
    if ctx.domain_description:
        body_parts.append(_p(ctx.domain_description))

    body_parts.append(_p("Build next", bold=True, size=26, heading=True))
    if ctx.foundation_skills:
        body_parts += [_bullet(s) for s in ctx.foundation_skills[:12]]
    else:
        body_parts.append(_bullet("No mapped foundation skills are available yet."))

    body_parts.append(_p("Where this leads — roles", bold=True, size=26, heading=True))
    if ctx.roles:
        body_parts += [_bullet(r) for r in ctx.roles[:12]]
    else:
        body_parts.append(_bullet("No mapped roles are available yet."))

    if ctx.programme_name:
        body_parts.append(_p("Recommended programme", bold=True, size=26, heading=True))
        body_parts.append(_p(ctx.programme_name))
    if ctx.admission_note:
        body_parts.append(_p("Admission context", bold=True, size=26, heading=True))
        body_parts.append(_p(ctx.admission_note))

    body_parts.append(_p(
        f"Generated {ctx.generated_on} by Sifter LevelUp. Guidance is based on "
        "the selected programme and mapped taxonomy; it is not an admission offer "
        "or legal, financial, immigration or professional advice. Verify current "
        "requirements with the relevant Nigerian institution or regulator.",
        size=16,
    ))

    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f'<w:body>{"".join(body_parts)}'
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr>'
        '</w:body></w:document>'
    )

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", _CONTENT_TYPES)
        z.writestr("_rels/.rels", _ROOT_RELS)
        z.writestr("word/_rels/document.xml.rels", _DOC_RELS)
        z.writestr("word/numbering.xml", _NUMBERING)
        z.writestr("word/document.xml", document_xml)
    return buf.getvalue()


def build_full_guidance_report_docx(ctx: ReportContext) -> bytes:
    """Editable full-path equivalent of the HTML guidance report."""
    path = ctx.full_path
    academic = path.get("academicContext") or {}
    subjects = path.get("subjects") or {}
    programme = path.get("programme") or {}
    university = path.get("university") or {}
    attached_institution = path.get("attachedInstitution") or {}
    d078_route = _d078_saved_route(path)
    parts: List[str] = []
    parts.append(_p("Sifter LevelUp", bold=True, size=30))
    if ctx.student_identity_label:
        parts.append(_p(f"{ctx.student_identity_label}:"))
    parts.append(_p(ctx.student_name, bold=True, size=36))
    parts.append(_p(_report_title(academic), size=22))
    parts.append(_p("Watermark: Sifter LevelUp" + (f" - {academic.get('schoolName')}" if academic.get("schoolName") else ""), size=16))

    parts.append(_p("Your guidance context", bold=True, size=26, heading=True))
    for label, value in ((
        ("Student type", academic.get("userType")),
        ("Class", academic.get("class")),
        ("Stream", academic.get("stream")),
        ("School", academic.get("schoolName")),
        ("Tutorial centre", academic.get("tutorialCentreName")),
        (
            "Attached institution",
            f"{attached_institution.get('institutionTypeLabel')}: {attached_institution.get('name')}"
            if attached_institution.get("name") and attached_institution.get("institutionTypeLabel")
            else None,
        ),
    )):
        if value:
            parts.append(_p(f"{label}: {value}"))

    parts.append(_p("Subjects you entered", bold=True, size=26, heading=True))
    for label, values in (("O-level subjects", subjects.get("olevel")), ("UTME subjects", subjects.get("utme"))):
        parts.append(_p(label, bold=True, size=20))
        parts.extend(_bullet(str(value)) for value in (values or ["None recorded"]))

    parts.append(_p("Programme context" if d078_route and not university.get("name") else "Programme and university", bold=True, size=26, heading=True))
    saved_programmes = [(programme, university)] if d078_route and programme else _saved_programmes(path)
    for saved_programme, saved_university in saved_programmes:
        parts.append(_p(f"Programme: {saved_programme.get('name') or 'Programme not confirmed'}"))
        if saved_university.get("name"):
            parts.append(_p(f"University: {saved_university.get('name')}"))
        elif d078_route:
            parts.append(_p("University-specific admission requirements are not included in this saved learning route."))
        else:
            parts.append(_p("University: Not confirmed"))
        if saved_university.get("address"):
            parts.append(_p(f"Address: {saved_university.get('address')}"))

    if path.get("accessCode"):
        parts.append(_p("Student access", bold=True, size=26, heading=True))
        parts.append(_p(f"Access code: {path.get('accessCode')}"))
        parts.append(_p("Keep this code private. The printable HTML report also includes a QR link to the claim page."))

    if not (d078_route and not university.get("name")):
        parts.append(_p("Admission requirements", bold=True, size=26, heading=True))
        requirement_rows = _guidance_requirement_rows(path)
        if requirement_rows:
            for label, value in requirement_rows:
                parts.append(_p(f"{label}: {value}"))
        else:
            parts.append(_p("Published requirement details were not available for this selection."))

        subject_status, subject_status_text = _subject_match_status(path)
        parts.append(_p("Subject check status", bold=True, size=26, heading=True))
        parts.append(_p(f"{subject_status}: {subject_status_text}"))

    parts.append(_p("Selected intelligence path", bold=True, size=26, heading=True))
    if d078_route:
        for index, (_stack_id, route) in enumerate(_d078_saved_routes(path), start=1):
            parts.append(_p(f"Saved D078 route {index}: Sociology to Social Sciences & Behavioural Research", bold=True, size=24, heading=True))
            parts.append(_p("This records your choices. Selection does not show mastery or make a method a job requirement."))
            for title, key in (("Field foundations", "foundations"), ("Selected methods", "methods"), ("Selected combinations", "combinations"), ("Methods within selected combinations", "components"), ("Items you added", "added_items")):
                parts.append(_p(title, bold=True, size=20))
                parts.extend(_bullet(value) for value in route[key])
                if not route[key]:
                    parts.append(_p("None selected or recorded."))
            if route["area"]:
                parts.append(_p(f"Area: {route['area']}"))
            if route["role"]:
                parts.append(_p(f"Role: {route['role']}"))
            parts.append(_p(f"Stop point: {route['stop_point']}"))
    for domain in ([] if d078_route else path.get("domains") or []):
        parts.append(_p(
            f"{domain.get('name') or 'Selected domain'} ({domain.get('matchType') or 'selected'})",
            bold=True, size=24, heading=True,
        ))
        if domain.get("description"):
            parts.append(_p(str(domain["description"])))
        for label, values in (("Domain competencies", domain.get("skills")), ("Domain tools", domain.get("tools")), ("Domain certifications", domain.get("certifications"))):
            parts.append(_p(label, bold=True, size=20))
            if label == "Domain tools":
                values = [v.get("name") for v in (values or []) if isinstance(v, dict)]
            elif label == "Domain certifications":
                values = [v.get("name") for v in (values or []) if isinstance(v, dict)]
            parts.extend(_bullet(str(value)) for value in (values or ["None recorded"]))
        for subgroup in domain.get("subgroups") or []:
            parts.append(_p(f"Sub-group: {subgroup.get('name') or 'Selected sub-group'}", bold=True, size=22, heading=True))
            if subgroup.get("description"):
                parts.append(_p(str(subgroup["description"])))
            parts.extend(_bullet(str(value)) for value in (subgroup.get("skills") or ["No competencies recorded"]))
            parts.extend(_bullet(f"Tool: {value.get('name')}") for value in (subgroup.get("tools") or []) if isinstance(value, dict) and value.get("name"))
            parts.extend(_bullet(f"Certification: {value.get('name')}") for value in (subgroup.get("certifications") or []) if isinstance(value, dict) and value.get("name"))
        for role in domain.get("roles") or []:
            parts.append(_p(f"Role: {role.get('name') or 'Selected role'}", bold=True, size=22, heading=True))
            role_skills = role.get("skills") or {}
            parts.extend(_bullet(f"Essential: {value}") for value in (role_skills.get("essential") or []))
            parts.extend(_bullet(f"Supplementary: {value}") for value in (role_skills.get("supplementary") or []))
            parts.extend(_bullet(f"Tool: {value.get('name')}") for value in (role.get("tools") or []) if isinstance(value, dict) and value.get("name"))
            parts.extend(_bullet(f"Certification: {value.get('name')}") for value in (role.get("certifications") or []) if isinstance(value, dict) and value.get("name"))

    parts.append(_p(
        f"Generated {ctx.generated_on} by Sifter LevelUp. This report includes only the branches selected during guidance. It is not an admission, employment, salary, immigration, legal or professional guarantee; verify current requirements with the relevant Nigerian institution or regulator.",
        size=16,
    ))
    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f'<w:body>{"".join(parts)}'
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr>'
        '</w:body></w:document>'
    )
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", _CONTENT_TYPES)
        z.writestr("_rels/.rels", _ROOT_RELS)
        z.writestr("word/_rels/document.xml.rels", _DOC_RELS)
        z.writestr("word/numbering.xml", _NUMBERING)
        z.writestr("word/document.xml", document_xml)
    return buf.getvalue()


_CONTENT_TYPES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/word/document.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    '<Override PartName="/word/numbering.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>'
    '</Types>'
)

_ROOT_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    'Target="word/document.xml"/></Relationships>'
)

_DOC_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" '
    'Target="numbering.xml"/></Relationships>'
)

_NUMBERING = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    '<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0">'
    '<w:numFmt w:val="bullet"/><w:lvlText w:val="•"/>'
    '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>'
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'
)
