"""Build a university/programme lookup queue from the manual JAMB gap handoff.

Institution tokens come from parsed JAMB brochure offering extracts. They are
search leads only; this script does not assert that each token is a verified
offering-cell association or that a missing rule is absent from IBASS.
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
HANDOFF = ROOT / "docs/manual-review/jamb-brochure-missing-content-2026-08-24.md"
OFFERINGS = ROOT / "data/career-mapping/jamb"
OUTPUT = ROOT / "docs/manual-review/jamb-brochure-missing-content-university-programme-queue-2026-09-26.md"

FACULTY_LABELS = {
    "Administration": "Administration",
    "Agriculture": "Agriculture",
    "Arts/Humanities": "Arts and Humanities",
    "Sciences": "Sciences",
    "Social Management": "Social/Management Sciences",
    "Medical": "Medical/Pharmaceutical/Health",
    "Law": "Law",
    "Education": "Education",
    "Engineering": "Engineering/Environmental/Technology",
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.casefold())


def section(text: str, start: str, end: str) -> str:
    start_match = re.search(start, text, re.MULTILINE)
    if not start_match:
        raise ValueError(f"Missing section heading matching {start!r}")
    end_match = re.search(end, text[start_match.end() :], re.MULTILINE)
    if not end_match:
        raise ValueError(f"Missing section boundary matching {end!r}")
    return text[start_match.end() : start_match.end() + end_match.start()]


def bullets(block: str) -> list[str]:
    return [match.group(1).strip() for match in re.finditer(r"^- (.+?)\s*$", block, re.MULTILINE)]


def main() -> None:
    handoff = HANDOFF.read_text(encoding="utf-8")
    part_a = bullets(section(handoff, r"^## Part A.*$", r"^### Required capture"))
    part_b = [
        line
        for line in bullets(section(handoff, r"^## Part B.*$", r"^## Part C"))
        if re.fullmatch(r".+ \[[^]]+\]", line)
    ]
    part_b_faculty_occurrences = sum(
        len(re.split(r";\s*", re.fullmatch(r"(.*?) \[(.*?)\]", line).group(2)))
        for line in part_b
    )

    programme_records: list[dict[str, object]] = []
    for path in sorted(OFFERINGS.glob("*_offerings.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        for programme in payload.get("programmes", []):
            programme_records.append(
                {
                    "faculty": payload["faculty"],
                    "name": programme["jamb_name"],
                    "institutions": programme.get("institutions") or [],
                    "source_file": path.name,
                }
            )

    queue: dict[tuple[str, str, str], dict[str, object]] = {}
    unmatched: list[str] = []

    def add_matches(name: str, faculty: str | None, source_part: str) -> None:
        matches = [
            record
            for record in programme_records
            if normalize(str(record["name"])) == normalize(name)
            and (faculty is None or record["faculty"] == faculty)
        ]
        if not matches:
            unmatched.append(f"{source_part}: {name}" + (f" [{faculty}]" if faculty else ""))
            return
        for record in matches:
            for institution in record["institutions"]:
                key = (str(institution), str(record["name"]), str(record["faculty"]))
                entry = queue.setdefault(
                    key,
                    {
                        "parts": set(),
                        "source_files": set(),
                    },
                )
                entry["parts"].add(source_part)
                entry["source_files"].add(str(record["source_file"]))

    for name in part_a:
        add_matches(name, None, "A")

    for line in part_b:
        match = re.fullmatch(r"(.*?) \[(.*?)\]", line)
        if not match:
            unmatched.append(f"B parse: {line}")
            continue
        name, faculty_labels = match.groups()
        for label in re.split(r";\s*", faculty_labels):
            faculty = FACULTY_LABELS.get(label)
            if faculty is None:
                unmatched.append(f"Unknown faculty label: {name} [{label}]")
                continue
            add_matches(name, faculty, "B")

    if unmatched:
        raise SystemExit("Unmatched handoff entries; queue not written:\n" + "\n".join(unmatched))

    by_institution: dict[str, list[tuple[str, str, dict[str, object]]]] = defaultdict(list)
    for (institution, programme, faculty), evidence in queue.items():
        by_institution[institution].append((programme, faculty, evidence))

    lines = [
        "# JAMB brochure missing-content lookup queue — university/programme",
        "",
        "Generated: 2026-09-26 from `jamb-brochure-missing-content-2026-08-24.md` and the current `data/career-mapping/jamb/*_offerings.json` extracts.",
        "",
        "## How to use this queue",
        "",
        "Search IBASS using the **institution code shown in its brochure** and the exact JAMB programme title. The institution codes below are parsed-extract search leads, not verified awarder-cell associations; confirm each code against the exact programme row before supplying requirements. Full institution names are intentionally not guessed from codes—copy the official name shown by IBASS when returning a result.",
        "",
        "For each confirmed institution + programme occurrence, paste the complete available UTME subject combination, O-level requirements, Direct Entry requirements, and any institution-specific waiver, together with the brochure name, page, table/heading, and exact row text. If a field is blank or not present, say so explicitly. Do not infer it from a neighbouring programme.",
        "",
        "Part A means the handoff had no resolved source candidate for the programme name and asks that UTME, O-level, and Direct Entry be checked separately. Part B means all three fields were blank for the programme/faculty source row. A+B means both handoff checks apply to that institution/programme candidate.",
        "",
        "## Queue summary",
        "",
        f"- Part A names: {len(part_a)}.",
        f"- Part B listed programme lines: {len(part_b)}; faculty-specific source rows: {part_b_faculty_occurrences}.",
        f"- Candidate institution + programme + faculty contexts to verify: {len(queue)}.",
        f"- Distinct institution codes in the candidate list: {len(by_institution)}.",
        "- These are not 2,597 confirmed live offerings; each candidate still needs exact IBASS row verification.",
        "",
        "## Lookup queue, grouped by JAMB institution code",
        "",
    ]

    for institution in sorted(by_institution, key=str.casefold):
        entries = sorted(by_institution[institution], key=lambda item: (item[0].casefold(), item[1].casefold()))
        lines.append(f"### {institution} — institution name to be copied from IBASS")
        lines.append("")
        lines.append("| Programme name (JAMB) | Brochure faculty context | Handoff gap | Parsed source extract |")
        lines.append("|---|---|---|---|")
        for programme, faculty, evidence in entries:
            parts = evidence["parts"]
            gap = "A+B — check UTME, O-level and Direct Entry" if parts == {"A", "B"} else (
                "A — check each of UTME, O-level and Direct Entry" if "A" in parts else "B — all three fields blank"
            )
            source_files = ", ".join(sorted(evidence["source_files"]))
            lines.append(f"| {programme} | {faculty} | {gap} | `{source_files}` |")
        lines.append("")

    lines.extend(
        [
            "## Source/status caveat",
            "",
            "The original handoff remains the authority for definitions, acceptance states, and the exact fields to capture. This companion only rearranges its outstanding names against current parsed institution-token lists so the manual IBASS lookup can be done university-first. It does not mark any row verified, change an executable rule, or resolve any source conflict.",
            "",
            "If an institution code is absent from the exact IBASS row, do not fetch or paste requirements under that pair; report the discrepancy as an offering/source-context correction instead.",
            "",
        ]
    )
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(queue)} candidate contexts across {len(by_institution)} institution codes.")


if __name__ == "__main__":
    main()
