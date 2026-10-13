"""Remove four unsupported domain claims from the Common and Islamic Law overlay.

Evidence review: agent-01-increment-027-rows-001-010-enriched-overlay-claim-review-2026-09-25.md
The edit is deliberately byte-local so the large JSON ledger is not reformatted.
"""

from __future__ import annotations

from pathlib import Path


HERE = Path(__file__).parent
OVERLAY = HERE / "ccmas_nigerian_reviewed_links_2026-09-01.json"
ROW_START = '"jamb_name": "Common and Islamic Law"'
DECISIONS = {
    "D163": (
        "resolved_nigerian_bridge_link",
        "LAW 101 English for Legal Writing teaches legal writing, not intellectual-property law. An optional IP course listing does not establish universal programme coverage; remove this candidate from the confirmed set.",
    ),
    "D078": (
        "certified_nigerian_curriculum_link",
        "ICL 402 Islamic Company Law covers Islamic economics, banking, finance and insurance concepts; it does not establish the quantitative or social-research subgroup scope of the mapped Social Sciences domain.",
    ),
    "D151": (
        "certified_nigerian_curriculum_link",
        "Criminal-law study concerns legal rules and procedure; it does not establish criminology research, probation, investigation, policing or corrections learning represented by this destination domain.",
    ),
    "D150": (
        "certified_nigerian_curriculum_link",
        "The curriculum teaches Islamic law and jurisprudence, not theology or preparation for religious ministry; remove the unsupported destination-domain link.",
    ),
}


def update_link(row: str, domain_id: str, old_disposition: str, reason: str) -> tuple[str, bool]:
    marker = f'"domain_id": "{domain_id}"'
    if row.count(marker) != 1:
        raise ValueError(f"expected exactly one {domain_id} link in target row")
    start = row.index(marker)
    end = row.find("\n        }", start)
    if end < 0:
        raise ValueError(f"could not bound {domain_id} link object")
    end += len("\n        }")
    link = row[start:end]
    current = (
        '"publish_in_reviewed_map": false' in link
        and '"disposition": "removed_unsupported_candidate"' in link
        and reason in link
    )
    if current:
        return row, False
    expected = (
        '"publish_in_reviewed_map": true',
        f'"disposition": "{old_disposition}"',
        '"reason": "The link meets the Nigerian CCMAS course/objective evidence gate."'
        if old_disposition == "certified_nigerian_curriculum_link"
        else '"reason": "Nigerian CCMAS course evidence and Nigerian destination-domain professional/context evidence support a guided bridge; the UI must show the additional preparation required."',
    )
    for field in expected:
        if link.count(field) != 1:
            raise ValueError(f"unexpected existing {domain_id} field: {field}")
    link = link.replace(expected[0], '"publish_in_reviewed_map": false', 1)
    link = link.replace(
        expected[1],
        '"disposition": "removed_unsupported_candidate"',
        1,
    )
    link = link.replace(
        expected[2],
        '"reason": "' + reason + '"',
        1,
    )
    return row[:start] + link + row[end:], True


def main() -> None:
    raw = OVERLAY.read_bytes()
    text = raw.decode("utf-8")
    start = text.index(ROW_START)
    next_row = text.find('\n      "jamb_name":', start + len(ROW_START))
    if next_row < 0:
        next_row = len(text)
    row = text[start:next_row]
    changed = []
    for domain_id, (old_disposition, reason) in DECISIONS.items():
        row, did_change = update_link(row, domain_id, old_disposition, reason)
        if did_change:
            changed.append(domain_id)
    if changed:
        OVERLAY.write_bytes((text[:start] + row + text[next_row:]).encode("utf-8"))
    print(f"Changed links: {', '.join(changed) if changed else 'none (already reconciled)'}")
    print(f"Target row: Common and Islamic Law; total target links: {len(DECISIONS)}")


if __name__ == "__main__":
    main()
