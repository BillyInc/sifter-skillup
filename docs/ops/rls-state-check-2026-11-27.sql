-- =====================================================================
-- READ-ONLY. Run in the Supabase SQL editor. Share the output with the
-- maintainer.
--
-- Purpose : establish the LIVE row-level-security and grant state of the
--           skillup_dev schema (audit finding C1), which cannot be known
--           from the repository files alone.
-- Contents: SELECT statements against pg_catalog / information_schema /
--           pg_policies / storage metadata only. No DDL, no DML, no
--           function with side effects. Nothing here contains a secret.
-- How     : the SQL editor shows only the LAST statement's result, so run
--           each numbered section on its own (select the section, Run), or
--           run section 7 first for the one-screen summary. See
--           docs/ops/rls-state-check-README.md.
-- Schema  : edit nothing; the schema name 'skillup_dev' is spelled out in
--           each section. Sections look the schema up by name in
--           pg_namespace, so a missing schema yields empty results rather
--           than an error. Exceptions: 6a reads storage.buckets, and the
--           roles anon / authenticated / service_role must exist (they do
--           on every Supabase project); otherwise those sections error.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Context (who is running this, which server)
-- ---------------------------------------------------------------------
SELECT current_user AS run_as, current_database() AS db, version() AS server_version;


-- ---------------------------------------------------------------------
-- 1a. Per-table RLS flags and EFFECTIVE privileges for anon,
--     authenticated, service_role (includes grants inherited via PUBLIC
--     and role membership). One row per table in skillup_dev.
-- ---------------------------------------------------------------------
SELECT
  c.relname                                         AS table_name,
  c.relrowsecurity                                  AS rls_enabled,
  c.relforcerowsecurity                             AS rls_forced_for_owner,
  pg_get_userbyid(c.relowner)                       AS owner,
  (SELECT count(*) FROM pg_policies p
     WHERE p.schemaname = 'skillup_dev' AND p.tablename = c.relname) AS policy_count,
  -- *_select/_insert/_update/_delete = TABLE-level privilege.
  -- *_any_col_* = table-level OR column-level (a column-only grant makes
  -- this true while the table-level flag stays false). DELETE has no
  -- column-level form.
  has_table_privilege('anon', c.oid, 'SELECT')              AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT')              AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE')              AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE')              AS anon_delete,
  has_any_column_privilege('anon', c.oid, 'SELECT')         AS anon_any_col_select,
  has_any_column_privilege('anon', c.oid, 'INSERT')         AS anon_any_col_insert,
  has_any_column_privilege('anon', c.oid, 'UPDATE')         AS anon_any_col_update,
  has_table_privilege('authenticated', c.oid, 'SELECT')     AS auth_select,
  has_table_privilege('authenticated', c.oid, 'INSERT')     AS auth_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE')     AS auth_update,
  has_table_privilege('authenticated', c.oid, 'DELETE')     AS auth_delete,
  has_any_column_privilege('authenticated', c.oid, 'SELECT') AS auth_any_col_select,
  has_any_column_privilege('authenticated', c.oid, 'INSERT') AS auth_any_col_insert,
  has_any_column_privilege('authenticated', c.oid, 'UPDATE') AS auth_any_col_update,
  has_table_privilege('service_role', c.oid, 'SELECT')      AS service_select,
  has_table_privilege('service_role', c.oid, 'INSERT')      AS service_insert,
  has_table_privilege('service_role', c.oid, 'UPDATE')      AS service_update,
  has_table_privilege('service_role', c.oid, 'DELETE')      AS service_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'skillup_dev'
  AND c.relkind IN ('r', 'p')            -- ordinary and partitioned tables
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 1b. Focus list from the audit (C1/M3). A table that does not exist
--     shows NULLs. Compact: one row per named table. Letters use
--     has_any_column_privilege for S/I/U, so a column-only grant shows
--     too (see 1d for which columns).
-- ---------------------------------------------------------------------
SELECT
  t.name                                            AS table_name,
  c.oid IS NOT NULL                                 AS exists_in_skillup_dev,
  c.relrowsecurity                                  AS rls_enabled,
  c.relforcerowsecurity                             AS rls_forced_for_owner,
  (SELECT count(*) FROM pg_policies p
     WHERE p.schemaname = 'skillup_dev' AND p.tablename = t.name) AS policy_count,
  CASE WHEN c.oid IS NULL THEN NULL ELSE
    concat_ws(',',
      CASE WHEN has_any_column_privilege('anon', c.oid, 'SELECT') THEN 'S' END,
      CASE WHEN has_any_column_privilege('anon', c.oid, 'INSERT') THEN 'I' END,
      CASE WHEN has_any_column_privilege('anon', c.oid, 'UPDATE') THEN 'U' END,
      CASE WHEN has_table_privilege('anon', c.oid, 'DELETE') THEN 'D' END) END AS anon_privs,
  CASE WHEN c.oid IS NULL THEN NULL ELSE
    concat_ws(',',
      CASE WHEN has_any_column_privilege('authenticated', c.oid, 'SELECT') THEN 'S' END,
      CASE WHEN has_any_column_privilege('authenticated', c.oid, 'INSERT') THEN 'I' END,
      CASE WHEN has_any_column_privilege('authenticated', c.oid, 'UPDATE') THEN 'U' END,
      CASE WHEN has_table_privilege('authenticated', c.oid, 'DELETE') THEN 'D' END) END AS authenticated_privs
