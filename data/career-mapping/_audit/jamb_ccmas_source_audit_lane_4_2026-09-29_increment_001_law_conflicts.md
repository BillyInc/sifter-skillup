# CCMAS source-audit lane 4 — increment 001

## Scope

- Package: `law.json`
- Official source: [NUC Law CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf)
- Access date: 2026-09-29
- Compared: 5 course occurrences in the Common and Islamic Law (`ICL`) package
- Package denominator: 1 package / 145 course occurrences
- Next cursor: `law.json::LAW/ICL::course_occurrence_after:ICL 304`

## Findings

The official PDF contains programme-table and course-detail values that conflict for `ICL 101`, `ICL 304`, `ENT 211`, and `LAW 599`. These are source conflicts, not extraction defects that can safely be repaired by choosing whichever block looks more complete. The checkpoint preserves both locators and observed values. `ICL 301` matches across the two blocks; its detail heading omits the `ICL` prefix, but the table establishes the code in the package context.

The local Law JSON was not edited in this increment. No shared ledger, seed, SQL, JAMB mapping, downstream mapping, or UI file was changed.

## Exact observations

| Course | Programme table | Course-detail block | Disposition |
|---|---|---|---|
| ICL 101 | p.57: 2 units, LH 30 | p.63: 3 units, LH 45 | source conflict |
| ICL 304 | p.58: Enterprise Appreciation, 2 units, LH 30 | p.74: Islamic Family Law, 3 units, LH 45 | source conflict |
| ENT 211 | p.58: LH 15, PH blank | p.65: LH 15, PH 45 | source conflict |
| LAW 599 | p.59: LH 270, PH blank | p.81: LH 45, PH 45 | source conflict |
| ICL 301 | p.58: Muamalat, 3 units, LH 45, PH 45 | p.74: same course content; heading omits prefix | confirmed match with locator normalization |

The next increment must continue from the saved cursor and must not repeat these exact comparisons unless a new contradictory source is found.
