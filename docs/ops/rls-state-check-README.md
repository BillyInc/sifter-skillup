# RLS and grant state check (read-only)

`rls-state-check-2026-11-27.sql` reports the live row-level-security (RLS) and
privilege state of the `skillup_dev` schema. It exists because the database
audit (finding C1) could not tell from the repository files whether the live
project matches `supabase-schema.sql`.

The file contains only `SELECT` statements and read-only CTEs against
`pg_catalog`, `pg_policies` and the storage metadata tables. It changes
nothing. It uses only catalog and privilege-inspection functions, plus
`query_to_xml()` over one fixed, constant `SELECT` on `storage.buckets`
(section 7, G7). Beyond `skillup_dev` it also looks at `public`, any schema
listed in `pgrst.db_schemas`, `storage`, realtime publications and installed
extensions.

It is designed not to print secrets: it never selects role settings other
than the PostgREST exposed-schema names (a `pgrst.jwt_secret` on the
`authenticator` role is filtered out), function bodies, function settings
other than `search_path`, column defaults, connection strings or table data.
It is not guaranteed secret-free: section 2 (`skillup_dev`), section 2b (the
other scanned schemas) and section 6c (`storage`) print every policy expression
verbatim, and an expression can embed a literal (an e-mail address, a UUID, a
token, a bucket id). See "Before sharing the output".

It was tested on PostgreSQL 16 as a non-superuser inside a `BEGIN READ ONLY`
transaction, against a scratch database with fake `anon`, `authenticated`,
`service_role` and `authenticator` roles, a fake `skillup_dev` schema and
`storage` stubs, with a case for each flag. It uses only syntax available in
PostgreSQL 15.

## How to run

1. Open the Supabase Dashboard, SQL Editor, for the project.
2. The editor shows only the result of the last statement it runs. Either run
   one numbered section at a time (select the section, press Run), or start
   with section 7, the one-screen summary. Sections 2b, 6b and 6c are separate
   statements for this reason; run each on its own. The editor shows at most
   1000 rows and drops the rest silently: sections 1c, 2, 2b, 4 and 7 have a
   `result_rows` column (the true total) and a `warning` column, set from 900
   rows. If you see a warning, narrow the query (see "Large results" below)
   before reading it.
3. Copy or export each result (CSV is fine), skim it as described in
   "Before sharing the output", and share it with the maintainer. Do not paste
   keys or connection strings; none are needed.
4. Section 7 is a heuristic summary, not a verdict. Reading sections 2 and 2b
   (every policy, verbatim) is mandatory: a policy that is always true in a way
   the patterns do not recognise appears only there.

## What each section tells you

