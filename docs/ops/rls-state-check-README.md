# RLS and grant state check (read-only)

`rls-state-check-2026-11-27.sql` reports the live row-level-security (RLS) and
privilege state of the `skillup_dev` schema. It exists because the database
audit (finding C1) could not tell from the repository files whether the live
project matches `supabase-schema.sql`.

The file contains only `SELECT` statements and a read-only CTE against
`pg_catalog`, `pg_policies` and the storage metadata tables. It changes
nothing and contains no secrets. It was tested against an empty scratch
PostgreSQL database (inside a `BEGIN READ ONLY` transaction) with fake
`anon`, `authenticated` and `service_role` roles.

## How to run

1. Open the Supabase Dashboard, SQL Editor, for the project.
2. The editor shows only the result of the last statement it runs. Either run
   one numbered section at a time (select the section, press Run), or start
   with section 7, the one-screen summary. Section 6b and 6c are separate
   statements for this reason; run each on its own.
3. Copy or export each result (CSV is fine) and share it with the maintainer.
   Do not paste keys or connection strings; none are needed.

## What each section tells you

| Section | Question it answers | How to read it |
| --- | --- | --- |
| 0 | Who ran it, which server | Sanity check only. |
| 1a | Per table: is RLS on, and what can `anon`, `authenticated`, `service_role` do | `rls_enabled = false` with any `anon_*` or `auth_*` true means the table is open through the API with the public key. `policy_count = 0` with RLS on means deny-all for those roles. Privileges are effective (include grants via PUBLIC). `*_select/_insert/_update/_delete` are table-level; `*_any_col_*` also count column-level grants. |
| 1b | Same, for the tables named in the audit | Quick view of `users`, `game_states`, `level_scores`, `posts`, `post_likes`, `notifications`, `guild_messages`, `career_context_items` and others. `anon_privs` letters: S select, I insert, U update, D delete. |
| 1c | Table-level ACL from `pg_class.relacl` (all grantors, tables, views, matviews), for `anon`, `authenticated`, `service_role` and `PUBLIC` | Complete ACL. A NULL ACL is shown as the owner default. Compare with 1a: a privilege in 1a with no row here for that role came from PUBLIC or role membership. |
| 1d | Column-level grants (`pg_attribute.attacl`) | Empty means no column-only grants. A row lets that role read or write just those columns even when 1c shows no table-level privilege. |
| 2 | Every policy on `skillup_dev` | Check `roles`, `cmd`, `using_expr`, `with_check_expr`. `auth.uid() = id` style policies only match requests that carry a Supabase JWT. This is the backstop for G2: read it for always-true expressions the flag patterns do not recognise. |
| 3a | Schema `USAGE` and `CREATE` | `anon_usage = false` on `skillup_dev` blocks the API for that role regardless of table grants. `*_create = true` is never wanted. |
| 3b | Default privileges (`pg_default_acl`) | Rows granting to `anon`/`authenticated`/`PUBLIC` mean every future table, sequence or function created by that role is granted automatically. No such rows means new objects start closed. |
| 3c | Sequence privileges | `UPDATE` for API roles on a sequence lets them advance it. |
| 3d | Hint for exposed schemas | Best effort. Confirm in Dashboard, Project Settings, API, Exposed schemas. If `skillup_dev` is not exposed, the REST API cannot reach it at all (but the backend's service client still can). |
| 4 | Functions: `security_definer`, `has_search_path`, who may execute | A definer function with `public_execute`, `anon_execute` or `authenticated_execute` true runs with owner rights for whoever may call it. `has_search_path = false` on a definer function is a hijack risk. |
| 5 | Views and `security_invoker` | `(not set: owner rights)` means the view bypasses RLS on its base tables; if `anon_select` or `authenticated_select` is true, the view can expose rows RLS would hide (for example `user_progress`). |
| 6a | Storage buckets | `public = true` means objects are readable by URL without auth. Check `file_size_limit` and `allowed_mime_types` are set where uploads are accepted. |
| 6b | RLS flags on `storage.objects` and `storage.buckets` | RLS should be on for `objects`. |
| 6c | Policies on the `storage` schema | A bucket is only as private as these policies. No policies with RLS on means only the service role can touch objects. |
| 7 | Red-flag summary | See below. |

## Section 7 flags

The flags are heuristics over catalog data. They point at things to read;
sections 1a, 2 and 4 are the evidence. Privilege checks include column-level
grants (`has_any_column_privilege`) for SELECT, INSERT and UPDATE.

| check_id | Meaning |
| --- | --- |
| G1 | `anon` or `authenticated` holds SELECT, INSERT, UPDATE or DELETE (table or column level) on a table with RLS disabled. Always a finding. |
| G2 | A permissive policy that applies to `public`, `anon` or `authenticated` and whose `USING` or `WITH CHECK` is always true: literally `true`, `1=1`, `auth.role() = 'anon'` or `'authenticated'`, or `auth.uid() IS NOT NULL`. HIGH on the audit's sensitive tables when a matching role really holds the privilege; REVIEW on other tables (acceptable only for true reference data); INFO when the policy is open but no matching privilege is held. The detail shows whether each role holds the privilege. Policies limited to `service_role` (the normal `TO service_role USING (true)`) are not flagged. Expressions cleverer than these patterns are not caught: section 2 is the backstop. |
| G3 | A SECURITY DEFINER function executable by `PUBLIC` or `anon` (HIGH) or by `authenticated` only (MEDIUM). The detail says whether `search_path` is pinned. |
| G4 | Informational. RLS on, API roles hold grants, but no policy exists. SELECT returns no rows; UPDATE and DELETE silently affect 0 rows; INSERT (and upsert) raises error 42501 (row-level security violation). |
| G5 | Informational. RLS on, policies exist, an API role holds a write grant, but no permissive INSERT/UPDATE/DELETE/ALL policy for that role works without `auth.uid()` or `auth.jwt()`. A caller without a Supabase JWT gets 42501 on INSERT and silent 0-row UPDATE/DELETE. Heuristic: a policy calling a helper function that wraps `auth.uid()` looks independent to this check. Tables with no policy at all are G4. |
| G6 | A view (HIGH) or materialized view (MEDIUM) without `security_invoker=true` that `anon` or `authenticated` can SELECT. It runs with its owner's rights, so it can expose rows that RLS on the base tables hides (for example `user_progress`). Confirm what the base tables are. Materialized views never apply RLS. |

An empty result means nothing was flagged.

## Interpreting the C1 question

The backend uses the anon key with its own JWT, so `auth.uid()` is NULL on
those calls. Look at `users`, `game_states`, `level_scores`, `posts` and
`post_likes` in sections 1a/1b and 2:

| What you see | Conclusion |
| --- | --- |
| `rls_enabled = true`, API roles hold INSERT/UPDATE/DELETE, only `auth.uid() = ...` policies, no `true` policy | C1 case (a): flagged **G5** (confirm in sections 1a and 2). Backend calls without a Supabase JWT have `auth.uid()` NULL: UPDATE and DELETE affect 0 rows silently and INSERT/upsert raises 42501. Data is not publicly exposed, but profile saves, game state and points are not persisted. |
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
  objects will be exposed unless revoked per object (audit M1).

## Caveats

- If the `skillup_dev` schema does not exist, the sections return empty
  results (3a shows `schema_exists = false`) instead of erroring. Section 6a
  reads `storage.buckets` and the roles `anon`, `authenticated` and
  `service_role` must exist; on a Supabase project they always do, elsewhere
  those queries error.
- Section 1c reads the full ACL from `pg_class`; it is not limited by the
  current user's visibility the way `information_schema` is.

## Before sharing the output

The output is not a secret store and contains no keys, but it does reveal the
schema and policy design. Skim section 2 policy expressions, section 3d role
settings and section 6a bucket names for anything environment-specific
(internal names, customer or project identifiers) before sending it.

## After you run it

Send the maintainer the results of sections 1a, 1b, 1c, 1d, 2, 3a, 3b, 4, 5, 6a, 6b,
6c and 7. Do not apply any fix from this file; remediation is a separate,
reviewed change.
