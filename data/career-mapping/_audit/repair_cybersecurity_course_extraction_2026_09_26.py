"""Repair two source-confirmed Cybersecurity CCMAS extraction errors."""

from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "computing.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf"
CYB201_OUTCOMES = [
    "explain cybersecurity concepts, its methods, elements, and terminologies of cybersecurity, security, threat, attack, defence, and operations",
    "describe common cyber-attacks and threats, cybersecurity issues, challenges and proffered solutions, and build an enhanced view of main actors of cyberspace and cyber operations",
    "apply the techniques for identifying, detecting, and defending against cybersecurity threats, attacks and protecting information assets",
    "explain the impact of cybersecurity on civil and military institutions, privacy, business and government applications",
    "identify the methods and motives of cybersecurity incident perpetrators, and the countermeasures employed by organisations and agencies to prevent and detect those incidences and software application vulnerabilities; and",
    "state the ethical obligations of security professionals, evaluate cybersecurity and national security strategies to the typologies of cyber-attacks that require policy tools and domestic response, and define the cybersecurity requirements and strategies evolving in the face of big risk",
]
CYB498_OUTCOMES = [
    "conduct research methodology, analyse collected data, document the project report using the recommended format, and referencing style",
    "develop the prototype or simulated model of research study along with the programming aspect, if required",
    "produce the report; and",
    "prepare the PowerPoint presentation and defend the project in the final oral examination in the presence of the external examiner",
]
CYB498_CONTENT = (
    "Continuation of CYB 497: research methodology; analysis of data using statistical tools; "
    "performance evaluation; standard project documentation and referencing; programming of a "
    "prototype or simulation; plagiarism and Grammarly checks; and presentation. The approved "
    "chapters four and five are submitted for final grading, followed by an oral presentation."
)


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Cybersecurity"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Cybersecurity package; got {len(packages)}")
    courses = packages[0]["courses"]
    selected = {
        code: [row for row in courses if row.get("code") == code]
        for code in ("CYB 201", "CYB 498")
    }
    if any(len(rows) != 1 for rows in selected.values()):
        raise SystemExit("Expected exactly one CYB 201 and CYB 498; refusing edit")

    cyb201 = selected["CYB 201"][0]
    if len(cyb201.get("skills_learned", [])) != 7 or cyb201["skills_learned"][-1] != CYB201_OUTCOMES[0]:
        raise SystemExit("CYB 201 no longer has the audited duplicate shape; refusing edit")
    cyb201["skills_learned"] = CYB201_OUTCOMES
    cyb201.update(
        source_url=URL,
        source_locator="Cybersecurity course contents and outcomes, printed CCMAS pp. 69-70, CYB 201",
        source_accessed_on="2026-09-26",
    )

    cyb498 = selected["CYB 498"][0]
    if len(cyb498.get("skills_learned", [])) != 31 or not str(cyb498.get("content_summary", "")).startswith("**GST 111"):
        raise SystemExit("CYB 498 no longer has the audited contamination shape; refusing edit")
    cyb498["skills_learned"] = CYB498_OUTCOMES
    cyb498["content_summary"] = CYB498_CONTENT
    cyb498.update(
        source_url=URL,
        source_locator="Cybersecurity CYB 498: course contents and outcomes, printed CCMAS pp. 85-86",
        source_accessed_on="2026-09-26",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired CYB 201 duplicate and CYB 498 cross-course extraction contamination.")


if __name__ == "__main__":
    main()
