# Audit rules (shared by all audit agents)

## Global-first mandate
The role/domain universe is GLOBAL — every role reachable by a Nigerian via migration OR
remote work counts, incl. creative & emerging fields. Nigeria is an overlay, never a filter.
Do NOT assume the current library/domain list is correct or optimal.

## Classification anchors
- Every role must resolve to an ISCO-08 group (4-digit) and have an essential-skills list.
- Provenance tags: `esco` | `onet` | `onet_crosswalk` | `wef` | `lightcast` | `curated_creative`.
- A role belongs in a domain if its core professional function IS that domain's subject.
  It should appear in a SECOND domain only if a real practitioner genuinely works across both
  (not just keyword overlap). Cap: a role in >6 domains is almost always over-fanout — trim.

## What to output (per your task)
Write JSON to the exact `out` path given. WRITE-FIRST per unit (one domain / one gap at a time)
so nothing is lost on interruption. Never fabricate skills — pull from ESCO-nearest occupation
or the cited source; if unknown, list the skill names you can justify and mark `needs_review`.

## Evidence standard
Every add/remove/move/split/merge needs a one-line justification citing the anchor
(ISCO group, ESCO occupation, WEF/O*NET/Lightcast entry, or the curated source URL).
No silent edits.
