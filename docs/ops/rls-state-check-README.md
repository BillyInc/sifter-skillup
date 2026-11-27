# RLS and grant state check (read-only)

`rls-state-check-2026-11-27.sql` reports the live row-level-security (RLS) and
privilege state of the `skillup_dev` schema. It exists because the database
audit (finding C1) could not tell from the repository files whether the live
project matches `supabase-schema.sql`.

The file contains only `SELECT` statements against `pg_catalog`,
`information_schema`, `pg_policies` and the storage metadata tables. It
changes nothing and contains no secrets.

## How to run

1. Open the Supabase Dashboard, SQL Editor, for the project.
2. The editor shows only the result of the last statement it runs. Either run
   one numbered section at a time (select the section, press Run), or start
   with section 7, the one-screen summary.
3. Copy or export each result (CSV is fine) and share it with the maintainer.
   Do not paste keys or connection strings; none are needed.

## What each section tells you

| Section | Question it answers | How to read it |
| --- | --- | --- |
| 0 | Who ran it, which server | Sanity check only. |
| 1a | Per table: is RLS on, and what can `anon`, `authenticated`, `service_role` do | `rls_enabled = false` with any `anon_*` or `auth_*` true means the table is open through the API with the public key. `policy_count = 0` with RLS on means deny-all for those roles. Privileges are effective (include grants via PUBLIC). |
| 1b | Same, for the tables named in the audit | Quick view of `users`, `game_states`, `level_scores`, `posts`, `post_likes`, `notifications`, `guild_messages`, `career_context_items` and others. `anon_privs` letters: S select, I insert, U update, D delete. |
| 1c | Explicit ACL grants | Compare with 1a. A grant here but not in 1a is impossible; a privilege in 1a with no row here came from PUBLIC or role membership. |
| 2 | Every policy on `skillup_dev` | Check `roles`, `cmd`, `using_expr`, `with_check_expr`. `auth.uid() = id` style policies only match requests that carry a Supabase JWT. |
| 3a | Schema `USAGE` and `CREATE` | `anon_usage = false` on `skillup_dev` blocks the API for that role regardless of table grants. `*_create = true` is never wanted. |
| 3b | Default privileges (`pg_default_acl`) | Rows granting to `anon`/`authenticated`/`PUBLIC` mean every future table, sequence or function created by that role is granted automatically. No such rows means new objects start closed. |
| 3c | Sequence privileges | `UPDATE` for API roles on a sequence lets them advance it. |
| 3d | Hint for exposed schemas | Best effort. Confirm in Dashboard, Project Settings, API, Exposed schemas. If `skillup_dev` is not exposed, the REST API cannot reach it at all (but the backend's service client still can). |
| 4 | Functions: `security_definer`, `has_search_path`, who may execute | A definer function with `public_execute` or `anon_execute` true runs with owner rights for anyone who calls it. `has_search_path = false` on a definer function is a hijack risk. |
| 5 | Views and `security_invoker` | `(not set: owner rights)` means the view bypasses RLS on its base tables; if `anon_select` or `authenticated_select` is true, the view can expose rows RLS would hide (for example `user_progress`). |
| 6a | Storage buckets | `public = true` means objects are readable by URL without auth. Check `file_size_limit` and `allowed_mime_types` are set where uploads are accepted. |
| 6b | `storage.objects` RLS and policies | A bucket is only as private as these policies. No policies with RLS on means only the service role can touch objects. |
| 7 | Red-flag summary | See below. |

## Section 7 flags

| check_id | Meaning |
| --- | --- |
| G1 | `anon` or `authenticated` can SELECT, INSERT, UPDATE or DELETE a table with RLS disabled. Always a finding. |
| G2 | A policy with `USING true` or `WITH CHECK true`. HIGH on the audit's sensitive tables; REVIEW elsewhere (acceptable only for true reference data). |
| G3 | A SECURITY DEFINER function executable by PUBLIC or `anon`. |
| G4 | Informational. RLS on, API roles hold grants, but no policy exists. This is the silent no-op signature. |

An empty result means nothing was flagged.

## Interpreting the C1 question

The backend uses the anon key with its own JWT, so `auth.uid()` is NULL on
those calls. Look at `users`, `game_states`, `level_scores`, `posts` and
`post_likes` in sections 1a/1b and 2:

| What you see | Conclusion |
| --- | --- |
| `rls_enabled = true`, API roles hold INSERT/UPDATE/DELETE, only `auth.uid() = ...` policies, no `true` policy (G4 or G2 not flagged for these tables) | C1 case (a), the **silent no-op**: backend writes to these tables update 0 rows without raising. Data is not publicly exposed, but profile saves, game state and points are not persisted. |
| `rls_enabled = true`, `policy_count = 0`, grants present | Same silent no-op, even more complete (reads return nothing too). Flagged G4. |
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
- Section 3b showing grants to `anon` or `authenticated`: later-created
  objects will be exposed unless revoked per object (audit M1).

## After you run it

Send the maintainer the results of sections 1a, 1b, 2, 3a, 3b, 4, 5, 6a, 6b
and 7. Do not apply any fix from this file; remediation is a separate,
reviewed change.
