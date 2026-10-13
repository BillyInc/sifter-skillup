from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT = Path(__file__).resolve().parent

NAME = "PETER SAMUEL CHINEDU"
CONTACT = "+234 905 594 2020 | ptrsamuelchinedu@gmail.com | Lagos, Nigeria"


BASE = {
    "education": [
        (
            "M.Sc. Sociology",
            "University of Lagos, Akoka, Lagos State | 2024-2025 | CGPA: 4.04/5.00",
            'Thesis: "Economic Risks of Cryptocurrency Trading Among Youths in Yaba LCDA."',
        ),
        (
            "B.Sc. Sociology",
            "Delta State University, Abraka | 2016-2021 | CGPA: 3.78/5.00",
            "",
        ),
    ],
    "experience": [
        {
            "title": "Business Administrator",
            "org": "OMB Concept",
            "dates": "Oct 2022-Nov 2024",
            "bullets": [
                "Monitored budgetary activities and reviewed financial transactions to support fiscal responsibility.",
                "Developed and evaluated sales reports used to track performance and inform business decisions.",
            ],
        },
        {
            "title": "Chief Liaison Officer, NYSC",
            "org": "National Youth Service Corps, Ado Ekiti",
            "dates": "Oct 2021-Aug 2022",
            "bullets": [
                "Served as a primary contact for more than 100 corps members, NYSC management and external agencies.",
                "Mediated disputes and helped improve the flow of important information between stakeholders.",
            ],
        },
        {
            "title": "Class Teacher",
            "org": "De Tee Group of Schools",
            "dates": "Sep 2017-Nov 2017",
            "bullets": [
                "Designed and delivered educational activities supporting students' social and intellectual development.",
            ],
        },
    ],
    "leadership": [
        "Tutorial Instructor and Academic Mentor, Delta State University, Abraka | 2017-2021",
        "Course Representative, MSc Sociology, University of Lagos | 2024-2025",
        "Course Representative and Student Faculty Librarian, BSc Sociology, Delta State University | 2018-2020",
        "Secondary-school teaching experience across two teaching assignments.",
    ],
    "education_detail": [
        "Crypto market participant and critical observer | 2021-present",
        "MSc research grounded in thematic analysis, digital ethnographic observation and analysis of social and governance dynamics in decentralized digital economies.",
    ],
}


PROJECTS = {
    "sifter": {
        "name": "Sifter LevelUp",
        "role": "Product Concept Co-builder | Creation stage | Nov 2025-present",
        "bullets": [
            "Shaped the concept and product direction for a Duolingo-style learning app focused on crypto literacy and quant finance.",
            "Defined learning paths, lesson structure, progress experiences, career guidance and user-facing product flows.",
            "Used AI-assisted building and iterative product refinement with a technical cofounder who handled production coding.",
        ],
    },
    "ledgerlens": {
        "name": "LedgerLens",
        "role": "Product Co-builder | Nov 2025-present",
        "bullets": [
            "Defined a mobile-first, offline-capable evidence-to-books product for informal and semi-formal businesses.",
            "Mapped workflows for paper, voice, photo, PDF and screenshot capture into sales, stock, cash, credit, reconciliation and reporting records.",
            "Refined the product around evidence preservation, focused corrections, exception handling and auditability; technical implementation was led by a cofounder.",
        ],
    },
    "sna": {
        "name": "Sifter Know Your Spotters",
        "role": "Product and Concept Co-builder | Nov 2025-present",
        "bullets": [
            "Shaped a Solana token analytics prototype covering wallet monitoring, caller analysis, paper trading, leaderboards and Telegram alerts.",
            "Applied six years of crypto market knowledge to user scenarios, risk considerations and product-behavior refinement.",
            "Presented accurately as a portfolio prototype; production coding was handled by the technical cofounder.",
        ],
    },
}


