# Lane 2 source-audit checkpoint 014 — German outcome adjudication, rows 31–41

## Scope and source

Continued CCMAS package 080 without repeating its prior field-count screen. Compared all local `skills_learned` entries for GER 303–GER 406 (package rows 31–41) against the exact detailed course blocks in the official NUC Arts CCMAS, accessed 2026-09-28: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), printed pp. 484–489. The JSON checkpoint contains one disposition per row.

## Results

- **Nine rows have confirmed outcome extraction defects:** GER 303 and GER 304 omit the source's explicit continuation outcomes; GER 305 and GER 307 omit the distinct translation/interpretation outcome; GER 401 omits all six outcomes; GER 402 and GER 404 omit the source translation/evaluation outcome; GER 405 omits the source's explicit “same as GER 404” cross-reference; and GER 406 contains two GER 407 long-essay outcomes in its local outcome array.
- **Two rows' outcomes match in count and substance:** GER 306 and GER 403. This is not a package-wide sign-off.
- GER 407 is a separate course required by both the source table and detailed block, but it is absent locally. This is already a confirmed omission in checkpoint 005 and is not double-counted here.
- The NUC source itself leaves an ambiguity for GER 405: the title says English-to-German, while its outcome and content text both refer back to GER 404. Preserve that conflict; do not infer a corrected outcome set.

## Important interpretation

An explicit source cross-reference is evidence, but it is not permission to invent or copy a new list of outcomes. GER 303/304/405 should retain their source-dependency semantics in any later repair. The malformed/overbroad general Arts outcomes in these German course blocks are source content and should not be silently rewritten as if NUC provided more specific outcomes.

No shared CCMAS product JSON, mapping, or seed was edited. Package 080 remains open: prior checkpoints still include rows 1–30 that need item-level outcome comparison, as well as source-internal structure conflicts and the GER 407 omission.
