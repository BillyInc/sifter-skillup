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
import zipfile
from urllib.parse import quote
from typing import List, Optional

from pydantic import BaseModel, Field


class ReportContext(BaseModel):
    """Everything needed to render a report — resolved from the taxonomy, no PII
    beyond name/class and no academic record."""
    student_name: str
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


def build_full_guidance_report_html(ctx: ReportContext) -> str:
    """Render the complete selected path without importing unselected data."""
    e = html.escape
    path = ctx.full_path
    academic = path.get("academicContext") or {}
    subjects = path.get("subjects") or {}
    programme = path.get("programme") or {}
    university = path.get("university") or {}
    requirements = path.get("requirements") or {}
    domains = path.get("domains") or []
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
        )) if value
    )
    requirement_rows = "".join(
        f"<div class='row'><strong>{e(str(key))}</strong><span>{e(str(value))}</span></div>"
        for key, value in requirements.items() if value not in (None, "", [])
    ) or "<p class='muted'>The published requirement details were not available for this selection.</p>"
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
            <div class='entity-kicker'>{e(str(domain.get('matchType') or 'Selected domain'))}</div>
            <h3>{e(str(domain.get('name') or 'Selected domain'))}</h3>
            <p>{e(str(domain.get('description') or ''))}</p>
            <h4>Domain competencies</h4><ul>{_html_list(domain.get('skills'))}</ul>
            <h4>Domain tools</h4><ul>{_html_tools(domain.get('tools'))}</ul>
            <h4>Domain certifications</h4><ul>{_html_certs(domain.get('certifications'))}</ul>
            {('<h4>Selected sub-groups</h4>' + ''.join(subgroup_blocks)) if subgroup_blocks else '<p class="muted">No sub-group was selected under this domain.</p>'}
            {('<h4>Selected roles</h4>' + ''.join(role_blocks)) if role_blocks else '<p class="muted">No role was selected under this domain.</p>'}
          </section>""")
    domains_html = "".join(domain_blocks) or "<p class='muted'>No domain, sub-group, or role has been selected for this report yet.</p>"
    school = academic.get("schoolName") or ctx.school_name
    return f"""<!doctype html>
