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
--           each section.
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
  has_table_privilege('anon', c.oid, 'SELECT')              AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT')              AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE')              AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE')              AS anon_delete,
  has_any_column_privilege('anon', c.oid, 'SELECT')         AS anon_any_col_select,
  has_table_privilege('authenticated', c.oid, 'SELECT')     AS auth_select,
  has_table_privilege('authenticated', c.oid, 'INSERT')     AS auth_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE')     AS auth_update,
  has_table_privilege('authenticated', c.oid, 'DELETE')     AS auth_delete,
  has_any_column_privilege('authenticated', c.oid, 'SELECT') AS auth_any_col_select,
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
--     shows NULLs. Compact: one row per named table.
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
      CASE WHEN has_table_privilege('anon', c.oid, 'SELECT') THEN 'S' END,
      CASE WHEN has_table_privilege('anon', c.oid, 'INSERT') THEN 'I' END,
      CASE WHEN has_table_privilege('anon', c.oid, 'UPDATE') THEN 'U' END,
      CASE WHEN has_table_privilege('anon', c.oid, 'DELETE') THEN 'D' END) END AS anon_privs,
  CASE WHEN c.oid IS NULL THEN NULL ELSE
    concat_ws(',',
      CASE WHEN has_table_privilege('authenticated', c.oid, 'SELECT') THEN 'S' END,
      CASE WHEN has_table_privilege('authenticated', c.oid, 'INSERT') THEN 'I' END,
      CASE WHEN has_table_privilege('authenticated', c.oid, 'UPDATE') THEN 'U' END,
      CASE WHEN has_table_privilege('authenticated', c.oid, 'DELETE') THEN 'D' END) END AS authenticated_privs
FROM (VALUES
  ('users'), ('game_states'), ('level_scores'), ('posts'), ('post_likes'),
  ('notifications'), ('guild_messages'), ('career_context_items'),
  ('portfolio_accounts'), ('claim_codes'), ('comments'), ('feedback'),
  ('transactions'), ('withdrawals')
) AS t(name)
LEFT JOIN pg_class c
       ON c.relname = t.name
      AND c.relnamespace = 'skillup_dev'::regnamespace
      AND c.relkind IN ('r', 'p')
ORDER BY t.name;


-- ---------------------------------------------------------------------
-- 1c. Raw table grants as recorded in the ACL (explicit GRANTs only, as
--     information_schema reports them). Compare with 1a, which is the
--     effective result.
-- ---------------------------------------------------------------------
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'skillup_dev'
  AND grantee IN ('anon', 'authenticated', 'service_role', 'PUBLIC')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;


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
       has_schema_privilege('anon',          s.schema_name, 'USAGE')  AS anon_usage,
       has_schema_privilege('authenticated', s.schema_name, 'USAGE')  AS authenticated_usage,
       has_schema_privilege('service_role',  s.schema_name, 'USAGE')  AS service_role_usage,
       has_schema_privilege('anon',          s.schema_name, 'CREATE') AS anon_create,
       has_schema_privilege('authenticated', s.schema_name, 'CREATE') AS authenticated_create,
       (SELECT nspacl::text FROM pg_namespace WHERE nspname = s.schema_name) AS schema_acl
FROM (VALUES ('skillup_dev'), ('public'), ('storage')) AS s(schema_name);


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
WHERE c.relnamespace = 'skillup_dev'::regnamespace
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
WHERE p.pronamespace = 'skillup_dev'::regnamespace
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
  has_table_privilege('anon',          c.oid, 'SELECT') AS anon_select,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_table_privilege('service_role',  c.oid, 'SELECT') AS service_role_select
FROM pg_class c
WHERE c.relnamespace = 'skillup_dev'::regnamespace
  AND c.relkind IN ('v', 'm')
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 6a. Storage buckets: public flag, size and MIME limits
-- ---------------------------------------------------------------------
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
FROM storage.buckets
ORDER BY name;


