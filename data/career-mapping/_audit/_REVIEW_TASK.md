# Per-domain role-review task (for domain-review agents)

For each domain in your assigned batch file (_audit/_batch_NN.json), read its role file
(_audit/domains/<DOMAIN_ID>.json) and review role placement + gaps. Working dir:
C:/Users/USER/Documents/sifter-skillup-integrated/data/career-mapping. Read _audit/_RULES.md first.

For each domain, judge:
1. **Misplaced roles** — roles whose core professional function is NOT this domain (should move
   out or be removed). Cite why (ISCO/field mismatch).
2. **Missing roles** — well-known roles that clearly belong in this domain but are absent
   (esp. global/remote/emerging variants). Give role_name + best ISCO-08 4-digit + 3-6 core skills.
3. **Over-fanout** — roles here that are really generic and appear in many domains (dilution).
4. **Definition fit** — does the domain NAME accurately describe the roles? Suggest rename if not.

Keep it high-signal: only flag genuine issues. A clean domain gets an empty deltas list — that's fine.

WRITE incrementally (one object per domain, re-write file after each domain) to:
  _audit/out/review_<FIRST_ID>_<LAST_ID>.json
Shape:
{"reviews":[
  {"domain_id":"D0xx","domain_name":"...","verdict":"clean|issues",
   "remove_roles":[{"role":"...","reason":"..."}],
   "add_roles":[{"role":"...","isco":"NNNN","skills":["..."],"reason":"...","provenance":"esco|onet|curated"}],
   "overfanout_roles":["..."],
   "rename_to":"<new name or null>",
   "notes":"..."}
]}
Never fabricate — if unsure about a skill list, give what you can justify and add needs_review:true.
Reply with a one-line summary: how many domains clean vs issues, total add/remove counts.
