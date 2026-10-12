# Computational task-signal title reconciliation

Case-insensitive exact role_name match and full alias-token match constrained to the signal's domain_id. Substring/composite titles are reported only as related text and never treated as matches.

| Domain | Signal title | Same-domain exact title | Exact alias | Disposition |
|---|---|---|---|---|
| D139 | gameplay programmer | — | — | no_exact_local_title_or_known_alias |
  Related text only (not matched): Gameplay Engineer / Gameplay Programmer
| D139 | technical artist | technical artist | — | exact_local_title_found |
  Related text only (not matched): technical artist; Technical Artist (Games)
| D139 | game environment artist | — | — | no_exact_local_title_or_known_alias |
| D140 | robotics engineer | robotics engineer | — | exact_local_title_found |
  Related text only (not matched): robotics engineer

Two titles match an exact same-domain local role record (technical artist, D139; robotics engineer, D140). Gameplay programmer appears only as part of a composite title and is not an exact title/alias. Game environment artist has no exact local title/alias. No role was created or moved, and exact title presence does not validate role-to-domain fit.
