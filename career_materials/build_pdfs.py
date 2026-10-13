from pathlib import Path
import sys
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from career_materials.build_cvs import BASE, CONTACT, NAME, PROJECTS, VARIANTS  # noqa: E402


OUT = ROOT / "career_materials"
BLUE = colors.HexColor("#1F4E79")
LIGHT_BLUE = colors.HexColor("#EAF2F8")
GRAY = colors.HexColor("#595959")


def safe(text):
    return escape(text).replace("\n", "<br/>")


class CVDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, pagesize=letter, **kwargs)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin + 0.2 * inch,
            self.width,
            self.height - 0.2 * inch,
            id="normal",
        )
        self.addPageTemplates([PageTemplate(id="cv", frames=[frame], onPage=self.draw_footer)])

    def draw_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#808080"))
        canvas.drawCentredString(letter[0] / 2, 0.32 * inch, f"Peter Samuel Chinedu | Curriculum Vitae | {doc.page}")
        canvas.restoreState()


def build_pdf(config):
    out = OUT / config["filename"].replace(".docx", ".pdf")
    compact = config.get("compact", False)
    monochrome = config.get("monochrome", False)
    heading_color = colors.black if monochrome else BLUE
    muted_color = colors.black if monochrome else GRAY
    project_fill = colors.white if monochrome else LIGHT_BLUE
    doc = CVDocTemplate(
        str(out),
        leftMargin=0.62 * inch,
        rightMargin=0.62 * inch,
        topMargin=0.40 * inch,
        bottomMargin=0.38 * inch,
        title=f"{NAME} - Curriculum Vitae",
        author=NAME,
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CVName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=16, leading=18, alignment=TA_CENTER, textColor=heading_color, spaceAfter=1))
    styles.add(ParagraphStyle(name="CVLabel", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.2, leading=10, alignment=TA_CENTER, textColor=muted_color, spaceAfter=1))
    styles.add(ParagraphStyle(name="CVContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=10, alignment=TA_CENTER, spaceAfter=3 if compact else 5))
    styles.add(ParagraphStyle(name="Section", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.2, leading=11, textColor=heading_color, spaceBefore=5 if compact else 6, spaceAfter=2 if compact else 3, keepWithNext=True))
    styles.add(ParagraphStyle(name="Body", parent=styles["Normal"], fontName="Helvetica", fontSize=8.55 if compact else 8.8, leading=10.25 if compact else 10.7, spaceAfter=2))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontName="Helvetica", fontSize=8.25 if compact else 8.45, leading=9.7 if compact else 10, spaceAfter=1))
    styles.add(ParagraphStyle(name="SmallItalic", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=8.15 if compact else 8.35, leading=9.5 if compact else 10, leftIndent=0.15 * inch, spaceAfter=2))
    styles.add(ParagraphStyle(name="ProjectName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.55 if compact else 8.65, leading=9.8 if compact else 10, textColor=heading_color, spaceAfter=0))
    styles.add(ParagraphStyle(name="ProjectRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.6 if compact else 8.7, leading=9.7 if compact else 10, spaceAfter=1))
    styles.add(ParagraphStyle(name="CVBullet", parent=styles["Normal"], fontName="Helvetica", fontSize=8.05 if compact else 8.35, leading=9.25 if compact else 9.7, leftIndent=0.13 * inch, firstLineIndent=-0.1 * inch, spaceAfter=1))
    styles.add(ParagraphStyle(name="ExpHead", parent=styles["Normal"], fontName="Helvetica", fontSize=8.85, leading=10.2, spaceAfter=1, keepWithNext=True))

    story = []
    story.append(Paragraph(NAME, styles["CVName"]))
    story.append(Paragraph(safe(config["label"]), styles["CVLabel"]))
    story.append(Paragraph(safe(CONTACT), styles["CVContact"]))

    def section(title):
        story.append(Paragraph(title.upper(), styles["Section"]))

    def bullet(text):
        story.append(Paragraph("- " + safe(text), styles["CVBullet"]))

    section("Professional Summary")
    story.append(Paragraph(safe(config["summary"]), styles["Body"]))

    section("Selected Product Work")
    for project_key in config["project_order"]:
        project = PROJECTS[project_key]
        right = [Paragraph(safe(project["role"]), styles["ProjectRole"])]
        right.extend(Paragraph("- " + safe(b), styles["CVBullet"]) for b in project["bullets"])
        table = Table(
            [[Paragraph(safe(project["name"]), styles["ProjectName"]), right]],
            colWidths=[1.38 * inch, 5.58 * inch],
            hAlign="LEFT",
        )
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), project_fill),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("BOX", (0, 0), (-1, -1), 0, colors.white),
            ("INNERGRID", (0, 0), (-1, -1), 0, colors.white),
        ]))
        story.append(KeepTogether([table, Spacer(1, 0 if compact else 3)]))

    section("Professional Experience")
    for item in BASE["experience"]:
        head = f"<b>{safe(item['title'])}</b> | <i>{safe(item['org'])}</i> | <font color='#595959'>{safe(item['dates'])}</font>"
        story.append(Paragraph(head, styles["ExpHead"]))
        for b in item["bullets"]:
            bullet(b)

    section("Research and Leadership")
    for item in BASE["education_detail"] + BASE["leadership"]:
        bullet(item)

    section("Core Skills")
    for skill in config["skills"]:
        bullet(skill)

    section("Education")
    for degree, details, thesis in BASE["education"]:
        story.append(Paragraph(f"<b>{safe(degree)}</b> | {safe(details)}", styles["Small"]))
        if thesis:
            story.append(Paragraph(safe(thesis), styles["SmallItalic"]))

    doc.build(story)
    return out


if __name__ == "__main__":
    for config in VARIANTS.values():
        print(build_pdf(config))
