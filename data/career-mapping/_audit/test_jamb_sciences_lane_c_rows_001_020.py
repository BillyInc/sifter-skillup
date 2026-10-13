"""Regression checks for the bounded Sciences lane C source slice."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb" / "sciences_offerings.json"
TEXT = ROOT / "_jamb_txt" / "Sciences.txt"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
DATE = "2026-09-26"


ROWS = [
    ("Computer Science", 8242, 8664),
    ("Chemistry", 2197, 2517),
    ("Microbiology", 7023, 7373),
    ("Mathematics", 5728, 6052),
    ("PHYSICS", 966, 1317),
    ("BIOLOGY", 9714, 10102),
    ("CYBER SECURITY", 9196, 9361),
    ("Statistics", 4285, 4462),
    ("Software Engineering", 8736, 8880),
    ("PHYSICS WITH ELECTRONICS", 1319, 1430),
    ("Geology", 3595, 3731),
    ("INFORMATION TECHNOLOGY", 8890, 9039),
    ("Zoology", 5302, 5409),
    ("Botany", 4765, 4844),
    ("Industrial Mathematics", 2044, 2111),
    ("Plant Science and Biotechnology", 4850, 4900),
    ("Industrial Chemistry", 3033, 3260),
    ("Science Laboratory Technology", 7426, 7491),
    ("Biotechnology", 4946, 5071),
    ("BIOLOGICAL SCIENCE(S)", 788, 900),
]

HELD = {
    "Chemistry": "28 listed institution tokens are absent",
    "BIOLOGY": "31 listed institution tokens are absent",
}


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def source_window(start: int, end: int) -> str:
    lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(lines[start - 1 : end])


def test_rows_001_020_have_exact_local_source_evidence() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"][:20]
    assert [row["jamb_name"] for row in rows] == [item[0] for item in ROWS]

    for row, (name, start, end) in zip(rows, ROWS):
        window = compact(source_window(start, end))
        if compact(name) not in window:
            # Some extracted table cells place the right-hand requirement text
            # between title lines; retain the exact window but check each title
            # token rather than treating that extraction layout as a mismatch.
            assert all(compact(token) in window for token in re.findall(r"[A-Za-z0-9]+", name)), name
        if name in HELD:
            assert row["source_context_status"] == "evidence_hold", name
            assert HELD[name] in row["evidence_hold_reason"], name
            assert "source_url" not in row, name
            assert "source_locator" not in row, name
            assert "source_accessed_on" not in row, name
        else:
            assert row["source_context_status"] == "source_text_confirmed", name
            assert row["source_url"] == URL, name
            assert row["source_accessed_on"] == DATE, name
            assert f"Sciences.txt:{start}-{end}" in row["source_locator"], name
            missing = [institution for institution in row["institutions"] if compact(institution) not in window]
            assert not missing, (name, missing)
