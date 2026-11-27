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
It is not guaranteed secret-free: section 2 prints every policy expression
verbatim and an expression can embed a literal (an e-mail address, a UUID, a
token). See "Before sharing the output".

It was tested on PostgreSQL 16 as a non-superuser inside a `BEGIN READ ONLY`
transaction, against a scratch database with fake `anon`, `authenticated`,
`service_role` and `authenticator` roles, a fake `skillup_dev` schema and
`storage` stubs, with a case for each flag. It uses only syntax available in
PostgreSQL 15.

## How to run

1. Open the Supabase Dashboard, SQL Editor, for the project.
2. The editor shows only the result of the last statement it runs. Either run
   one numbered section at a time (select the section, press Run), or start
   with section 7, the one-screen summary. Section 6b and 6c are separate
   statements for this reason; run each on its own.
3. Copy or export each result (CSV is fine), skim it as described in
   "Before sharing the output", and share it with the maintainer. Do not paste
   keys or connection strings; none are needed.
4. Section 7 is a heuristic summary, not a verdict. Reading section 2 (every
   policy, verbatim) is mandatory: a policy that is always true in a way the
   patterns do not recognise appears only there.

## What each section tells you

| Section | Question it answers | How to read it |
| --- | --- | --- |
| 0 | Who ran it, which server | Sanity check only. |
| 1a | Per table: is RLS on, and what can `anon`, `authenticated`, `service_role` do | `rls_enabled = false` with any `anon_*` or `auth_*` true means the table is open through the API with the public key. `policy_count = 0` with RLS on means deny-all for those roles. Privileges are effective (include grants via PUBLIC). `*_select/_insert/_update/_delete` are table-level; `*_any_col_*` also count column-level grants. `*_truncate_trigger_refs` lists TRUNCATE (bypasses RLS), TRIGGER and REFERENCES grants. |
| 1b | Same, for the tables named in the audit | Quick view of `users`, `game_states`, `level_scores`, `posts`, `post_likes`, `notifications`, `guild_messages`, `career_context_items` and others. `anon_privs` letters: S select, I insert, U update, D delete. |
| 1c | Table-level ACL from `pg_class.relacl` (all grantors, tables, views, matviews), for `anon`, `authenticated`, `service_role` and `PUBLIC` | Complete ACL. A NULL ACL is shown as the owner default. Compare with 1a: a privilege in 1a with no row here for that role came from PUBLIC or role membership. One row per object, grantee and grantor, so a large schema can approach the SQL editor's 1000-row display cap: `result_rows` is the true total and `warning` is set from 900 rows. If it is, run **1c-compact** (one row per object, privileges as codes: a insert, r select, w update, d delete, D truncate, x references, t trigger). |
| 1d | Column-level grants (`pg_attribute.attacl`) | Empty means no column-only grants. A row lets that role read or write just those columns even when 1c shows no table-level privilege. |
| 2 | Every policy on `skillup_dev` (verbatim) | **Mandatory review.** Check `roles`, `cmd`, `using_expr`, `with_check_expr`. `auth.uid() = id` style policies only match requests that carry a Supabase JWT. This is the backstop for G2: read it for always-true expressions the flag patterns do not recognise. Restrictive policies are listed but G2 does not evaluate them. `review_literals = true` marks expressions that look like they embed a UUID, e-mail address or long token; check those before sharing. |
| 3a | Schema `USAGE` and `CREATE` | `anon_usage = false` on `skillup_dev` blocks the API for that role regardless of table grants. `*_create = true` is never wanted. |
| 3b | Default privileges (`pg_default_acl`) | Scoped to `skillup_dev`, `public`, `storage` and "all schemas" defaults, for roles that own objects there (plus `postgres`, `supabase_admin` and the current user), and to grants for `anon`/`authenticated`/`service_role`/`PUBLIC`. Rows granting to `anon`/`authenticated`/`PUBLIC` mean every future table, sequence or function created by that role is granted automatically. No such rows means new objects start closed. |
| 3c | Sequence privileges | `UPDATE` for API roles on a sequence lets them advance it. |
| 3d | Hint for exposed schemas | Best effort. Prints only the `pgrst.db_schemas` and `pgrst.db_extra_search_path` settings of any role; every other setting (for example `pgrst.jwt_secret`) is filtered out and never printed. Confirm in Dashboard, Project Settings, API, Exposed schemas. If `skillup_dev` is not exposed, the REST API cannot reach it at all (but the backend's service client still can). |
| 4 | Functions: `security_definer`, `search_path_setting`, who may execute | A definer function with `public_execute`, `anon_execute` or `authenticated_execute` true runs with owner rights for whoever may call it. `has_search_path = false` on a definer function is a hijack risk. Only the `search_path` function setting is printed; other settings are counted in `other_settings_hidden`. Trigger functions are listed here but are not flagged by G3. |
| 5 | Views and `security_invoker` | `(not set: owner rights)` means the view bypasses RLS on its base tables; if `anon_select` or `authenticated_select` is true, the view can expose rows RLS would hide (for example `user_progress`). |
| 6a | Storage buckets | `public = true` means objects are readable by URL without auth. Check `file_size_limit` and `allowed_mime_types` are set where uploads are accepted. If the running role is itself subject to RLS on `storage.buckets`, or there are no buckets, a first row with a `note` says so: an empty list is then not proof that no buckets exist. Run it as `postgres` in the SQL editor. |
| 6b | RLS flags on `storage.objects` and `storage.buckets` | RLS should be on for `objects`. |
| 6c | Policies on the `storage` schema | A bucket is only as private as these policies. No policies with RLS on means only the service role can touch objects. |
| 6d | Tables in the `supabase_realtime` publication | Realtime streams a published table's changes to every role that passes RLS. A published table with RLS off, or an open SELECT policy, streams its rows to anyone with the key. |
| 6e | Installed extensions | Names and versions only. `outbound_or_privileged = true` marks `dblink`, `pg_net`, `http`, FDWs, untrusted languages, vault and similar: check who can call their functions. |
| 7 | Red-flag summary | See below. Never empty. |

## Section 7 flags

The flags are heuristics over catalog data. They point at things to read;
sections 1a, 2 and 4 are the evidence. Privilege checks include column-level
grants (`has_any_column_privilege`) for SELECT, INSERT and UPDATE. Scope:
`skillup_dev`, `public`, `storage`, every schema in the `pgrst.db_schemas`
setting (if the role setting exists) and every schema with a table in the
`supabase_realtime` publication. Objects owned by extensions are skipped.

| check_id | Meaning |
| --- | --- |
| G0 | Always present. `scanned N tables, M policies, K functions, J views in <schema>` for `skillup_dev` and each other scanned schema (views include materialized views), plus the `pgrst.db_schemas` value found. Also `schema missing` when `skillup_dev` does not exist (HIGH if tables live in `public` instead, otherwise INFO), and a MEDIUM row when the schema exists but has no tables. Read these before anything else: a section 7 result that has only G0 INFO rows means nothing matched the patterns, not that the project is clean. |
| G1 | `anon` or `authenticated` holds SELECT, INSERT, UPDATE or DELETE (table or column level) on a table with RLS disabled. HIGH when that role also has USAGE on the schema; MEDIUM when the schema is known not to be in `pgrst.db_schemas`; INFO when no API role has schema USAGE (unreachable through the API). The detail shows both. |
| G2 | A permissive policy that applies to `public`, `anon` or `authenticated` and whose `USING` or `WITH CHECK` is always true for that role: literally `true` or `1=1`; `auth.role()`, `auth.jwt()->>'role'` or the `request.jwt.claim.role` setting equal to, or `IN`/`= ANY` a list containing, `anon` or `authenticated`; or `auth.uid()`/`auth.jwt()` `IS NOT NULL`. Supabase's recommended initplan style `(select auth.uid()) is not null` and `(select auth.role()) = 'authenticated'` (including `as` aliases and `::text` casts) is recognised. HIGH when `anon` holds the matching privilege (any table name) or `authenticated` holds it on a table on the sensitive list; REVIEW for `authenticated`-only on other tables (acceptable only for true reference data); INFO when the policy is open but no matching privilege is held. The detail shows only the matching expression, and the number of restrictive policies on the table. Restrictive policies are not evaluated, so a permissive `true` policy neutralised by a restrictive one is still flagged. Policies limited to `service_role` are not flagged. Also applies to `storage.objects`. Expressions cleverer than these patterns are not caught: reading section 2 is mandatory. |
| G3 | A SECURITY DEFINER function (trigger and event-trigger functions excluded: they cannot be called directly) executable by `PUBLIC` or `anon` (HIGH) or by `authenticated` only (MEDIUM, raised to HIGH when `search_path` is not pinned). The detail says whether `search_path` is pinned. |
| G4 | Informational. RLS on, API roles hold grants, but no policy exists. SELECT returns no rows; UPDATE and DELETE silently affect 0 rows; INSERT (and upsert) raises error 42501 (row-level security violation). |
| G5 | Informational. RLS on, an API role holds a write grant and a write policy targets that role, but no permissive INSERT/UPDATE/DELETE/ALL policy for it works without `auth.uid()`/`auth.jwt()`. Expected for normal tables; only relevant if the backend uses that role without a Supabase JWT, in which case INSERT raises 42501 and UPDATE/DELETE silently affect 0 rows. A role with a write grant but no policy at all for it is simply blocked and is not reported (tables with no policy are G4). Heuristic: a policy calling a helper function that wraps `auth.uid()` looks independent to this check. |
| G6 | A view or materialized view that `anon` or `authenticated` can SELECT and that runs with owner rights (no `security_invoker=true`): HIGH. A view can expose rows that RLS on the base tables hides; a materialized view holds a copy of the base rows and never applies RLS, so it is always HIGH. `security_invoker` needs PostgreSQL 15 or later: on an older server every view is flagged and the fix is unavailable. Confirm what the base tables are. |
| G7 | Storage. A public bucket (MEDIUM), or a MEDIUM warning that the running role is subject to RLS on `storage.buckets` so the bucket list may be incomplete. An INFO row gives the visible and public bucket counts. Open `storage.objects` policies and RLS-off storage tables appear as G2 and G1 rows. |
| G8 | Realtime. An INFO summary of the `supabase_realtime` publication, and a row per published table with RLS off (HIGH if anon or authenticated can SELECT, otherwise MEDIUM) or with an open SELECT/ALL policy. |
| G9 | `anon` or `authenticated` holds TRUNCATE (which bypasses RLS), TRIGGER or REFERENCES on a table, one row per table and role. `anon` TRUNCATE is HIGH. Supabase's default grants on `public` often include these, so expect rows there. |
| G10 | Installed extensions (INFO). `dblink`, `pg_net`, `http`, FDWs, untrusted languages, vault and similar are marked as outbound-capable or privileged. |

The sensitive list used by G2 and G8 covers the audit's tables and the
repository's minors/PII tables (consents, affiliations, subject choices,
provisioning drafts, MFA, roles, feedback, notes, verification submissions,
learning-interest tables, and others). Any open policy where `anon` holds the
privilege is HIGH regardless of table name.