| Section | Question it answers | How to read it |
| --- | --- | --- |
| 0 | Who ran it, which server | Sanity check only. |
| 1a | Per table: is RLS on, and what can `anon`, `authenticated`, `service_role` do | `rls_enabled = false` with an `anon_*` privilege true means any caller holding the anon key (shipped in the app) can use that privilege through the REST API, provided the schema is exposed (3d) and `anon` has `USAGE` on it (3a); the same with an `auth_*` privilege means any signed-in user can. Read `anon_select` and `auth_select` separately: a table readable only by `authenticated` is not anonymously readable. `policy_count = 0` with RLS on means deny-all for those roles. Privileges are effective (include grants via PUBLIC). `*_select/_insert/_update/_delete` are table-level; `*_any_col_*` also count column-level grants. `*_truncate_trigger_refs` lists TRUNCATE (bypasses RLS), TRIGGER and REFERENCES grants. |
| 1b | Same, for the tables named in the audit | Quick view of `users`, `game_states`, `level_scores`, `posts`, `post_likes`, `notifications`, `guild_messages`, `career_context_items` and others. `anon_privs` letters: S select, I insert, U update, D delete. |
| 1c | Table-level ACL from `pg_class.relacl` (all grantors, tables, views, matviews), for `anon`, `authenticated`, `service_role` and `PUBLIC` | Complete ACL. A NULL ACL is shown as the owner default. Compare with 1a: a privilege in 1a with no row here for that role came from PUBLIC or role membership. One row per object, grantee and grantor, so a large schema can approach the SQL editor's 1000-row display cap: `result_rows` is the true total and `warning` is set from 900 rows. If it is, run **1c-compact** (one row per object, privileges as codes: a insert, r select, w update, d delete, D truncate, x references, t trigger). |
| 1d | Column-level grants (`pg_attribute.attacl`) | Empty means no column-only grants. A row lets that role read or write just those columns even when 1c shows no table-level privilege. |
| 2 | Every policy on `skillup_dev` (verbatim; other schemas are 2b, `storage` is 6c) | Has `result_rows` and `warning` (from 900 rows; filter by table on the marked line). **Mandatory review.** Check `roles`, `cmd`, `using_expr`, `with_check_expr`. `auth.uid() = id` style policies only match requests that carry a Supabase JWT. This is the backstop for G2: read it for always-true expressions the flag patterns do not recognise. Restrictive policies are listed but G2 does not evaluate them. `review_literals = true` marks expressions that look like they embed a UUID, e-mail address or a token-like run of 32+ characters containing a digit or an upper-case letter (plain identifiers of lower-case letters and underscores, such as a long table name inside an `EXISTS` subquery, are not marked). It does not detect short secrets, so skim every row anyway. |
| 2b | Every policy on the other schemas section 7 scans (verbatim) | Same columns as section 2, plus `result_rows` and `warning` (from 900 rows; edit point to filter by schema or table). Covers `public`, every schema in `pgrst.db_schemas` and every schema with a table in the `supabase_realtime` publication, except `skillup_dev` (section 2) and `storage` (6c). **Mandatory review** when section 7 has a G2 row on one of these schemas: there the redacted, cut detail is all section 7 shows. Run it on its own. |
| 3a | Schema `USAGE` and `CREATE` | `anon_usage = false` on `skillup_dev` blocks the API for that role regardless of table grants. `*_create = true` is never wanted. |
| 3b | Default privileges: configured (`pg_default_acl`) and PostgreSQL built-in | Scoped to `skillup_dev`, `public`, `storage` and "all schemas" defaults, for roles that own objects there (plus `postgres`, `supabase_admin` and the current user), and to grants for `anon`/`authenticated`/`service_role`/`PUBLIC`. The `source` column says where a row comes from. `configured` rows are `ALTER DEFAULT PRIVILEGES` entries; a row granting to `anon`/`authenticated`/`PUBLIC` means every future object of that type created by that role is granted automatically (a schema-specific entry is added to the all-schemas default). `built-in (no global entry)` rows are the PostgreSQL defaults (`acldefault()`) for a creating role and object type that has no all-schemas entry. **Absence of `configured` rows does not mean new objects start closed:** PostgreSQL grants `EXECUTE` on every new function and procedure to `PUBLIC` (and `USAGE` on new types) by default, and an explicit grant to another role does not remove it. The built-in `functions ... PUBLIC ... EXECUTE` row is that default; it is removed only by `ALTER DEFAULT PRIVILEGES ... REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` for that role (an all-schemas entry), after which the row disappears or shows as `configured`. New tables and sequences have no `PUBLIC` or API-role default, so for them no row means closed. |
| 3c | Sequence privileges | `UPDATE` for API roles on a sequence lets them advance it. |
| 3d | Hint for exposed schemas | Best effort. Prints only the `pgrst.db_schemas` and `pgrst.db_extra_search_path` settings, per role and at `ALTER DATABASE` level (shown as `(all roles)`, with the database name); every other setting (for example `pgrst.jwt_secret`) is filtered out and never printed. Confirm in Dashboard, Project Settings, API, Exposed schemas. If `skillup_dev` is not exposed, the REST API cannot reach it at all (but the backend's service client still can). |
| 4 | Functions: `security_definer`, `search_path_setting`, who may execute | Has `result_rows` and `warning` (from 900 rows; definer functions are listed first; filter on the marked line). A definer function with `public_execute`, `anon_execute` or `authenticated_execute` true runs with owner rights for whoever may call it. `has_search_path = false` on a definer function is a hijack risk. Only the `search_path` function setting is printed; other settings are counted in `other_settings_hidden`. Trigger functions are listed here but are not flagged by G3. |
| 5 | Views and `security_invoker` | `(not set: owner rights)` means the view bypasses RLS on its base tables; if `anon_select` or `authenticated_select` is true, the view can expose rows RLS would hide (for example `user_progress`). |
| 6a | Storage buckets | `public = true` means objects are readable by URL without auth. Check `file_size_limit` and `allowed_mime_types` are set where uploads are accepted. If the running role is itself subject to RLS on `storage.buckets`, or there are no buckets, a first row with a `note` says so: an empty list is then not proof that no buckets exist. Run it as `postgres` in the SQL editor. |
| 6b | RLS flags on `storage.objects` and `storage.buckets` | RLS should be on for `objects`. |
| 6c | Policies on the `storage` schema | A bucket is only as private as these policies. No policies with RLS on means only the service role can touch objects. Printed verbatim, so a policy can show a bucket id or another literal; `review_literals` marks likely secrets (same rule as section 2). |
| 6d | Tables in the `supabase_realtime` publication | Realtime streams a published table's changes to every role that passes RLS. A published table with RLS off, or an open SELECT policy, streams its rows to anyone with the key. |
| 6e | Installed extensions | Names and versions only. `outbound_or_privileged = true` marks `dblink`, `pg_net`, `http`, FDWs, untrusted languages, vault and similar: check who can call their functions. |
| 7 | Red-flag summary | See below. Never empty. The first row is a SUMMARY row with the total and a per-check count. |

## Section 7 flags

Output order: a first `G0` row with severity `SUMMARY` (total flag rows, counts
per severity and per check, and a WARNING when the total exceeds 900), then the
`G0` scan rows, then HIGH, MEDIUM, REVIEW and INFO rows (inside a severity, the
checks with fewer rows of that severity come first). The SQL editor shows at most 1000 rows and
cuts the rest without saying so, so the most serious rows are placed first.
`result_rows` is the number of rows in the current run. The SUMMARY detail ends with "Heuristic; read sections 2/2b/6c; not a verdict."

The flags are heuristics over catalog data. They point at things to read;
sections 1a, 2, 2b and 4 are the evidence. Privilege checks include column-level
grants (`has_any_column_privilege`) for SELECT, INSERT and UPDATE. Scope:
`skillup_dev`, `public`, `storage`, every schema in the `pgrst.db_schemas`
setting (if the role setting exists) and every schema with a table in the
`supabase_realtime` publication. Objects owned by extensions are skipped.

| check_id | Meaning |
| --- | --- |
| G0 | Always present. A `SUMMARY` row comes first (totals and per-check counts, plus a WARNING above 900 rows). Then `scanned N tables, M policies, K functions, J views in <schema>` for `skillup_dev` and each other scanned schema (views include materialized views), plus the `pgrst.db_schemas` value found. Also `schema missing` when `skillup_dev` does not exist (HIGH if tables live in `public` instead, otherwise INFO), and a MEDIUM row when the schema exists but has no tables. Read these before anything else: a section 7 result that has only G0, G7, G8 and G10 INFO rows (plus the SUMMARY row) means nothing was flagged, not that the project is clean. Any other INFO row (G1, G2, G4, G5, G9) is a finding with a lower severity, because no API role holds the matching privilege today (for example a `USING (true)` policy on a table with no grants gives only an INFO G2 row). |
| G1 | `anon` or `authenticated` holds SELECT, INSERT, UPDATE or DELETE (table or column level) on a table, partitioned table or foreign table with RLS disabled. This is not the same as "anyone can read it": the detail shows `SELECT=` for each role next to the any-privilege flag. Only `anon` privileges are reachable with the public anon key alone; `authenticated` needs a signed-in user. Reachability through the REST API also needs the schema in `pgrst.db_schemas` and `USAGE` on it (the detail shows both). A foreign table cannot have RLS at all, so any such grant is flagged and the grants are the only control; remove it with `REVOKE` if it is not wanted. HIGH when that role also has USAGE on the schema; MEDIUM when the schema is known not to be in `pgrst.db_schemas`; INFO when no API role has schema USAGE (unreachable through the API). The detail shows both. |
| G2 | A permissive policy that applies to `public`, `anon` or `authenticated` and whose `USING` or `WITH CHECK` is always true for that role. "Applies to" uses effective role membership, not the literal `TO` list: a policy `TO app_reader USING (true)` applies to `authenticated` when `authenticated` is a member of `app_reader` and inherits its privileges (`pg_has_role(..., 'USAGE')`, so a direct or indirect membership with `INHERIT`; a `NOINHERIT` membership does not count, and `PUBLIC` always does). **Expression kinds are kept apart:** an always-true `USING` is only an exposure when the role holds a privilege that `USING` governs (`SELECT` for a SELECT policy, `UPDATE` for UPDATE, `DELETE` for DELETE, any of the three for ALL), and an always-true `WITH CHECK` only when it holds `INSERT` (INSERT policy), `UPDATE` (UPDATE policy) or either (ALL). An `ALL` or `UPDATE` policy with no `WITH CHECK` uses its `USING` as the check. So `ALL USING (false) WITH CHECK (true)` for an `anon` that holds only `SELECT` is not HIGH (INFO: open expression, no matching privilege), and is HIGH once `anon` also holds `INSERT` or `UPDATE`; the detail names the open expression kind(s). The always-true forms recognised are: literally `true` or `1=1`; `auth.role()`, `auth.jwt()->>'role'` or the `request.jwt.claim.role` setting equal to, or `IN` / `= ANY` a list CONTAINING (among any other elements), `anon` or `authenticated` (an `IN (...)` list, `ANY (ARRAY[...])` or a `'{a,b}'` array literal, for example `auth.role() IN ('anon', 'dashboard_user')`, `= ANY ('{x,authenticated}'::text[])`); or `auth.uid()`/`auth.jwt()` `IS NOT NULL`; `true AND true`, and an always-true `AND` arm next to such a test (`auth.role() = 'authenticated' AND true`, `true AND auth.role() = 'authenticated'`); the `current_setting('request.jwt.claims', true)::jsonb->>'role'` form. Supabase's recommended initplan style `(select auth.uid()) is not null` and `(select auth.role()) = 'authenticated'` (including `as` aliases and `::text` casts) is recognised. HIGH when `anon` holds the matching privilege (any table name) or `authenticated` holds it on a table on the sensitive list; REVIEW for `authenticated`-only on other tables (acceptable only for true reference data); INFO when the policy is open but no matching privilege is held. The detail shows only the matching expression, with quoted string literals replaced by `'?'` and every double-quoted identifier replaced by `"?"` (the exact words `anon`, `authenticated`, `service_role`, `role`, `email`, `sub`, `app_metadata`, `user_metadata`, `request.jwt.claims` and `request.jwt.claim.role` that the patterns use are kept as literals). It shows at most about 300 characters per expression, placed around the first token that can trigger the flag (`true`, `1=1`, `auth.`, `request.jwt`, `IS NOT NULL`, an API role name), with `...` at each end where text was cut; so a long expression shows the part that matched instead of ending before it. The full text is printed in section 2 (`skillup_dev`), section 2b (the other scanned schemas) and section 6c (`storage`); for a G2 row on `public`, an exposed schema or `storage` the redacted detail is otherwise the only text section 7 gives (`review_literals` marks likely secrets). It also shows the number of restrictive policies on the table. Restrictive policies are not evaluated, so a permissive `true` policy neutralised by a restrictive one is still flagged. Policies limited to `service_role` are not flagged. Also applies to `storage.objects`. A second, cheaper heuristic marks a policy as POSSIBLY open (MEDIUM when `anon` holds the privilege or `authenticated` holds it on a sensitive table, otherwise REVIEW, never HIGH) when its normalised expression has an `OR` arm that is open to an API role (`auth.role() = 'authenticated' OR auth.uid() = id`, `auth.role() = 'anon' OR auth.role() = 'authenticated'`), contains an always-true `OR` arm in any position (`true OR x`, `x OR true`), mixes `request.jwt.claims` with an `anon`/`authenticated` literal, or is `<column> IS NOT NULL`. An open test on the other API role (for example `auth.role() IN ('authenticated', 'admin_x')` on an `anon` policy) is also reported this way. Known false positives: a column whose name ends in a digit such as `author1 = 1` or `color1 = 1` matches the always-true `x1 = 1` pattern after whitespace and parentheses are removed (read the policy: it is not a tautology); whitespace is removed from the normalised text including inside string literals, so `auth.role() = ' authenticated'` (a leading or trailing space in the literal) is treated like `auth.role() = 'authenticated'`; and a policy `TO authenticated USING (auth.role() = 'anon')`, which can never be true for that role, is still reported (REVIEW on a non-sensitive table) because the test is on the expression, not on the role it is limited to. Known blind spots (read sections 2 and 2b for these): helper functions that return true or wrap `auth.uid()`; `EXISTS` subqueries that are always true; tautologies such as `id = id`, `1 < 2`, `'a' = 'a'` or `coalesce(...)`; negated or `<>` forms other than `<> 'anon'`/`<> 'authenticated'` on the role expression; `CASE` expressions; JSON comparisons such as `auth.jwt()->'role'`; `OR` arms inside nested parentheses or mixed with `AND` (precedence is not parsed: a tautology behind an `AND` with a non-trivial arm, such as `a AND (true OR b)`, an `IS NOT NULL` arm that is not the whole expression, such as `auth.uid() = id OR k IS NOT NULL`, and any always-true arm that is not literally `true`/`1=1` are not recognised); other custom claims; and any open expression written differently from the patterns. Expressions cleverer than these patterns are not caught: reading sections 2 and 2b is mandatory. |
| G3 | A SECURITY DEFINER function (trigger and event-trigger functions excluded: they cannot be called directly) executable by `PUBLIC` or `anon` (HIGH) or by `authenticated` only (MEDIUM, raised to HIGH when `search_path` is not pinned). The detail says whether `search_path` is pinned. |
| G4 | Informational. RLS on, API roles hold grants, but no policy exists. SELECT returns no rows; UPDATE and DELETE silently affect 0 rows; INSERT raises error 42501 (row-level security violation). An upsert (`INSERT ... ON CONFLICT DO UPDATE`) needs INSERT, SELECT and UPDATE policies and raises 42501 without them even for a row that does not conflict, so a table with an INSERT policy but no SELECT/UPDATE policy still fails on upsert; `ON CONFLICT DO NOTHING` needs only the INSERT policy. |
| G5 | Informational. RLS on, an API role holds a write grant and a write policy targets that role, and every permissive INSERT/UPDATE/DELETE/ALL policy that applies to it references an auth function (`auth.uid()`, `auth.jwt()`, `auth.role()`, `auth.email()` or `request.jwt`). The row only says the policy references an auth function. It claims rejection (INSERT raises 42501, UPDATE/DELETE silently affect 0 rows when the backend sends no Supabase user JWT) only when every such policy is written so that it REQUIRES an identity, such as `auth.uid() = user_id`, `auth.uid() IS NOT NULL` or `auth.role() = 'authenticated'`. A policy containing `IS NULL`, `NOT`, `<>`, `!=`, `OR`, `true`, `coalesce`, `nullif`, `CASE`, `IS DISTINCT` or the literal `'anon'` (for example `WITH CHECK (auth.uid() IS NULL)`, which PASSES when there is no user JWT) gets neutral wording and no rejection claim: read its expression in sections 2 and 2b. The test is a text match, so a word inside a literal also suppresses the claim. Expected for normal tables; only relevant if the backend uses that role without a Supabase user JWT. A role with a write grant but no policy at all for it is simply blocked and is not reported (tables with no policy are G4). Heuristic: a policy calling a helper function that wraps `auth.uid()` looks independent to this check. Caveat: a table whose only policy targets `service_role`, or whose write policies target only the other API role (for example `anon`) while `authenticated` holds the write grant, gets no G4 or G5 row for that role (G4 needs no policy at all; G5 needs a write policy that targets the role). The role is simply blocked, but a clean section 7 therefore does not mean every API-role grant is backed by a policy: compare sections 1a and 2. |
| G6 | A view or materialized view that `anon` or `authenticated` can SELECT and that runs with owner rights (no `security_invoker=true`): HIGH. A view can expose rows that RLS on the base tables hides; a materialized view holds a copy of the base rows and never applies RLS, so it is always HIGH. `security_invoker` needs PostgreSQL 15 or later: on an older server every view is flagged and the fix is unavailable. Confirm what the base tables are. |
| G7 | Storage. A public bucket (MEDIUM), or a MEDIUM warning that the running role is subject to RLS on `storage.buckets` so the bucket list may be incomplete. An INFO row gives the visible and public bucket counts. Open `storage.objects` policies and RLS-off storage tables appear as G2 and G1 rows. |
| G8 | Realtime. An INFO summary of the `supabase_realtime` publication, and a row per published table with RLS off or with a SELECT/ALL policy whose `USING` is open (or possibly open). Realtime streams rows, so only the `SELECT` privilege counts here (not INSERT/UPDATE/DELETE). For RLS-off tables, graded like G1 on SELECT: INFO when no API role has USAGE on the schema (unreachable), MEDIUM when the schema is known not to be exposed or no API role holds SELECT (a published table with only an INSERT grant is MEDIUM), otherwise HIGH. For policies: HIGH when the open role holds SELECT (`authenticated` only on a sensitive table), otherwise REVIEW. The detail shows the SELECT flags. |
| G9 | `anon` or `authenticated` holds TRUNCATE (which bypasses RLS), TRIGGER or REFERENCES on a table or foreign table, one row per table and role. `anon` TRUNCATE is HIGH. Supabase's default grants often include these, so expect many rows (HIGH included) for `public` tables on a stock project; see "Stock Supabase noise" below. |
| G10 | Installed extensions (INFO). `dblink`, `pg_net`, `http`, FDWs, untrusted languages, vault and similar are marked as outbound-capable or privileged. |

The sensitive list used by G2 and G8 covers the audit's tables and the
repository's minors/PII tables (consents, affiliations, subject choices,
provisioning drafts, MFA, roles, feedback, notes, verification submissions,
learning-interest tables, and others). Any open policy where `anon` holds the
privilege is HIGH regardless of table name.