VARIANTS = {
    "master": {
        "filename": "Peter_Chinedu_Master_Product_Builder_CV.docx",
        "compact": True,
        "label": "AI-ASSISTED PRODUCT BUILDER | PRODUCT RESEARCH AND WORKFLOW DESIGN",
        "summary": (
            "AI-assisted product builder and Sociology researcher with portfolio work across education technology, "
            "accounting workflows and crypto analytics. Since November 2025, I have worked with a technical cofounder "
            "to shape product concepts, user problems, workflows, requirements and refinements; my cofounder handled "
            "production coding. I bring six years of crypto-market experience, an MSc research background, business "
            "administration experience, teaching and mentoring experience, and stakeholder liaison work."
        ),
        "skills": [
            "Product concept development and user-problem framing",
            "Workflow mapping, requirements and product documentation",
            "AI-assisted prototyping and iterative product refinement",
            "Qualitative research, thematic analysis and digital ethnography",
            "Budget monitoring, sales reporting and business administration",
            "Stakeholder liaison, mediation, communication and presentation",
            "Microsoft Office Suite; basic HTML, CSS and JavaScript; graphics design",
        ],
        "project_order": ["sifter", "ledgerlens", "sna"],
    },
    "product_operations": {
        "filename": "Peter_Chinedu_Product_Operations_CV.docx",
        "compact": False,
        "label": "PRODUCT OPERATIONS | WORKFLOW DESIGN | STAKEHOLDER COORDINATION",
        "summary": (
            "Product and workflow builder with experience turning messy user and business problems into clearer product "
            "flows, requirements and operating ideas. Portfolio work includes an evidence-to-books accounting product, "
            "a learning platform and a crypto analytics prototype. I have six years of crypto-market experience, prior "
            "business administration experience, and NYSC liaison experience supporting more than 100 corps members. "
            "I work with a technical cofounder who leads production coding."
        ),
        "skills": [
            "Workflow mapping and process improvement",
            "User-problem framing, requirements and acceptance thinking",
            "Product documentation and edge-case review",
            "Reconciliation, exception and information-flow concepts",
            "Performance reporting and budget monitoring",
            "Stakeholder coordination, mediation and follow-through",
            "AI-assisted prototyping; Microsoft Office; basic HTML, CSS and JavaScript",
        ],
        "project_order": ["ledgerlens", "sifter", "sna"],
    },
    "ai_education_research": {
        "filename": "Peter_Chinedu_AI_Education_Research_CV.docx",
        "compact": False,
        "label": "AI PRODUCT EDUCATION | USER RESEARCH | LEARNING PRODUCT DESIGN",
        "summary": (
            "Sociology researcher and AI-assisted product builder focused on how people learn, make decisions and use "
            "digital products. I have taught in secondary-school settings across two assignments, served as a tutorial "
            "instructor and academic mentor, and shaped Sifter LevelUp, a learning product for crypto literacy and quant "
            "finance. My MSc research examined the economic risks of cryptocurrency trading among youths in Yaba LCDA."
        ),
        "skills": [
            "Learning-flow and curriculum concept design",
            "Clear explanation of technical and financial concepts",
            "Qualitative research, thematic analysis and digital ethnography",
            "Interview, observation and user-insight framing",
            "Academic mentoring, teaching and community communication",
            "AI-assisted content and workflow prototyping",
            "Microsoft Office; basic HTML, CSS and JavaScript",
        ],
        "project_order": ["sifter", "ledgerlens", "sna"],
    },
    "founder_associate": {
        "filename": "Peter_Chinedu_Founder_Associate_Operations_CV.docx",
        "compact": False,
        "label": "FOUNDER ASSOCIATE | PRODUCT OPERATIONS | RESEARCH AND EXECUTION",
        "summary": (
            "Generalist product builder with experience developing concepts, researching user problems, structuring "
            "workflows and communicating across stakeholders. I combine six years of crypto-market exposure with an MSc "
            "in Sociology, business administration experience and NYSC liaison work involving more than 100 corps members. "
            "Since November 2025, I have collaborated with a technical cofounder on AI-assisted product development."
        ),
        "skills": [
            "Market and user-problem research",
            "Founder collaboration, action tracking and documentation",
            "Project coordination and workflow structuring",
            "Business administration, budget monitoring and reporting",
            "Stakeholder liaison, mediation and written communication",
            "Product concept development and AI-assisted prototyping",
            "Microsoft Office; basic HTML, CSS and JavaScript",
        ],
        "project_order": ["ledgerlens", "sifter", "sna"],
    },
    "product_marketing": {
        "filename": "Peter_Chinedu_Product_Marketing_Customer_Insight_CV.docx",
        "compact": False,
        "label": "PRODUCT MARKETING | CUSTOMER INSIGHT | PRODUCT STORYTELLING",
        "summary": (
            "Product builder and Sociology researcher who can translate complex digital products into clear user problems, "
            "workflows and value propositions. I bring six years of crypto-market knowledge, research on youth and digital "
            "economies, business reporting experience, and hands-on product concept work across education, accounting and "
            "crypto analytics. My role has been product direction and refinement, while a technical cofounder handled coding."
        ),
        "skills": [
            "Customer-problem framing and product storytelling",
            "Market observation, competitor thinking and user insight",
            "Product education and plain-language communication",
            "Research synthesis, thematic analysis and digital ethnography",
            "Sales reporting, business administration and stakeholder communication",
            "AI-assisted product and content prototyping",
            "Microsoft Office; basic HTML, CSS and JavaScript; graphics design",
        ],
        "project_order": ["sifter", "ledgerlens", "sna"],
    },
}


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=70, start=90, bottom=70, end=90):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def add_run(paragraph, text, bold=False, italic=False, size=9.6, color=None):
    run = paragraph.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = "Aptos"
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor(*color)
    return run