FROM (VALUES
  ('users'), ('game_states'), ('level_scores'), ('posts'), ('post_likes'),
  ('notifications'), ('guild_messages'), ('career_context_items'),
  ('portfolio_accounts'), ('claim_codes'), ('comments'), ('feedback'),
  ('transactions'), ('withdrawals')
) AS t(name)
LEFT JOIN pg_class c
       ON c.relname = t.name
      AND c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
      AND c.relkind IN ('r', 'p')
ORDER BY t.name;


-- ---------------------------------------------------------------------
-- 1c. Table-level ACL, read straight from pg_class.relacl (the complete
--     ACL, not the information_schema view, which hides grants where the
--     current user is not grantor/grantee/member, e.g. grants made by
--     supabase_admin). A NULL relacl is shown as the owner-default ACL.
--     grantee PUBLIC = granted to everyone. Compare with 1a, which is the
--     effective result.
-- ---------------------------------------------------------------------
SELECT c.relname AS object_name,
       CASE c.relkind WHEN 'r' THEN 'table' WHEN 'p' THEN 'partitioned table'
            WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view'
            WHEN 'f' THEN 'foreign table' END AS kind,
       CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       pg_get_userbyid(a.grantor) AS grantor,
       string_agg(a.privilege_type, ', ' ORDER BY a.privilege_type) AS privileges
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
WHERE n.nspname = 'skillup_dev'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND (a.grantee = 0
       OR a.grantee IN (SELECT oid FROM pg_roles
                         WHERE rolname IN ('anon', 'authenticated', 'service_role')))
GROUP BY c.relname, c.relkind, a.grantee, a.grantor
ORDER BY c.relname, grantee, grantor;


-- ---------------------------------------------------------------------
-- 1d. Column-level grants (pg_attribute.attacl) to the API roles or
--     PUBLIC. Empty = no column-only grants. A privilege here lets that
--     role read/write just those columns even when 1c shows no table-level
--     privilege.
-- ---------------------------------------------------------------------
SELECT c.relname AS object_name, at.attname AS column_name,
       CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       string_agg(a.privilege_type, ', ' ORDER BY a.privilege_type) AS privileges
FROM pg_attribute at
JOIN pg_class c ON c.oid = at.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL aclexplode(at.attacl) a
WHERE n.nspname = 'skillup_dev'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND at.attnum > 0 AND NOT at.attisdropped
  AND at.attacl IS NOT NULL
  AND (a.grantee = 0
       OR a.grantee IN (SELECT oid FROM pg_roles
                         WHERE rolname IN ('anon', 'authenticated', 'service_role')))
GROUP BY c.relname, at.attname, a.grantee
ORDER BY c.relname, at.attname, grantee;


-- ---------------------------------------------------------------------
-- 2. Policies on skillup_dev (every policy, verbatim)
-- ---------------------------------------------------------------------
SELECT schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname = 'skillup_dev'
ORDER BY tablename, cmd, policyname;


