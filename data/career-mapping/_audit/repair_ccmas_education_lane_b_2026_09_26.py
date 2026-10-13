"""Repair source-confirmed Education CCMAS course-boundary extractions."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "ccmas" / "education.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf"
ACCESS_DATE = "2026-09-26"

LIS_215_OUTCOMES = [
    "Identify the characteristics, needs and interests of children and adolescents for the purpose of selecting appropriate information materials",
    "Enumerate the effects of media on children and adolescents",
    "Explain the relationship between gaming and libraries",
    "Discuss how to filter the gamut of information resources to ensure users' safety",
    "Mention social networking services that are available for children and adolescents",
    "Explain how to offer information and media literacy to children and adolescents",
    "Enumerate and evaluate digital library resources and services for children and adolescents",
    "Discuss the role of technology on children's library and information services",
    "Explain future trends in library and information services for children and adolescents",
]
LIS_215_CONTENT = (
    "Characteristics, needs and interests of children and adolescents, children's literature, "
    "selection and materials. Effects of media on children and adolescents from toys to television. "
    "Gaming and libraries. Filtering and child safety. Social networking. Information/media literacy "
    "instruction in children's libraries. Digital libraries for children. Evaluation of digital resources "
    "for children. Children information behaviour. Global perspectives-technology in young people's "
    "lives around the world. Future trends."
)
LIS_216_OUTCOMES = [
    "Define the basic concepts in the course",
    "Explain the role of serials in information dissemination",
    "Describe the selection, acquisition, organization storage and dissemination processes of serials in print, microform and digital formats",
    "Enumerate the uses of databases for serials control and dissemination",
    "Mention the problems of bibliographic control of serials",
    "Explain users' access to serials through indexing and abstracting services",
    "Demonstrate serials control and access using appropriate software",
]
LIS_216_CONTENT = (
    "Definitions. Role of serials in information dissemination. Selection, acquisition, organization "
    "and storage of serials in print, microforms and digital formats. Use of databases. Problems of "
    "bibliographic control. User access via indexing and abstracting services. Students are required "
    "to have hand-on practicals on serials management software."
)
LIS_222_OUTCOMES = [
    "Define the basic concepts in the course",
    "Describe catalogue using AACR2 and RDA",
    "Use Library of Congress Subject Headings, Sears List of Subject Headings and Medical Subject Headings (MeSH)",
    "Use Dublin Core Metadata Standard Elements and the Minnesota Metadata Guidelines",
    "Catalogue non-book materials",
    "Explain the application of computers to cataloguing",
    "Mention the types of catalogues and their uses",
    "Explain filing rules and demonstrate their practical application",
]
LIS_222_CONTENT = (
    "Definition of terms: cataloguing, authority file, shelf list, filing rules, subject heading, etc. "
    "Standard techniques of identification and description of bibliographic units through descriptive "
    "cataloguing using AACR2 and RDA. Establishment of subject headings using Sears List of Subject "
    "Headings, Library of Congress Subject Headings, Medical Subject Headings of the National Library "
    "of Medicine of the USA and others. Metadata standard sets such as Dublin Core Metadata Standard "
    "sets, Minnesota Metadata Guidelines and others. Cataloguing of non-book materials. Application "
    "of computers to cataloguing with special emphasis on MARC and related online formats. Types of "
    "catalogues and their uses. Filing rules and their practical applications."
)
SED_101_OUTCOMES = [
    "Differentiate between Mathematics and Mathematics Education",
    "Explain the major goals of teaching mathematics in schools in Nigeria",
    "Identify and discuss the three broad characteristics of a mathematics teacher",
    "Discuss Ethno-mathematics in at least six cultures in Nigeria",
    "Discuss the roles of mathematics and Mathematics Education in Science, Technology and National development",
    "Discuss the development of Mathematics curricula in Nigeria",
    "Compare the content and procedure of Senior Secondary Mathematics Curriculum (SSMC) and Further Mathematics Curriculum (FMC)",
    "Discuss the contribution of the Mathematical Association of Nigeria (MAN) and Science Teachers Association of Nigeria (STAN) to the development mathematics curriculum",
]
SED_101_CONTENT = (
    "Mathematics and Mathematics Education as related disciplines of learning. Goals of Mathematics "
    "teaching in schools. Three broad characteristics of a Mathematics Teacher: knowledge of subject "
    "contents, organization of learning materials and personality. Ethnomathematics. Roles of "
    "Mathematics and Mathematics Education in society. Trends in mathematics curriculum development "
    "in Nigeria - The Benin Conference 1977 and the Nigerian Education Research and Development "
    "Council (NERDC) and curriculum development. Comparison between the Secondary School Mathematics "
    "Curriculum (SSMC) and Further Mathematics Curriculum (FMC). MAN and its contribution to the "
    "development of mathematics curriculum. The contribution of STAN to the development of mathematics curriculum."
)


def courses(document: dict) -> list[dict]:
    programme = next(item for item in document["programmes"] if item.get("name") in {"Library and Information Science", "Mathematics"})
    return programme["courses"]


def find_all(document: dict, code: str) -> list[dict]:
    found = []

    def walk(value):
        if isinstance(value, dict):
            if value.get("code") == code:
                found.append(value)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(document)
    return found


def source_fields(course: dict, locator: str) -> None:
    course["source_url"] = SOURCE_URL
    course["source_locator"] = locator
    course["source_accessed_on"] = ACCESS_DATE


def repair(document: dict) -> None:
    lis215 = find_all(document, "LIS 215")
    lis216 = find_all(document, "LIS 216")
    lis222 = find_all(document, "LIS 222")
    sed101 = find_all(document, "SED 101")
    assert len(lis215) == len(lis216) == len(lis222) == len(sed101) == 1

    lis215[0].update(title="Library and Information Services for Children and Adolescents", skills_learned=LIS_215_OUTCOMES, content_summary=LIS_215_CONTENT)
    source_fields(lis215[0], "NUC Education CCMAS exact LIS 215 course block, printed pp. 827-828; boundary checked against LIS 216 and LIS 222")
    lis216[0].update(title="Serials Management", skills_learned=LIS_216_OUTCOMES, content_summary=LIS_216_CONTENT)
    source_fields(lis216[0], "NUC Education CCMAS exact LIS 216 course block, printed p. 828")
    lis222[0].update(title="Organization of Knowledge I: Principles of Cataloguing", skills_learned=LIS_222_OUTCOMES, content_summary=LIS_222_CONTENT)
    source_fields(lis222[0], "NUC Education CCMAS exact LIS 222 course block, printed pp. 828-829")
    sed101[0].update(title="Introduction to Mathematics and Mathematics Education", skills_learned=SED_101_OUTCOMES, content_summary=SED_101_CONTENT)
    sed101[0]["source_title_variants"] = ["Introduction of Science and Mathematics Education", "Introduction to Mathematics and Mathematics Education"]
    sed101[0]["source_state"] = "source_title_inconsistency_resolved_to_course_content_heading"
    source_fields(sed101[0], "NUC Education CCMAS SED 101 table title printed p. 841 and course-content block printed pp. 844-845")


def validate(document: dict) -> None:
    assert len(find_all(document, "LIS 215")) == 1
    lis215 = find_all(document, "LIS 215")[0]
    lis216 = find_all(document, "LIS 216")[0]
    lis222 = find_all(document, "LIS 222")[0]
    sed101 = find_all(document, "SED 101")[0]
    assert lis215["title"] == "Library and Information Services for Children and Adolescents" and len(lis215["skills_learned"]) == 9
    assert lis216["title"] == "Serials Management" and len(lis216["skills_learned"]) == 7
    assert lis222["title"] == "Organization of Knowledge I: Principles of Cataloguing" and len(lis222["skills_learned"]) == 8
    assert sed101["title"] == "Introduction to Mathematics and Mathematics Education" and len(sed101["skills_learned"]) == 8
    assert all(item.get("source_url") == SOURCE_URL and item.get("source_accessed_on") == ACCESS_DATE for item in (lis215, lis216, lis222, sed101))
    assert "Introduction of Science and Mathematics Education" in sed101["source_title_variants"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    document = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    if args.apply:
        repair(document)
        SOURCE_PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    validate(document)
    print(json.dumps({"source_file": SOURCE_PATH.name, "codes": ["LIS 215", "LIS 216", "LIS 222", "SED 101"], "status": "passed"}, indent=2))


if __name__ == "__main__":
    main()
