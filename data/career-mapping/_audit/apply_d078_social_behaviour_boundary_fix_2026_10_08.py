"""Apply the bounded D078 social-behaviour area correction without reformatting JSON.

The catalogue already uses the stable ``D078:psychology-social-behaviour`` key in
role routes and audit artifacts.  This patch changes only the human-facing label,
scope, and boundary metadata so D078 cannot be mistaken for the separate D064
Psychology and Counselling domain.
"""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"


def replace_once(data: bytes, old: bytes, new: bytes, description: str) -> bytes:
    count = data.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one {description}, found {count}")
    return data.replace(old, new, 1)


def main() -> None:
    data = DOMAIN_STRUCTURE.read_bytes()
    old_header = (
        b'        "area_id": "D078:psychology-social-behaviour",\n'
        b'        "label": "Psychology and Social Behaviour",\n'
        b'        "description": "Explain individual and group behaviour, social interaction and psychological processes using research and theory.",\n'
        b'        "boundary": "Explain individual and group behaviour, social interaction and psychological processes using research and theory.",'
    ).replace(b"\n", b"\r\n")
    new_header = (
        b'        "area_id": "D078:psychology-social-behaviour",\n'
        b'        "label": "Social Behaviour and Interaction",\n'
        b'        "description": "Study how people behave and interact in groups, institutions and communities through social-science research and theory.",\n'
        b'        "boundary": "Study social behaviour and interaction as a social-science subject. This area does not include clinical assessment, counselling, psychotherapy, diagnosis, psychological treatment or professional psychology licensure; those belong under the separate Psychology and Counselling domain (D064).",'
    )
    data = replace_once(data, old_header, new_header, "D078 area header")

    old_meta = (
        b'        "disposition": "keep_as_distinct_candidate_area",\n'
        b'        "reconciliation_rationale": "Individual and group behaviour, social interaction and psychological processes using research and theory. Distinct-boundary check: Its primary object is psychological processes and behaviour at individual or group level. It is distinct from sociology\'s institutional/cultural focus and from clinical or health practice unless a separate domain supports that scope.",\n'
        b'        "positive_scope_evidence": "Individual and group behaviour, social interaction and psychological processes using research and theory.",\n'
        b'        "negative_neighbouring_domain_check": "Does not include clinical/health practice or sociology\'s institutional/cultural scope unless the actual work has the relevant psychological or behavioural lens.",'
    ).replace(b"\n", b"\r\n")
    new_meta = (
        b'        "legacy_label": "Psychology and Social Behaviour",\n'
        b'        "disposition": "keep_as_distinct_social_science_area_with_parent_domain_boundary",\n'
        b'        "reconciliation_rationale": "The stable area key is retained for route compatibility, but the student-facing name and boundary are narrowed. D078 covers social behaviour and interaction as social-science inquiry; D064 is the separate canonical parent domain for psychology and counselling practice. The area must not imply clinical psychology, counselling, psychotherapy, diagnosis, treatment or licensure.",\n'
        b'        "positive_scope_evidence": "Social behaviour, interaction, groups, institutions and communities studied through social-science research and theory.",\n'
        b'        "negative_neighbouring_domain_check": "Excludes clinical assessment, counselling, psychotherapy, diagnosis, psychological treatment, professional psychology licensure and other D064 practice areas. It also excludes sociology as a whole when the work is not specifically about social behaviour or interaction.",'
    )
    data = replace_once(data, old_meta, new_meta, "D078 area boundary metadata")
    DOMAIN_STRUCTURE.write_bytes(data)
    print(f"Updated {DOMAIN_STRUCTURE}")


if __name__ == "__main__":
    main()