Section 7 is never empty. If it shows only G0 INFO rows, nothing matched the
patterns; that is not a clean bill of health until section 2 has been read.

## Interpreting the C1 question

If the backend sends no Supabase JWT (for example it uses the anon key plus
the app's own JWT), `auth.uid()` is NULL on those calls; that is an
assumption to verify, not something this script can see. Look at `users`, `game_states`, `level_scores`, `posts` and
`post_likes` in sections 1a/1b and 2:

| What you see | Conclusion |
| --- | --- |
| `rls_enabled = true`, API roles hold INSERT/UPDATE/DELETE, only `auth.uid() = ...` policies, no `true` policy | C1 case (a): flagged **G5** (confirm in sections 1a and 2). Backend calls without a Supabase JWT have `auth.uid()` NULL: UPDATE and DELETE affect 0 rows silently and INSERT/upsert raises 42501. An INSERT that asks for `return=representation` (or `.select()` after insert) also needs a SELECT policy that passes, otherwise it fails with 42501 even when the INSERT policy passes. Data is not publicly exposed, but profile saves, game state and points are not persisted. |
| `rls_enabled = true`, `policy_count = 0`, grants present | Flagged G4. Reads return nothing, UPDATE/DELETE affect 0 rows silently, INSERT raises 42501. |
| `rls_enabled = false` and `anon_select` or `auth_select` true on `users` (G1) | C1 case (b), **publicly readable `users`**: anyone with the anon key shipped in the app bundle can read (and, if INSERT/UPDATE/DELETE are true, write) every user row including `password_hash`, `email`, `date_of_birth`, `github_token`. Treat as an incident. |
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
  to the relevant schemas and creating roles.
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
- The flags use `has_*_privilege` on the roles `anon` and `authenticated`.
  They do not model role membership in other custom roles used by your own
  connections, or the `authenticator` role's own grants.
- Section 1c reads the full ACL from `pg_class`; it is not limited by the
  current user's visibility the way `information_schema` is.

## Before sharing the output

The script is designed not to print keys, connection strings or table data,
but the output is not guaranteed secret-free and it does reveal the schema
and policy design. Before sending it:

- Skim section 2: policy expressions are printed verbatim and may contain
  literal e-mail addresses, UUIDs or tokens (rows with `review_literals =
  true` are the likely ones). The section 7 detail column prints only the
  matched always-true part of an expression, but check it too.
- Skim section 3d (exposed-schema names only), section 6a bucket names and
  section 7 object names for anything environment-specific (internal names,
  customer or project identifiers).

## After you run it

Send the maintainer the results of sections 1a, 1b, 1c (or 1c-compact), 1d, 2,
3a, 3b, 4, 5, 6a, 6b, 6c, 6d, 6e and 7. Do not apply any fix from this file; remediation is a separate,
reviewed change.