-- ---------------------------------------------------------------------
-- 6b. storage.objects: RLS flags and policies
-- ---------------------------------------------------------------------
SELECT c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced_for_owner
FROM pg_class c
WHERE c.relnamespace = 'storage'::regnamespace AND c.relname IN ('objects', 'buckets');

SELECT schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, cmd, policyname;


-- ---------------------------------------------------------------------
-- 7. SUMMARY of red flags (one screen). Empty result = nothing flagged.
--    check_id:
--      G1  anon/authenticated can SELECT/INSERT/UPDATE/DELETE a table
--          that has RLS DISABLED  (publicly readable/writable).
--      G2  policy whose USING or WITH CHECK is literally true.
--          severity HIGH when the table is on the audit's sensitive list,
--          otherwise REVIEW (acceptable only for genuine reference data).
--      G3  SECURITY DEFINER function executable by PUBLIC or anon.
--      G4  (info) RLS on, API roles hold grants, but the table has NO
--          policy: reads return no rows and writes affect 0 rows without
--          raising. This is the "silent no-op" signature (audit C1a).
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
         (has_table_privilege('anon', c.oid, 'SELECT')
          OR has_table_privilege('anon', c.oid, 'INSERT')
          OR has_table_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE'))          AS anon_any,
         (has_table_privilege('authenticated', c.oid, 'SELECT')
          OR has_table_privilege('authenticated', c.oid, 'INSERT')
          OR has_table_privilege('authenticated', c.oid, 'UPDATE')
          OR has_table_privilege('authenticated', c.oid, 'DELETE')) AS auth_any
  FROM pg_class c
  WHERE c.relnamespace = 'skillup_dev'::regnamespace
    AND c.relkind IN ('r', 'p')
)
SELECT 'G1'::text AS check_id, 'HIGH'::text AS severity, t.relname::text AS object,
       concat('RLS disabled; anon=', t.anon_any, ' authenticated=', t.auth_any) AS detail
FROM tbl t
WHERE NOT t.relrowsecurity AND (t.anon_any OR t.auth_any)

UNION ALL
SELECT 'G2',
       CASE WHEN s.name IS NOT NULL THEN 'HIGH' ELSE 'REVIEW' END,
       p.tablename::text,
       concat('policy ', p.policyname, ' (', p.cmd, ', roles ', p.roles::text, '): USING ',
              coalesce(p.qual, '-'), ' / WITH CHECK ', coalesce(p.with_check, '-'))
FROM pg_policies p
LEFT JOIN sensitive s ON s.name = p.tablename
WHERE p.schemaname = 'skillup_dev'
  AND ( regexp_replace(coalesce(p.qual, ''),       '[()\s]', '', 'g') = 'true'
     OR regexp_replace(coalesce(p.with_check, ''), '[()\s]', '', 'g') = 'true')

UNION ALL
SELECT 'G3', 'HIGH',
       concat(p.proname, '(', pg_get_function_identity_arguments(p.oid), ')'),
       concat('SECURITY DEFINER; public_execute=',
              EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                       WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'),
              ' anon_execute=', has_function_privilege('anon', p.oid, 'EXECUTE'),
              '; search_path set=', (p.proconfig IS NOT NULL AND p.proconfig::text ILIKE '%search_path%'))
FROM pg_proc p
WHERE p.pronamespace = 'skillup_dev'::regnamespace
  AND p.prokind IN ('f', 'p')
  AND p.prosecdef
  AND ( has_function_privilege('anon', p.oid, 'EXECUTE')
     OR EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                 WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'))

UNION ALL
SELECT 'G4', 'INFO', t.relname::text,
       concat('RLS on, no policy at all; anon=', t.anon_any, ' authenticated=', t.auth_any,
              ' (reads empty, writes affect 0 rows silently)')
FROM tbl t
WHERE t.relrowsecurity
  AND (t.anon_any OR t.auth_any)
  AND NOT EXISTS (SELECT 1 FROM pg_policies p
                   WHERE p.schemaname = 'skillup_dev' AND p.tablename = t.relname)

ORDER BY check_id, severity, object;