def add_bullet(doc, text, level=0, size=9.2):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.2 + level * 0.18)
    p.paragraph_format.first_line_indent = Inches(-0.12)
    p.paragraph_format.space_after = Pt(1.5)
    p.paragraph_format.line_spacing = 1.02
    add_run(p, text, size=size)
    return p


def add_section_heading(doc, text, monochrome=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    add_run(p, text.upper(), bold=True, size=9.4, color=(0, 0, 0) if monochrome else (31, 78, 121))
    return p


def add_project(doc, project, monochrome=False):
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    table.columns[0].width = Inches(1.55)
    table.columns[1].width = Inches(5.55)
    row = table.rows[0]
    row.cells[0].width = Inches(1.55)
    row.cells[1].width = Inches(5.55)
    for cell in row.cells:
        set_cell_margins(cell, top=20, bottom=20, start=0, end=80)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    set_cell_shading(row.cells[0], "FFFFFF" if monochrome else "EAF2F8")
    p = row.cells[0].paragraphs[0]
    p.paragraph_format.space_after = Pt(1)
    add_run(p, project["name"], bold=True, size=9.0, color=(0, 0, 0) if monochrome else (31, 78, 121))
    p = row.cells[1].paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    add_run(p, project["role"], bold=True, size=9.1)
    for bullet in project["bullets"]:
        p = row.cells[1].add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Inches(0.17)
        p.paragraph_format.first_line_indent = Inches(-0.1)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.0
        add_run(p, bullet, size=8.75)
    # Remove visible table borders while keeping the two-column alignment.
    tbl = table._tbl
    tbl_pr = tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "nil")
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def build_doc(key, config):
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.48)
    section.bottom_margin = Inches(0.45)
    section.left_margin = Inches(0.62)
    section.right_margin = Inches(0.62)
    section.header_distance = Inches(0.2)
    section.footer_distance = Inches(0.2)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(9.3)
    normal.paragraph_format.space_after = Pt(2)
    normal.paragraph_format.line_spacing = 1.03

    # Header block.
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(1)
    monochrome = config.get("monochrome", False)
    heading_color = (0, 0, 0) if monochrome else (31, 78, 121)
    muted_color = (0, 0, 0) if monochrome else (89, 89, 89)
    add_run(p, NAME, bold=True, size=16, color=heading_color)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(1)
    add_run(p, config["label"], bold=True, size=8.6, color=muted_color)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    add_run(p, CONTACT, size=8.8)

    add_section_heading(doc, "Professional Summary", monochrome=monochrome)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    add_run(p, config["summary"], size=9.25)

    add_section_heading(doc, "Selected Product Work", monochrome=monochrome)
    for project_key in config["project_order"]:
        add_project(doc, PROJECTS[project_key], monochrome=monochrome)

    add_section_heading(doc, "Professional Experience", monochrome=monochrome)
    for item in BASE["experience"]:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.keep_with_next = True
        add_run(p, item["title"], bold=True, size=9.4)
        add_run(p, " | " + item["org"], italic=True, size=9.2)
        add_run(p, " | " + item["dates"], size=9.0, color=muted_color)
        for bullet in item["bullets"]:
            add_bullet(doc, bullet, size=8.95)

    add_section_heading(doc, "Research and Leadership", monochrome=monochrome)
    for item in BASE["education_detail"] + BASE["leadership"]:
        add_bullet(doc, item, size=8.9)

    add_section_heading(doc, "Core Skills", monochrome=monochrome)
    for skill in config["skills"]:
        add_bullet(doc, skill, size=8.9)

    add_section_heading(doc, "Education", monochrome=monochrome)
    for degree, details, thesis in BASE["education"]:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.keep_with_next = True
        add_run(p, degree, bold=True, size=9.25)
        add_run(p, " | " + details, size=9.0)
        if thesis:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.15)
            p.paragraph_format.space_after = Pt(2)
            add_run(p, thesis, italic=True, size=8.8)

    # Footer with a simple page field.
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run(footer, "Peter Samuel Chinedu | Curriculum Vitae", size=7.5, color=(128, 128, 128))

    out = OUT / config["filename"]
    doc.save(out)
    return out


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for key, config in VARIANTS.items():
        print(build_doc(key, config))