-- ---------------------------------------------------------------------
-- 3a. Schema USAGE / CREATE for the API roles
-- ---------------------------------------------------------------------
SELECT s.schema_name,
       n.oid IS NOT NULL                                              AS schema_exists,
       CASE WHEN n.oid IS NOT NULL THEN has_schema_privilege('anon',          n.oid, 'USAGE')  END AS anon_usage,
       CASE WHEN n.oid IS NOT NULL THEN has_schema_privilege('authenticated', n.oid, 'USAGE')  END AS authenticated_usage,
       CASE WHEN n.oid IS NOT NULL THEN has_schema_privilege('service_role',  n.oid, 'USAGE')  END AS service_role_usage,
       CASE WHEN n.oid IS NOT NULL THEN has_schema_privilege('anon',          n.oid, 'CREATE') END AS anon_create,
       CASE WHEN n.oid IS NOT NULL THEN has_schema_privilege('authenticated', n.oid, 'CREATE') END AS authenticated_create,
       n.nspacl::text                                                 AS schema_acl
FROM (VALUES ('skillup_dev'), ('public'), ('storage')) AS s(schema_name)
LEFT JOIN pg_namespace n ON n.nspname = s.schema_name;


-- ---------------------------------------------------------------------
-- 3b. Default privileges (pg_default_acl): what NEW tables / sequences /
--     functions created by each role automatically grant. One row per
--     (creating role, schema, object type, grantee).
-- ---------------------------------------------------------------------
SELECT pg_get_userbyid(d.defaclrole)                     AS objects_created_by,
       coalesce(n.nspname, '(all schemas)')              AS in_schema,
       CASE d.defaclobjtype
         WHEN 'r' THEN 'tables'  WHEN 'S' THEN 'sequences'
         WHEN 'f' THEN 'functions' WHEN 'T' THEN 'types'
         WHEN 'n' THEN 'schemas' ELSE d.defaclobjtype::text END AS object_type,
       CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       string_agg(a.privilege_type, ', ' ORDER BY a.privilege_type) AS privileges
FROM pg_default_acl d
LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL aclexplode(d.defaclacl) a
GROUP BY 1, 2, 3, 4
ORDER BY 1, 2, 3, 4;


-- ---------------------------------------------------------------------
-- 3c. Sequence privileges for the API roles in skillup_dev
-- ---------------------------------------------------------------------
SELECT c.relname AS sequence_name,
       has_sequence_privilege('anon',          c.oid, 'USAGE')  AS anon_usage,
       has_sequence_privilege('anon',          c.oid, 'UPDATE') AS anon_update,
       has_sequence_privilege('authenticated', c.oid, 'USAGE')  AS authenticated_usage,
       has_sequence_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update
FROM pg_class c
WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
  AND c.relkind = 'S'
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 3d. Best-effort hint: which schemas the REST API exposes. Supabase
--     usually stores this as a setting on the 'authenticator' role. An
--     empty result does not mean "not exposed": confirm in Dashboard ->
--     Project Settings -> API -> Exposed schemas.
-- ---------------------------------------------------------------------
SELECT r.rolname, s.setconfig::text AS role_settings
FROM pg_db_role_setting s
JOIN pg_roles r ON r.oid = s.setrole
WHERE s.setconfig::text ILIKE '%pgrst%';


