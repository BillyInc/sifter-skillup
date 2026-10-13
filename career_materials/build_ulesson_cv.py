from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from career_materials.build_cvs import BASE, PROJECTS, build_doc  # noqa: E402
from career_materials.build_pdfs import build_pdf  # noqa: E402


# Keep the LevelUp description specific to the uLesson application while preserving
# the accurate boundary between product ownership and production engineering.
PROJECTS["sifter"] = {
    "name": "Sifter LevelUp",
    "role": "Product Co-builder | Nov 2025-present",
    "bullets": [
        "Conceived and shaped an education and career-guidance product using the NUC Core Curriculum and Minimum Academic Standards (CCMAS) as the academic reference for organizing guidance.",
        "Defined product flows that connect higher-education programmes of study to likely domains, areas of work and roles, with planned alerts for internship, scholarship and job opportunities.",
        "Included pathways for learners to discover entrepreneurial opportunities in those domains, including options for people who may prefer self-employment or are not pursuing formal employment; product refinement was AI-assisted and production coding was handled by a technical cofounder.",
    ],
}

PROJECTS["ledgerlens"] = {
    **PROJECTS["ledgerlens"],
    "role": "Product Concept Co-builder | Creation stage | Nov 2025-present",
}

CONFIG = {
    "filename": "Peter_Chinedu_uLesson_Builders_Fellowship_CV.docx",
    "compact": True,
    "monochrome": True,
    "label": "EDUCATION PRODUCT BUILDER | RESEARCH | OPERATIONS AND STRATEGY",
    "summary": (
        "Product builder and Sociology researcher who shaped Sifter LevelUp to help Nigerian learners connect higher-education "
        "programmes of study to likely domains, areas of work and roles. The product uses the NUC Core Curriculum and "
        "Minimum Academic Standards (CCMAS) as an academic reference and is intended to surface internship, scholarship, "
        "job and entrepreneurial opportunities. I began the project in November 2025 after identifying that many students "
        "do not have easy access to this guidance. I shaped the product concept, user problem, learning and guidance flows "
        "and refinements with a technical cofounder who handled production coding. I also bring six years of crypto experience, "
        "MSc research, business administration, teaching and NYSC liaison experience involving more than 100 corps members."
    ),
    "skills": [
        "Product ideas, simple user flows and feature descriptions",
        "Thematic data analysis and qualitative research",
        "Teaching, academic mentoring and explaining ideas clearly",
        "Budget monitoring, financial review and sales reporting",
        "Microsoft Office Suite; basic HTML, CSS and JavaScript",
        "Graphics design and house painting",
        "Sharing information, following up on requests and communicating with students and colleagues",
    ],
    "project_order": ["sifter", "ledgerlens", "sna"],
}


if __name__ == "__main__":
    print(build_doc("ulesson", CONFIG))
    print(build_pdf(CONFIG))
