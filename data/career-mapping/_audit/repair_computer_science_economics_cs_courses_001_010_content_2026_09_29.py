"""Restore source-confirmed contents for CS component courses 1-10 only."""

from __future__ import annotations

import json
from pathlib import Path


TARGET = Path(__file__).resolve().parents[1] / "ccmas" / "computing.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf"
ACCESS_DATE = "2026-09-29"
UPDATES = {
    "GST 111": (
        "Covers English sounds and phonetics; word classes, collocations, sentence forms, grammar and language use; "
        "logical and critical reasoning; copyright and ethical considerations; planning, drafting, editing and "
        "proofreading different forms of writing; reading and comprehension strategies; ICT for language learning; "
        "effective communication; public speaking and listening; and technical reports.",
        "B.Sc. Computer Science, GST 111, printed p. 31, Course Contents, lines 1062-1076; course table pp. 29-30.",
        (100, 2, "C", 15, 45), 7,
    ),
    "GST 112": (
        "Covers Nigerian history, peoples, cultures and arts; colonial rule and Nigeria's political development; "
        "nation-building and the Civil War; indigenous trade, apprenticeship, skills and self-reliance; social justice, "
        "the judiciary and fundamental rights; citizenship, civic responsibilities, norms and values; indigenous "
        "languages and social challenges; national re-orientation programmes; and current socio-political and cultural "
        "developments. The source's phrase ‘Individual, norms and values’ is retained in the evidence record as printed.",
        "B.Sc. Computer Science, GST 112, printed pp. 31-32, Course Contents, lines 1091-1106; course table pp. 29-30.",
        (100, 2, "C", 30, 0), 8,
    ),
    "MTH 101": (
        "Covers set theory and Venn diagrams; real, rational and irrational numbers; mathematical induction; sequences "
        "and series; quadratic equations and the binomial theorem; complex-number algebra and the Argand diagram; "
        "De Moivre's theorem and roots of unity; circular measure; and trigonometric functions, addition and factor "
        "formulae.",
        "B.Sc. Computer Science, MTH 101, printed p. 32, Course Contents, lines 1117-1122; detailed title adds Algebra and Trigonometry.",
        (100, 2, "C", 30, 0), 5,
    ),
    "MTH 102": (
        "Covers real-valued functions and graphs; limits and continuity; derivatives as rates of change; differentiation "
        "techniques and curve sketching; integration as the inverse of differentiation; integration methods and "
        "definite integrals; and applications to areas and volumes.",
        "B.Sc. Computer Science, MTH 102, printed pp. 32-33, Course Contents, lines 1130-1134; detailed title adds Calculus.",
        (100, 2, "C", 30, 0), 3,
    ),
    "PHY 101": (
        "Covers space, time, units, dimensions, vectors and scalars; vector differentiation; displacement, velocity, "
        "acceleration and kinematics; Newtonian mechanics, forces, impulse and relative motion; work, kinetic and "
        "potential energy, momentum and conservation principles; systems of particles and centre of mass; rotational "
        "motion, torque, angular momentum, circular motion, moments of inertia and gyroscopes; and gravitation, "
        "planetary motion, escape velocity and satellite orbits.",
        "B.Sc. Computer Science, PHY 101, printed p. 33, Course Contents, lines 1149-1159; detailed title adds Mechanics.",
        (100, 2, "C", 30, 0), 8,
    ),
    "PHY 102": (
        "Covers electric charge, electrostatics, Coulomb's and Gauss's laws, electric fields and potential, capacitance "
        "and dipoles; DC circuits, current, voltage, resistance and Ohm's law; magnetic fields and forces, Biot-Savart "
        "and Ampère's laws; dielectrics and magnetic-field energy; electromotive force, induction, inductance, Faraday "
        "and Lenz's laws; transformers; Maxwell's equations; electromagnetic waves; and AC circuits with resistors, "
        "capacitors and inductors. The source's apparent grammar error in outcome 6 is not silently rewritten.",
        "B.Sc. Computer Science, PHY 102, printed pp. 33-34, Course Contents, lines 1176-1185; outcome wording issue at line 1171.",
        (100, 2, "C", 30, 0), 8,
    ),
    "PHY 107": (
        "Practical introduction to quantitative measurement, experimental techniques and error treatment, with graph "
        "analysis. Experiments draw on mechanics, electricity, resonance, light, heat and viscosity from PHY 101 and "
        "PHY 102, emphasizing observation, measurement, data collection, analysis and deduction.",
        "B.Sc. Computer Science, PHY 107, printed p. 34, Course Contents, lines 1194-1200.",
        (100, 1, "C", 0, 45), 5,
    ),
    "PHY 108": (
        "Continuation of PHY 107 practical work, intended for the second semester of 100 level. Covers practical "
        "experiments from the theoretical courses through quantitative measurement, experimental-error treatment and "
        "graph analysis, emphasizing observation, measurement, data collection, analysis and deduction.",
        "B.Sc. Computer Science, PHY 108, printed pp. 34-35, Course Contents, lines 1210-1215; detailed heading uses a hyphen after the code.",
        (100, 1, "C", 0, 45), 6,
    ),
    "STA 111": (
        "Covers permutations and combinations; probability; random variables and probability distributions; binomial, "
        "geometric, Poisson, normal and sampling distributions; and exploratory data analysis.",
        "B.Sc. Computer Science, STA 111, printed p. 35, Course Contents, lines 1225-1228.",
        (100, 3, "C", 45, 0), 4,
    ),
    "COS 101": (
        "Introduces computing history and computer/device components; input/output peripherals, hardware, software and "
        "humanware; digital applications and information processing; the Internet and its impact; computing fields and "
        "job specializations; and the future of computing. Practical work demonstrates computer parts, operating "
        "systems, productivity and graphics applications, peripherals, browsers, search engines and access to online "
        "resources.",
        "B.Sc. Computer Science, COS 101, printed pp. 35-36, Course Contents and Lab Work, lines 1238-1251.",
        (100, 3, "C", 30, 45), 6,
    ),
}