-- ---------------------------------------------------------------------
-- 4. Functions in skillup_dev: SECURITY DEFINER flag, search_path
--    setting, and who may EXECUTE. public_execute is derived from the
--    ACL (grantee 0 = PUBLIC); a NULL proacl means the owner-default ACL,
--    which grants EXECUTE to PUBLIC.
-- ---------------------------------------------------------------------
SELECT
  p.proname                                              AS function_name,
  pg_get_function_identity_arguments(p.oid)              AS arguments,
  CASE p.prokind WHEN 'f' THEN 'function' WHEN 'p' THEN 'procedure' ELSE p.prokind::text END AS kind,
  p.prosecdef                                            AS security_definer,
  p.proconfig::text                                      AS proconfig,   -- look for search_path=...
  (p.proconfig IS NOT NULL AND p.proconfig::text ILIKE '%search_path%') AS has_search_path,
  pg_get_userbyid(p.proowner)                            AS owner,
  EXISTS (SELECT 1
            FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
           WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE') AS public_execute,
  has_function_privilege('anon',          p.oid, 'EXECUTE')  AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE')  AS authenticated_execute,
  has_function_privilege('service_role',  p.oid, 'EXECUTE')  AS service_role_execute,
  p.proacl::text                                         AS raw_acl
FROM pg_proc p
WHERE p.pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
  AND p.prokind IN ('f', 'p')
ORDER BY p.prosecdef DESC, p.proname, arguments;


-- ---------------------------------------------------------------------
-- 5. Views and materialized views in skillup_dev, with security_invoker.
--    A view WITHOUT security_invoker=true runs with its OWNER's rights and
--    therefore bypasses RLS on the tables it reads. Materialized views
--    never apply RLS and have no security_invoker.
-- ---------------------------------------------------------------------
SELECT
  c.relname                                          AS view_name,
  CASE c.relkind WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' END AS kind,
  pg_get_userbyid(c.relowner)                        AS owner,
  coalesce((SELECT split_part(o, '=', 2) FROM unnest(c.reloptions) o
             WHERE o LIKE 'security_invoker=%' LIMIT 1),
           '(not set: owner rights)')                AS security_invoker,
  coalesce((SELECT split_part(o, '=', 2) FROM unnest(c.reloptions) o
             WHERE o LIKE 'security_barrier=%' LIMIT 1),
           '(not set)')                              AS security_barrier,
  has_any_column_privilege('anon',          c.oid, 'SELECT') AS anon_select,
  has_any_column_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_any_column_privilege('service_role',  c.oid, 'SELECT') AS service_role_select
FROM pg_class c
WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
  AND c.relkind IN ('v', 'm')
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 6a. Storage buckets: public flag, size and MIME limits
-- ---------------------------------------------------------------------
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
FROM storage.buckets
ORDER BY name;


-- ---------------------------------------------------------------------
-- 6b. storage.objects / storage.buckets: RLS flags (run on its own)
-- ---------------------------------------------------------------------
SELECT c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced_for_owner
FROM pg_class c
WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
  AND c.relname IN ('objects', 'buckets')
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 6c. storage schema policies (run on its own)
-- ---------------------------------------------------------------------
SELECT schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, cmd, policyname;


-- ---------------------------------------------------------------------
-- 7. SUMMARY of red flags (one screen). Empty result = nothing flagged.
--    These flags are heuristics over catalog data; they point at things to
--    read, they are not proof. Sections 1a, 2 and 4 are the evidence.
--    check_id:
--      G1  anon/authenticated holds SELECT/INSERT/UPDATE/DELETE (table or
--          column level) on a table that has RLS DISABLED.
--      G2  PERMISSIVE policy that applies to public/anon/authenticated and
--          whose USING or WITH CHECK is always-true: literally true, 1=1,
--          auth.role()='anon'/'authenticated', or auth.uid() IS NOT NULL.
--          HIGH = sensitive table and one of those roles actually holds the
--          matching privilege; REVIEW = same on a non-sensitive table
--          (fine only for genuine reference data); INFO = open policy but
--          the roles hold no matching privilege. Policies limited to
--          service_role are NOT flagged. Anything cleverer than the
--          patterns above is caught only by reading section 2.
--      G3  SECURITY DEFINER function executable by PUBLIC/anon (HIGH) or by
--          authenticated only (MEDIUM). Detail shows whether search_path
--          is pinned.
--      G4  (info) RLS on, API roles hold grants, but the table has NO
--          policy: SELECT returns no rows, UPDATE/DELETE silently affect 0
--          rows, INSERT/upsert raises 42501 (audit C1a).
--      G5  (info) RLS on, policies exist, an API role holds a write grant,
--          but no permissive write policy for that role works without
--          auth.uid()/auth.jwt(). A caller with no Supabase JWT (e.g. the
--          anon key plus the app's own JWT) gets 42501 on INSERT and
--          silent 0-row UPDATE/DELETE. Heuristic: a policy that calls a
--          helper function wrapping auth.uid() looks independent here.
--      G6  View (HIGH) or materialized view (MEDIUM) that runs with owner
--          rights (no security_invoker=true) and that anon/authenticated
--          can SELECT: it can expose rows RLS on the base tables hides.
-- ---------------------------------------------------------------------
WITH sensitive(name) AS (
  VALUES ('users'), ('game_states'), ('level_scores'), ('posts'), ('post_likes'),
         ('comments'), ('notifications'), ('guild_messages'), ('guilds'),
         ('guild_members'), ('career_context_items'), ('portfolio_accounts'),
         ('claim_codes'), ('transactions'), ('withdrawals'), ('feedback'),
         ('dm_threads'), ('dm_messages')
),
tbl AS (
  SELECT c.oid, c.relname, c.relrowsecurity,
         (has_any_column_privilege('anon', c.oid, 'SELECT')
          OR has_any_column_privilege('anon', c.oid, 'INSERT')
          OR has_any_column_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE'))          AS anon_any,
         (has_any_column_privilege('authenticated', c.oid, 'SELECT')
          OR has_any_column_privilege('authenticated', c.oid, 'INSERT')
          OR has_any_column_privilege('authenticated', c.oid, 'UPDATE')
          OR has_table_privilege('authenticated', c.oid, 'DELETE')) AS auth_any,
         (has_any_column_privilege('anon', c.oid, 'INSERT')
          OR has_any_column_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE'))          AS anon_write,
         (has_any_column_privilege('authenticated', c.oid, 'INSERT')
          OR has_any_column_privilege('authenticated', c.oid, 'UPDATE')
          OR has_table_privilege('authenticated', c.oid, 'DELETE')) AS auth_write
  FROM pg_class c
  WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
    AND c.relkind IN ('r', 'p')
),
pol AS (   -- permissive policies with a normalised expression
  SELECT t.oid AS tbl_oid, p.tablename, p.policyname, p.cmd, p.roles,
         p.qual, p.with_check,
         (p.roles && ARRAY['public', 'anon']::name[])           AS hits_anon,
         (p.roles && ARRAY['public', 'authenticated']::name[])  AS hits_auth,
         lower(regexp_replace(coalesce(p.qual, ''),       '[()\s]|::[a-z ]+', '', 'g')) AS nq,
         lower(regexp_replace(coalesce(p.with_check, ''), '[()\s]|::[a-z ]+', '', 'g')) AS nw,
         ((coalesce(p.qual, '') || ' ' || coalesce(p.with_check, '')) ~* 'auth\.(uid|jwt)\s*\(') AS uses_auth_fn
  FROM pg_policies p
  JOIN tbl t ON t.relname = p.tablename
  WHERE p.schemaname = 'skillup_dev'
    AND p.permissive = 'PERMISSIVE'
),
openpol AS (  -- always-true-looking policies applying to an API role
  SELECT o.*,
         CASE o.cmd
           WHEN 'SELECT' THEN has_any_column_privilege('anon', o.tbl_oid, 'SELECT')
           WHEN 'INSERT' THEN has_any_column_privilege('anon', o.tbl_oid, 'INSERT')
           WHEN 'UPDATE' THEN has_any_column_privilege('anon', o.tbl_oid, 'UPDATE')
           WHEN 'DELETE' THEN has_table_privilege('anon', o.tbl_oid, 'DELETE')
           ELSE (has_any_column_privilege('anon', o.tbl_oid, 'SELECT')
              OR has_any_column_privilege('anon', o.tbl_oid, 'INSERT')
              OR has_any_column_privilege('anon', o.tbl_oid, 'UPDATE')
              OR has_table_privilege('anon', o.tbl_oid, 'DELETE')) END AS anon_holds,
         CASE o.cmd
           WHEN 'SELECT' THEN has_any_column_privilege('authenticated', o.tbl_oid, 'SELECT')
           WHEN 'INSERT' THEN has_any_column_privilege('authenticated', o.tbl_oid, 'INSERT')
           WHEN 'UPDATE' THEN has_any_column_privilege('authenticated', o.tbl_oid, 'UPDATE')
           WHEN 'DELETE' THEN has_table_privilege('authenticated', o.tbl_oid, 'DELETE')
           ELSE (has_any_column_privilege('authenticated', o.tbl_oid, 'SELECT')
              OR has_any_column_privilege('authenticated', o.tbl_oid, 'INSERT')
              OR has_any_column_privilege('authenticated', o.tbl_oid, 'UPDATE')
              OR has_table_privilege('authenticated', o.tbl_oid, 'DELETE')) END AS auth_holds
  FROM pol o
  WHERE (o.hits_anon OR o.hits_auth)
    AND ( o.nq IN ('true', '1=1', 'true=true', 'auth.role=''anon''', 'auth.role=''authenticated''', 'auth.uidisnotnull')
       OR o.nw IN ('true', '1=1', 'true=true', 'auth.role=''anon''', 'auth.role=''authenticated''', 'auth.uidisnotnull') )
),
flags AS (
  SELECT 'G1'::text AS check_id, 'HIGH'::text AS severity, t.relname::text AS object,
         concat('RLS disabled; anon=', t.anon_any, ' authenticated=', t.auth_any) AS detail
  FROM tbl t
  WHERE NOT t.relrowsecurity AND (t.anon_any OR t.auth_any)

  UNION ALL
  SELECT 'G2',
         CASE WHEN NOT (o.hits_anon AND o.anon_holds OR o.hits_auth AND o.auth_holds) THEN 'INFO'
              WHEN s.name IS NOT NULL THEN 'HIGH' ELSE 'REVIEW' END,
         o.tablename::text,
         concat('policy ', o.policyname, ' (', o.cmd, ', roles ', o.roles::text, '): USING ',
                coalesce(o.qual, '-'), ' / WITH CHECK ', coalesce(o.with_check, '-'),
                '; anon holds matching privilege=', (o.hits_anon AND o.anon_holds),
                ' authenticated holds matching privilege=', (o.hits_auth AND o.auth_holds))
  FROM openpol o
  LEFT JOIN sensitive s ON s.name = o.tablename

  UNION ALL
  SELECT 'G3',
         CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'HIGH' ELSE 'MEDIUM' END,
         concat(p.proname, '(', pg_get_function_identity_arguments(p.oid), ')'),
         concat('SECURITY DEFINER; public_execute=',
                EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'),
                ' anon_execute=', has_function_privilege('anon', p.oid, 'EXECUTE'),
                ' authenticated_execute=', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
                '; search_path set=', (p.proconfig IS NOT NULL AND p.proconfig::text ILIKE '%search_path%'))
  FROM pg_proc p
  WHERE p.pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
    AND p.prokind IN ('f', 'p')
    AND p.prosecdef
    AND ( has_function_privilege('anon', p.oid, 'EXECUTE')
       OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
       OR EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                   WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'))

  UNION ALL
  SELECT 'G4', 'INFO', t.relname::text,
         concat('RLS on, no policy at all; anon=', t.anon_any, ' authenticated=', t.auth_any,
                ' (SELECT returns no rows; UPDATE/DELETE silently affect 0 rows; INSERT/upsert raises 42501)')
  FROM tbl t
  WHERE t.relrowsecurity
    AND (t.anon_any OR t.auth_any)
    AND NOT EXISTS (SELECT 1 FROM pg_policies p
                     WHERE p.schemaname = 'skillup_dev' AND p.tablename = t.relname)

  UNION ALL
  SELECT 'G5', 'INFO', t.relname::text || ' [' || r.role_name || ']',
         concat('RLS on; ', r.role_name, ' holds a write grant; no permissive INSERT/UPDATE/DELETE/ALL policy for it ',
                'works without auth.uid()/auth.jwt() (no-JWT callers: INSERT raises 42501, UPDATE/DELETE affect 0 rows)')
  FROM tbl t
  CROSS JOIN LATERAL (VALUES ('anon', t.anon_write), ('authenticated', t.auth_write)) AS r(role_name, has_write)
  WHERE t.relrowsecurity
    AND r.has_write
    AND EXISTS (SELECT 1 FROM pg_policies p
                 WHERE p.schemaname = 'skillup_dev' AND p.tablename = t.relname)   -- no-policy tables are G4
    AND NOT EXISTS (SELECT 1 FROM pol o
                     WHERE o.tbl_oid = t.oid
                       AND o.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
                       AND ((r.role_name = 'anon' AND o.hits_anon)
                         OR (r.role_name = 'authenticated' AND o.hits_auth))
                       AND NOT o.uses_auth_fn)

  UNION ALL
  SELECT 'G6',
         CASE c.relkind WHEN 'v' THEN 'HIGH' ELSE 'MEDIUM' END,
         c.relname::text,
         concat(CASE c.relkind WHEN 'v' THEN 'view' ELSE 'materialized view' END,
                ' without security_invoker=true (owner ', pg_get_userbyid(c.relowner),
                '); anon select=', has_any_column_privilege('anon', c.oid, 'SELECT'),
                ' authenticated select=', has_any_column_privilege('authenticated', c.oid, 'SELECT'),
                CASE c.relkind WHEN 'm' THEN '; materialized views never apply RLS' ELSE '' END)
  FROM pg_class c
  WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'skillup_dev')
    AND c.relkind IN ('v', 'm')
    AND NOT coalesce((SELECT bool_or(o ~* '^security_invoker=(true|on|1|yes)$')
                        FROM unnest(c.reloptions) o), false)
    AND ( has_any_column_privilege('anon', c.oid, 'SELECT')
       OR has_any_column_privilege('authenticated', c.oid, 'SELECT'))
)
SELECT check_id, severity, object, detail
FROM flags
ORDER BY check_id,
         CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'REVIEW' THEN 3 ELSE 4 END,
         object;
