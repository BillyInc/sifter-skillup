# Append-only precision correction — row 001 evidence level

Audit date: 2026-09-26 (Africa/Lagos). This corrects the confidence label in `_019.md`; it does not change the underlying mapping or source files.

## Downgrade to unresolved candidate pending rendered-cell evidence

The statement in `_019.md` calling the row-001 occurrence a **confirmed inventory defect** was too strong. Rechecking the current `data/career-mapping/jamb/law_offerings.json` shows its `index_note` explicitly characterizes the `CIVIL LAW` body block as a **shared block carrying a master institution list, including a `LAW` code**. That is a competing interpretation of the exact same text-layer sequence. The local extracted text alone does not expose enough table geometry to decide whether `LAW` is a course heading/merged-cell continuation or an institution token in the shared list.

Evidence that is confirmed:

- The official JAMB Law index, printed p. 418, lists **Civil Law** and **Law** as separate programme names.
- The text extraction for printed p. 419 displays `CIVIL LAW`, then ABU/OOU/UNIZIK, and later the token `LAW`; the current inventory records one Civil Law occurrence with 117 institution tokens, including `LAW`, and no separate `Law` occurrence.

Evidence still required before adjudication:

- Rendered official PDF page p. 419 (or a faithful primary-source table view) to determine the actual row/cell geometry and whether the master institution sequence is shared, split, or misparsed.
- Exact reconciliation of every institution code to the correct named body/index offering once that cell boundary is proven.

**Correct disposition:** row 001 is an **unresolved source-context candidate**, not yet a confirmed parser defect. Do not change inventory or mapping based on the text extraction alone. The official IBASS endpoint opens to a JavaScript shell in the available web viewer; the current computer-use session reports no browser surface, so rendered-cell inspection was not achieved in this pass. Continue using primary-source search/local source material and leave the matter open until stronger evidence is available.