Section 7 is never empty (G0, G7, G8 and G10 INFO rows normally appear). If it shows only G0, G7, G8 and G10 INFO rows
(plus the SUMMARY row), nothing was flagged; that is not a clean bill of health until sections 2 and 2b have been read.
Any other INFO row (G1, G2, G4, G5, G9) is a finding with a lower severity, because no API role holds the privilege
today.

### Large results

If the SUMMARY row (or a `warning` column) says the total exceeds 900, run
section 7 once per check. At the very end of section 7, edit the line marked
`EDIT POINT 1`, for example `check_id IN ('G3')`, run it, then repeat for each
`check_id` the SUMMARY row lists with rows. If one check alone has more than
900 rows (typically G1 or G9 on a project with many tables), also narrow
`EDIT POINT 2` to one severity, for example `severity IN ('HIGH')`. The
SUMMARY row is always kept and always counts the whole result. Sections 2 and 4
have a similar optional marked line (remove the leading `--` and set a table or
function name).

### Stock Supabase noise

On a stock Supabase project the default privileges grant ALL on new `public`
tables and views to `anon` and `authenticated`. Expect many HIGH rows from
G6 (views and materialized views without `security_invoker=true` that those
roles can SELECT) and from G9 (TRUNCATE and the other privileges), and many G1
rows if RLS was never enabled on those tables. They are real exposure only if
the object is in an exposed schema and holds data that should not be public;
treat them as a list to triage, not as 100 separate incidents, and revoke the
default grants (audit M1) rather than object by object.

