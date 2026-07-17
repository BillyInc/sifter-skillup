# Career Intelligence Access Policy

This platform should expose decision views, not raw database exports.

## Public And Guest Access

- Search endpoints must require a meaningful query.
- Public results must be capped and paginated or sliced.
- Guests may inspect programme, role and domain detail pages, but must not get
  bulk graph downloads, source tables or full edge dumps.
- Guest comparison is allowed as a decision tool for a small selected set only.

## Student Access

- Students can compare a small number of programmes or schools for decision
  making.
- Student comparison should show interpretable signals: domains unlocked,
  admission/cutoff status, role paths, entrepreneurship/build path and saved
  notes.
- Students should not see admin peer benchmarks, institutional coverage reports
  or other schools' aggregate dashboards.

## Admin Access

- Institution, school and tutorial-centre admin mode requires an owner-issued
  admin access code until document/email verification is fully operational.
- The admin access code only unlocks admin mode. It is not proof of ownership.
- Verification proof, school affiliation codes and student claim codes are
  separate lanes and must remain separate in UI and backend code.

## Data Protection

- Do not add public `all programmes`, `all domains`, `all roles` or `all edges`
  endpoints.
- Keep raw sources, provenance joins and full graph edges server-side.
- Add server-side rate limits before launching at scale.
- Add monitoring for repeated broad searches, scripted enumeration and unusual
  comparison/session patterns.
- Export features should be account-gated and watermarkable.
