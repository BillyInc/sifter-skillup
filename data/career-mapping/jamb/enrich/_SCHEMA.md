# JAMB requirement enrichment — output shape (ONE file per programme)
Write to the exact `out` path given. Overwrite atomically. JSON object:
{
  "jamb_name": "<exact name given>",
  "utme_subjects": ["<4 UTME subjects incl. any 'and one of'>"] | null,
  "olevel_requirement": "<the O'Level / SSC credit requirement prose, cleaned to one line>" | null,
  "direct_entry": "<the general Direct Entry requirement prose, cleaned>" | null,
  "institution_waivers": [ {"institution":"<CODE as printed>", "note":"<that school's special consideration/waiver, cleaned to one line>"} ]
}
Rules:
- Read ONLY the given line range of the given .txt. Do not read other files.
- The layout is multi-column: AWARDING INSTITUTIONS (left) | DIRECT ENTRY / UTME | UTME SUBJECTS | SPECIAL CONSIDERATION (WAIVER) REMARKS (right).
- utme_subjects/olevel/direct_entry are the GENERAL columns (apply to all institutions of this programme).
- institution_waivers are the per-school (i), (ii)... remarks on the right, each keyed to a school CODE. If none, use [].
- Clean wrapped words joined across lines (e.g. "ftom"->"from" only if obvious OCR; otherwise keep). Collapse whitespace. No trailing page numbers.
- If a field is genuinely absent, use null (or [] for waivers). Never invent.