<html><head><meta charset='utf-8'><title>Guidance report - {e(ctx.student_name)}</title>
<style>
@media print {{ @page {{ margin: 16mm; }} .toolbar {{ display:none; }} .page-break {{ break-before: page; }} }}
body {{ font-family: Arial, sans-serif; color:#202124; max-width:820px; margin:0 auto; padding:28px; line-height:1.45; }}
.watermark {{ position:fixed; top:44%; left:50%; transform:translate(-50%,-50%) rotate(-28deg); color:rgba(242,137,0,.10); font-size:42px; font-weight:800; white-space:nowrap; pointer-events:none; }}
.content {{ position:relative; z-index:1; }} .toolbar {{ text-align:right; margin-bottom:18px; }}
button {{ padding:9px 14px; border:1px solid #bbb; border-radius:6px; background:#fff; }}
.head {{ border-bottom:2px solid #202124; padding-bottom:14px; }} h1 {{ margin:4px 0; font-size:28px; }}
h2 {{ margin-top:28px; border-bottom:1px solid #ddd; padding-bottom:6px; }} h3 {{ margin-bottom:4px; font-size:21px; }}
h4 {{ margin:18px 0 6px; font-size:14px; text-transform:uppercase; letter-spacing:.5px; }} h5 {{ margin:12px 0 3px; font-size:13px; }}
.eyebrow,.entity-kicker {{ color:#8b5700; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }}
.row {{ display:grid; grid-template-columns:minmax(150px, .35fr) 1fr; gap:14px; padding:6px 0; border-bottom:1px solid #eee; }}
.entity {{ margin-top:18px; padding:16px; border:1px solid #ddd; border-radius:6px; }} .nested {{ margin-top:12px; background:#fafafa; }}
ul {{ margin:5px 0 10px; padding-left:22px; }} li {{ margin:3px 0; }} .muted {{ color:#5f6368; }}
.foot {{ margin-top:30px; padding-top:12px; border-top:1px solid #ddd; font-size:11px; color:#5f6368; }}
</style></head><body><div class='toolbar'><button onclick='window.print()'>Print / save PDF</button></div>
<div class='watermark'>{e(watermark)}</div><div class='content'>
<header class='head'><div class='eyebrow'>{e(str(school or 'Sifter LevelUp'))}</div><h1>{e(ctx.student_name)}</h1><div class='muted'>Full guidance report - generated {e(ctx.generated_on)}</div></header>
<h2>Your guidance context</h2><div>{context_rows or '<p class="muted">No additional academic context was recorded.</p>'}</div>
<h2>Subjects you entered</h2><div>{subject_rows or '<p class="muted">No subjects were recorded.</p>'}</div>
<h2>Programme and university</h2><div class='entity'><h3>{e(str(programme.get('name') or 'Programme not confirmed'))}</h3><p><strong>University:</strong> {e(str(university.get('name') or 'Not confirmed'))}</p><p><strong>Discovery door:</strong> {e(str(path.get('discoveryDoor') or 'Not recorded'))}</p></div>
<h2>Admission requirements</h2><div>{requirement_rows}</div>
<h2>Selected intelligence path</h2>{domains_html}
<div class='foot'>This report contains the source-backed selections made during guidance. It does not include unselected catalogue entities, unsupported demand claims, or Post-UTME claims. Guidance is not an admission, employment, salary, immigration, legal or professional guarantee. Verify current requirements with the relevant Nigerian institution or regulator before acting. Generated by Sifter LevelUp.</div>
</div></body></html>"""


def build_report_html(ctx: ReportContext) -> str:
    if ctx.full_path:
        return build_full_guidance_report_html(ctx)
    e = html.escape
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
  .toolbar button {{ border: 1px solid #bbb; border-radius: 6px; background: #fff; padding: 8px 12px; cursor: pointer; }}
  @media print {{ .toolbar {{ display: none; }} }}
  body {{ font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 720px;
         margin: 0 auto; padding: 32px; line-height: 1.55; }}
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
    return (
        (text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def build_report_docx(ctx: ReportContext) -> bytes:
    if ctx.full_path:
        return build_full_guidance_report_docx(ctx)
    body_parts: List[str] = []
    if ctx.school_name:
        body_parts.append(_p(ctx.school_name, size=18))
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
    requirements = path.get("requirements") or {}
    parts: List[str] = []
    parts.append(_p("Sifter LevelUp", bold=True, size=30))
    parts.append(_p(ctx.student_name, bold=True, size=36))
    parts.append(_p("Full guidance report", size=22))
    parts.append(_p("Watermark: Sifter LevelUp" + (f" - {academic.get('schoolName')}" if academic.get("schoolName") else ""), size=16))

    parts.append(_p("Your guidance context", bold=True, size=26, heading=True))
    for label, value in ((
        ("Student type", academic.get("userType")),
        ("Class", academic.get("class")),
        ("Stream", academic.get("stream")),
        ("School", academic.get("schoolName")),
        ("Tutorial centre", academic.get("tutorialCentreName")),
    )):
        if value:
            parts.append(_p(f"{label}: {value}"))

    parts.append(_p("Subjects you entered", bold=True, size=26, heading=True))
    for label, values in (("O-level subjects", subjects.get("olevel")), ("UTME subjects", subjects.get("utme"))):
        parts.append(_p(label, bold=True, size=20))
        parts.extend(_bullet(str(value)) for value in (values or ["None recorded"]))

    parts.append(_p("Programme and university", bold=True, size=26, heading=True))
    parts.append(_p(f"Programme: {programme.get('name') or 'Programme not confirmed'}"))
    parts.append(_p(f"University: {university.get('name') or 'Not confirmed'}"))

    parts.append(_p("Admission requirements", bold=True, size=26, heading=True))
    if requirements:
        for key, value in requirements.items():
            if value not in (None, "", []):
                parts.append(_p(f"{key}: {value}"))
    else:
        parts.append(_p("Published requirement details were not available for this selection."))

    parts.append(_p("Selected intelligence path", bold=True, size=26, heading=True))
    for domain in path.get("domains") or []:
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
