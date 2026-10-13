# CCMAS page-header spill repair checkpoint — 2026-09-26 (001)

The catalogue-wide CCMAS scan covered all 237 packages and 9,854 current
course rows. It initially found 47 page-header-spill candidates. A source-led
repair removed the header marker from 41 unambiguous rows and left six rows in
the review queue because the same extracted segment also contains equipment or
the next course's text.

The remaining six are:

- `DTH 527` — Dental Therapy;
- `OCT 525` — Occupational Therapy;
- `OPT 203` and `OPT 698` — Optometry;
- `POT 317` — Prosthetics and Orthotics; and
- `CHM 107` — Chemistry.

Current anomaly scan: 6 page-header candidates, 8 duplicate-outcome
candidates, 2 unresolved cross-reference candidates, 268 replacement-character
candidates, and 1,092 empty-content candidates. These are review signals, not
automatic unavailability decisions.

The 41 repaired rows retain official NUC source URLs, access date
`2026-09-26`, and cleanup locators. The repair was deliberately limited to
the header marker; adjacent content was not guessed or rewritten.