## Interpreting the C1 question

If the backend sends no Supabase JWT (for example it uses the anon key plus
the app's own JWT), `auth.uid()` is NULL on those calls; that is an
assumption to verify, not something this script can see. Look at `users`, `game_states`, `level_scores`, `posts` and
`post_likes` in sections 1a/1b and 2:

| What you see | Conclusion |
| --- | --- |
| `rls_enabled = true`, API roles hold INSERT/UPDATE/DELETE, only `auth.uid() = ...` policies, no `true` policy | C1 case (a): flagged **G5** (confirm in sections 1a and 2). Backend calls without a Supabase JWT have `auth.uid()` NULL: UPDATE and DELETE affect 0 rows silently and INSERT and an upsert (`ON CONFLICT DO UPDATE`) raise 42501. An INSERT that asks for `return=representation` (or `.select()` after insert) also needs a SELECT policy that passes, otherwise it fails with 42501 even when the INSERT policy passes. Data is not publicly exposed, but profile saves, game state and points are not persisted. |
| `rls_enabled = true`, `policy_count = 0`, grants present | Flagged G4. Reads return nothing, UPDATE/DELETE affect 0 rows silently, INSERT raises 42501. |
| `rls_enabled = false` and `anon_select` true on `users` (G1) | C1 case (b), **publicly readable `users`**, provided the schema is exposed (3d) and `anon` has `USAGE` on it (3a): anyone with the anon key shipped in the app bundle can read (and, if INSERT/UPDATE/DELETE are true, write) every user row including `password_hash`, `email`, `date_of_birth`, `github_token`. Treat as an incident. |
| `rls_enabled = false`, `anon_select` false but `auth_select` true on `users` (G1) | Readable by any signed-in user, not anonymously: still a serious exposure of every user's row to every account holder, but not a public one. The same exposure and `USAGE` conditions apply. |
| `rls_enabled = true` but a policy with `USING true` (or an `ALL` policy for `anon`) on `users` (G2 HIGH) | Also publicly readable, through the policy rather than missing RLS. Same urgency as case (b). |
| `rls_enabled = true`, API roles hold **no** privileges (all `false` in 1b) | Locked down. Backend must be using the service role for these tables; the anon-key call sites would fail loudly. |
| `rls_enabled = true`, policies present, some `anon_*` true on `users` with `with_check_expr` not tied to `auth.uid()` | Writable by anyone satisfying the policy; review the specific expression (audit M3). |

Other quick reads:

- `guild_messages` with a `true` SELECT policy (G2) and `anon_select` or
  `auth_select` true: every guild message, private guilds included, is
  readable by anyone holding a key (audit M3).
- `career_context_items` with a `true` SELECT policy: review-only and
  audit-only rows are readable through the API (audit M3).
- A view in G6 (for example `user_progress`) readable by `anon` or
  `authenticated` can leak rows even when the base tables are locked down.
- Section 3b showing grants to `anon` or `authenticated`: later-created
  objects will be exposed unless revoked per object (audit M1). 3b is limited
  to the relevant schemas and creating roles. Its `built-in` rows are the
  PostgreSQL defaults, not configuration: `EXECUTE` on new functions goes to
  `PUBLIC` unless an all-schemas default revokes it.
- A G5 row on most tables is normal on a standard Supabase layout (RLS on,
  both API roles hold grants, policies use `auth.uid()`); it matters only if
  the backend uses that role without a Supabase JWT.

## Caveats

- If the `skillup_dev` schema does not exist, sections 1 to 6 return empty
  results (3a shows `schema_exists = false`) instead of erroring. Section 7
  then prints a G0 `schema missing` row (HIGH if the tables live in `public`
  instead), so an empty result is never read as clean. Section 6a reads
  `storage.buckets`, and the roles `anon`, `authenticated` and
  `service_role` must exist; on a Supabase project they always do, elsewhere
  those queries error.
- The flags use `has_*_privilege` on the roles `anon` and `authenticated`,
  which already include privileges inherited through role membership. Policy
  `TO` lists are matched against the roles those two roles effectively belong
  to (`pg_has_role(..., 'USAGE')`, inheritance-aware), plus `PUBLIC`. They do
  not model custom login roles used by your own connections, or the
  `authenticator` role's own grants.
- Section 1c reads the full ACL from `pg_class`; it is not limited by the
  current user's visibility the way `information_schema` is.
- Foreign tables cannot have RLS. Section 7 (G1, G9) and 1c, 1d list them;
  sections 1a and 1b cover ordinary and partitioned tables only.
- Section 3d reads `pg_db_role_setting` including database-level settings
  (`ALTER DATABASE ... SET pgrst.db_schemas`), which section 7 also uses for
  the exposed-schema list.
- Remaining G2 blind spots are listed in the G2 row above; the script cannot
  evaluate a policy, only pattern-match its text.

## Before sharing the output

The script is designed not to print keys, connection strings or table data,
but the output is not guaranteed secret-free and it does reveal the schema
and policy design. Before sending it:

- Skim sections 2, 2b and 6c: policy expressions are printed verbatim and may
  contain literal e-mail addresses, UUIDs, tokens or bucket ids (rows with
  `review_literals = true` are the likely ones; short secrets are not
  detected, so read every row). The section 7 detail column prints the
  matched policy text with quoted string literals replaced by `'?'`,
  double-quoted identifiers replaced by `"?"` and cut at about 300 characters
  (with `...`), but it still prints schema, table, policy and bucket names,
  so check it too.
- Skim section 3d (exposed-schema names only), section 6a bucket ids and
  names (both are printed) and section 7 object names for anything
  environment-specific (internal names, customer or project identifiers).

## After you run it

Send the maintainer the results of sections 1a, 1b, 1c (or 1c-compact), 1d, 2, 2b,
3a, 3b, 4, 5, 6a, 6b, 6c, 6d, 6e and 7. Do not apply any fix from this file; remediation is a separate,
reviewed change.
