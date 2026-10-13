"""Focused regression checks for lane A JAMB source/offering repairs."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
JAMB = ROOT / "jamb"
TEXT = ROOT / "_jamb_txt"


def load_programmes(filename: str) -> list[dict]:
    return json.loads((JAMB / filename).read_text(encoding="utf-8"))["programmes"]


def record(filename: str, jamb_name: str) -> dict:
    matches = [item for item in load_programmes(filename) if item.get("jamb_name") == jamb_name]
    assert len(matches) == 1, (filename, jamb_name, len(matches))
    return matches[0]


def source_window(filename: str, start: int, end: int) -> str:
    text = (TEXT / filename).read_text(encoding="cp1252")
    # Keep PDF form-feed page markers inside their physical source lines; the
    # existing locators count CRLF-delimited extracted lines.
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(lines[start - 1 : end])


def test_social_management_source_repairs() -> None:
    political = record("social_management_offerings.json", "Political Science / International Law and Diplomacy")
    assert political["institutions"] == ["BABCOCK"]
    assert political["source_original_title"] == "POLITICAL SCIENCE / INTERNTIONAL LAW AND DIPLOMACY"
    assert political["source_context_status"] == "source_text_confirmed"
    assert "INTERNTIONAL" in source_window("Social Management Science.txt", 3877, 3880)

    sociology_anthropology = record("social_management_offerings.json", "Sociology and Anthropology")
    assert len(sociology_anthropology["institutions"]) == 13
    assert sociology_anthropology["source_aliases"] == ["Sociology and Anthroplogy"]
    assert "SOCIOLOGY AND" in source_window("Social Management Science.txt", 4757, 4772)
    # The extracted cell itself is missing one character; the official source
    # title recorded in the checkpoint is the authoritative spelling.
    assert "ANTHROP" in source_window("Social Management Science.txt", 4757, 4772)

    sociology = record("social_management_offerings.json", "Sociology")
    assert sociology["institutions"].count("UDU") == 1


def test_engineering_boundary_repairs() -> None:
    meteorology = record("engineering_offerings.json", "Meteorology")
    assert meteorology["institutions"] == ["FUTA", "UMYUK", "MINNA"]
    assert meteorology["source_context_status"] == "source_text_confirmed"
    meteorology_window = source_window("engineering.txt", 6489, 6496)
    assert "METEOROLOGY" in meteorology_window
    assert "FUTA" in meteorology_window and "UMYUK" in meteorology_window and "MINNA" in meteorology_window

    hotel = record("engineering_offerings.json", "Hotel Management and Tourism")
    assert hotel["institutions"] == ["WESLEYUNI"]
    assert hotel["source_context_status"] == "source_text_confirmed"
    assert "HOTEL MANAGEMENT" in source_window("engineering.txt", 6542, 6545)


def test_agriculture_source_context() -> None:
    environmental = record("agriculture_offerings.json", "Environmental Management and Technology")
    assert environmental["institutions"] == ["FUNAAB", "KWASU"]
    assert environmental["source_original_title"] == "ENVIRONMENTAL MANAGEMENT AND TOXICOLOGY"
    assert environmental["source_context_status"] == "source_text_confirmed"
    window = source_window("agriculture.txt", 2556, 2571)
    assert "ENVIRONMENTAL" in window and "MANAGEMENT AND" in window and "TOXICOLOGY" in window
    assert "FUNAAB" in window and "KWASU" in window


def test_prior_sciences_source_repairs_remain_present() -> None:
    environmental = record("sciences_offerings.json", "Environmental Science and Technology")
    assert environmental["institutions"] == ["WESLEYUNI"]
    assert environmental["source_original_title"] == "ENVRIONMENTAL SCIENCE AND TECHNOLOGY"

    information_media = record("sciences_offerings.json", "INFORMATION AND MEDIA TECHNOLOGY")
    assert information_media["institutions"] == ["MINNA"]
    assert "page break" in information_media["source_locator"]
