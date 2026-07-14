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
    generated_on: str = ""  # caller stamps this (Date is unavailable in some contexts)


# ─────────────────────────────────────────────────────────────
# HTML report (print-to-PDF)
# ─────────────────────────────────────────────────────────────

def build_report_html(ctx: ReportContext) -> str:
    e = html.escape
    skills = "".join(f"<li>{e(s)}</li>" for s in ctx.foundation_skills[:12]) or "<li>To be mapped</li>"
    roles = "".join(f"<li>{e(r)}</li>" for r in ctx.roles[:12]) or "<li>To be mapped</li>"
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
    meta = " · ".join(part for part in [ctx.student_class, ctx.stream] if part)
    cls = f" · {e(meta)}" if meta else ""

    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Career Report — {e(ctx.student_name)}</title>
<style>
  @media print {{ @page {{ margin: 18mm; }} }}
  body {{ font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 720px;
         margin: 0 auto; padding: 32px; line-height: 1.55; }}
  .head {{ border-bottom: 2px solid #1a1a1a; padding-bottom: 14px; margin-bottom: 22px; }}
  .school {{ font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #666; }}
  h1 {{ font-size: 26px; margin: 6px 0 2px; }}
  .sub {{ color: #555; font-size: 14px; }}
  h2 {{ font-size: 15px; text-transform: uppercase; letter-spacing: .5px; color: #333;
        border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 26px 0 10px; }}
  .direction {{ font-size: 20px; font-weight: bold; margin: 4px 0; }}
  .desc {{ color: #444; }}
  ul {{ margin: 8px 0; padding-left: 22px; }}
  li {{ margin: 3px 0; }}
  .block {{ margin-top: 8px; }}
  .foot {{ margin-top: 34px; padding-top: 12px; border-top: 1px solid #ddd;
           font-size: 11px; color: #888; }}
</style></head>
<body>
  <div class="head">
    {school}
    <h1>{e(ctx.student_name)}</h1>
    <div class="sub">Career pathway report{cls}</div>
  </div>

  <h2>Your direction</h2>
  <div class="direction">{direction}</div>
  {desc}

  <h2>Foundation skills to build</h2>
  <ul>{skills}</ul>

  <h2>Where this leads — roles</h2>
  <ul>{roles}</ul>

  {programme}
  {admission}

  <div class="foot">
    Generated {e(ctx.generated_on)} by Sifter LevelUp. This report maps your chosen
    direction to the skills and roles it unlocks. Labour-market demand figures are
    added as they are published.
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
</style></head>
<body>
  <div class="card">
    {school}
    <div class="name">{e(student_name)}</div>
    <div class="sub">Sifter LevelUp{cls}</div>
    <div class="label">Your claim code</div>
    <div class="code">{e(claim_code)}</div>
    <div class="how">
      Open Sifter LevelUp → Settings → My School → “Have a claim code?” and enter
      this code to make your account yours. Keep this card private.
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
    body_parts: List[str] = []
    if ctx.school_name:
        body_parts.append(_p(ctx.school_name, size=18))
    body_parts.append(_p(ctx.student_name, bold=True, size=36))
    meta = " · ".join(part for part in [ctx.student_class, ctx.stream] if part)
    sub = "Career pathway report" + (f" · {meta}" if meta else "")
    body_parts.append(_p(sub, size=22))

    body_parts.append(_p("Your direction", bold=True, size=26, heading=True))
    body_parts.append(_p(ctx.domain_name or "Career direction to be chosen", bold=True, size=28))
    if ctx.domain_description:
        body_parts.append(_p(ctx.domain_description))

    body_parts.append(_p("Foundation skills to build", bold=True, size=26, heading=True))
    if ctx.foundation_skills:
        body_parts += [_bullet(s) for s in ctx.foundation_skills[:12]]
    else:
        body_parts.append(_bullet("To be mapped"))

    body_parts.append(_p("Where this leads — roles", bold=True, size=26, heading=True))
    if ctx.roles:
        body_parts += [_bullet(r) for r in ctx.roles[:12]]
    else:
        body_parts.append(_bullet("To be mapped"))

    if ctx.programme_name:
        body_parts.append(_p("Recommended programme", bold=True, size=26, heading=True))
        body_parts.append(_p(ctx.programme_name))
    if ctx.admission_note:
        body_parts.append(_p("Admission context", bold=True, size=26, heading=True))
        body_parts.append(_p(ctx.admission_note))

    body_parts.append(_p(
        f"Generated {ctx.generated_on} by Sifter LevelUp. Labour-market demand "
        "figures are added as they are published.",
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