def encode(value: dict, indent: str) -> str:
    lines = json.dumps(value, ensure_ascii=False, indent=1).splitlines()
    return lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"name": "Computer Science"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected one Computer Science CCMAS package; refusing ambiguous edit")
    at = text.index(marker)
    package_start = text.rfind("{", 0, at)
    _, package_len = json.JSONDecoder().raw_decode(text[package_start:])
    package_end = package_start + package_len
    replacements = []
    for code, (summary, locator, metadata, outcome_count) in UPDATES.items():
        course_marker = f'"code": "{code}"'
        if text[package_start:package_end].count(course_marker) != 1:
            raise RuntimeError(f"Expected one CS-component {code} row; refusing ambiguous edit")
        pos = text.index(course_marker, package_start, package_end)
        start = text.rfind("{", 0, pos)
        row, length = json.JSONDecoder().raw_decode(text[start:])
        actual_metadata = (row.get("level"), row.get("units"), row.get("status"), row.get("lh"), row.get("ph"))
        if actual_metadata != metadata or len(row.get("skills_learned", [])) != outcome_count:
            raise RuntimeError(f"{code} source-audited metadata/outcome shape changed; inspect before edit")
        if row.get("content_summary") is not None:
            raise RuntimeError(f"{code} is no longer missing its summary; refusing overwrite")
        updated = dict(row)
        updated.update({
            "content_summary": summary,
            "source_url": SOURCE_URL,
            "source_locator": f"NUC Computing CCMAS 2023, {locator}",
            "source_accessed_on": ACCESS_DATE,
        })
        indent_start = text.rfind("\n", 0, start) + 1
        replacements.append((start, start + length, encode(updated, text[indent_start:start])))
    for start, end, replacement in sorted(replacements, reverse=True):
        text = text[:start] + replacement + text[end:]
    parsed = json.loads(text)
    package = next(row for row in parsed["programmes"] if row["name"] == "Computer Science")
    for code, (summary, _, _, _) in UPDATES.items():
        row = next(row for row in package["courses"] if row["code"] == code)
        if row["content_summary"] != summary or row.get("source_url") != SOURCE_URL:
            raise RuntimeError(f"Post-edit verification failed for {code}")
    TARGET.write_text(text, encoding="utf-8")
    print("Restored source-backed contents for the first ten Computer Science CCMAS rows only.")


if __name__ == "__main__":
    main()
