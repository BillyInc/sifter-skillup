-- =====================================================================
-- READ-ONLY. Run in the Supabase SQL editor. Share the output with the
-- maintainer only after skimming it (see "Before sharing" in
-- docs/ops/rls-state-check-README.md).
--
-- Purpose : establish the LIVE row-level-security and grant state of the
--           skillup_dev schema (audit finding C1), which cannot be known
--           from the repository files alone. Sections 6c-6e and 7 also
--           cover public, other API-exposed schemas, storage, realtime
--           and extensions.
-- Contents: SELECT statements and read-only CTEs against pg_catalog /
--           pg_policies / storage metadata only. No DDL, no DML. The only
--           functions used are catalog and privilege-inspection functions
--           (has_*_privilege, pg_has_role, pg_get_*, aclexplode, acldefault,
--           row_security_active, to_regclass) plus query_to_xml() (read back with xmltable)
--           over ONE fixed, constant SELECT on storage.buckets (section 7, G7).
--           Nothing here writes.
-- Secrets : the script is DESIGNED not to print secrets: it never prints
--           role settings other than the PostgREST exposed-schema names
--           (3d filters to pgrst.db_schemas / pgrst.db_extra_search_path,
--           per-role and ALTER DATABASE level;
--           pgrst.jwt_secret and any other setting are never selected),
--           function bodies, function settings other than search_path,
--           column defaults, connection strings or table data. It is NOT
--           guaranteed secret-free: sections 2, 2b and 6c print every
--           policy expression verbatim, and an expression can embed a
--           literal (an e-mail address, a UUID, a token, a bucket id).
--           Section 2b does the same for the other scanned schemas (public,
--           exposed schemas, realtime schemas; storage is in 6c).
--           Section 6a prints bucket ids, names and allowed_mime_types (and
--           section 7 prints bucket names), and section 1d prints column names.
--           Section 7 replaces quoted string literals in policy text by '?',
--           every double-quoted identifier by "?" and every bare numeric
--           literal by # (a lone 0 or 1 is kept so 1=1 stays readable), and
--           shows at most about 300 characters of each expression (around the
--           part that triggered the flag, with ... where text was cut). It
--           does NOT hide names: unquoted column, function and type names in
--           policy expressions print as written (section 7 detail, sections
--           2, 2b and 6c), as do object names and the schema-name-shaped
--           entries of a function's search_path (section 4 prints other
--           entries as ?). A flagged row can look harmless after masking
--           (c = 'x or true or y' is shown as c = '?'); read the verbatim
--           policy in section 2, 2b or 6c. Skim sections 2, 2b, 4, 6a and 6c
--           (and 3d, 7) before sharing the output; review_literals marks
--           likely literal-bearing rows.
-- How     : the SQL editor shows only the LAST statement's result, so run
--           each numbered section on its own (select the section, Run), or
--           run section 7 first for the one-screen summary. See
--           docs/ops/rls-state-check-README.md. Section 7 is a heuristic
--           summary: reading sections 2 and 2b is mandatory, not optional.
-- Schema  : edit nothing; the schema name 'skillup_dev' is spelled out in
--           each section. Sections look the schema up by name in
--           pg_namespace, so a missing schema yields empty results rather
--           than an error (section 7 then prints a G0 "schema missing"
--           row, so empty is never mistaken for clean). The roles anon /
--           authenticated / service_role must exist (they do on every
--           Supabase project); otherwise the privilege functions error.
--           Requires PostgreSQL 15+ for the security_invoker view option
--           (the query itself only reads reloptions).
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
  -- TRUNCATE bypasses RLS entirely; TRIGGER and REFERENCES are rarely wanted.
  concat_ws(',',
    CASE WHEN has_table_privilege('anon', c.oid, 'TRUNCATE')   THEN 'TRUNCATE'   END,
    CASE WHEN has_table_privilege('anon', c.oid, 'TRIGGER')    THEN 'TRIGGER'    END,
    CASE WHEN has_any_column_privilege('anon', c.oid, 'REFERENCES') THEN 'REFERENCES' END) AS anon_truncate_trigger_refs,
  concat_ws(',',
    CASE WHEN has_table_privilege('authenticated', c.oid, 'TRUNCATE')   THEN 'TRUNCATE'   END,
    CASE WHEN has_table_privilege('authenticated', c.oid, 'TRIGGER')    THEN 'TRIGGER'    END,
    CASE WHEN has_any_column_privilege('authenticated', c.oid, 'REFERENCES') THEN 'REFERENCES' END) AS auth_truncate_trigger_refs,
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
--     SIZE: one row per (object, grantee, grantor). The SQL editor caps the
--     displayed result at 1000 rows. result_rows (same on every row) is the
--     true total and `warning` is set on every row once it reaches 900:
--     then run 1c-compact below instead (one row per object).
-- ---------------------------------------------------------------------
SELECT count(*) OVER ()                                      AS result_rows,
       CASE WHEN count(*) OVER () >= 900
            THEN 'WARNING: near/over the 1000-row editor cap; run 1c-compact instead' END AS warning,
       c.relname AS object_name,
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
-- 1c-compact. Same ACL information, one row per object (grants collapsed
--     into one string: grantee=privileges[grantor]; ...). Privilege codes:
--     a=INSERT r=SELECT w=UPDATE d=DELETE D=TRUNCATE x=REFERENCES t=TRIGGER.
-- ---------------------------------------------------------------------
SELECT g.object_name, g.kind,
       count(*) OVER ()                                   AS result_rows,
       string_agg(g.grantee || '=' || g.codes || '/' || g.grantor, '; '
                  ORDER BY g.grantee, g.grantor)          AS grants
FROM (
  SELECT c.oid, c.relname AS object_name,
         CASE c.relkind WHEN 'r' THEN 'table' WHEN 'p' THEN 'partitioned table'
              WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view'
              WHEN 'f' THEN 'foreign table' END            AS kind,
         CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
         pg_get_userbyid(a.grantor)                        AS grantor,
         string_agg(CASE a.privilege_type
                      WHEN 'INSERT' THEN 'a' WHEN 'SELECT' THEN 'r' WHEN 'UPDATE' THEN 'w'
                      WHEN 'DELETE' THEN 'd' WHEN 'TRUNCATE' THEN 'D'
                      WHEN 'REFERENCES' THEN 'x' WHEN 'TRIGGER' THEN 't'
                      ELSE a.privilege_type END, '' ORDER BY a.privilege_type) AS codes
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
  WHERE n.nspname = 'skillup_dev'
    AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND (a.grantee = 0
         OR a.grantee IN (SELECT oid FROM pg_roles
                           WHERE rolname IN ('anon', 'authenticated', 'service_role')))
  GROUP BY c.oid, c.relname, c.relkind, a.grantee, a.grantor
) g
GROUP BY g.oid, g.object_name, g.kind
ORDER BY g.object_name;


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
-- 2. Policies on skillup_dev (every policy, verbatim). MANDATORY REVIEW:
--    section 7 only pattern-matches. Expressions are printed as stored, so
--    one can embed a literal e-mail address, UUID or token:
--    review_literals = true marks expressions that look like they contain
--    a UUID, an e-mail address, or a token-like run of 32+ characters that
--    has a digit or an upper-case letter (plain identifiers made only of
--    lower-case letters and underscores are NOT marked). It is a hint, not a
--    guarantee: short secrets are not detected, so skim every row.
--    SIZE: result_rows is the true total; `warning` is set from 900 rows
--    (the SQL editor shows at most 1000). Then narrow it with the marked
--    line below (remove the leading `--` and put a table name).
-- ---------------------------------------------------------------------
SELECT count(*) OVER ()                                           AS result_rows,
       CASE WHEN count(*) OVER () >= 900
            THEN 'WARNING: near/over the 1000-row editor cap; rows may be cut. Filter by table (see the marked line) and re-run per table'
       END                                                        AS warning,
       schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       ((coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~* '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?=[a-z0-9_=+/-]{32})[a-z_=+/-]*[0-9])'
        OR (coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~ '(?=[A-Za-z0-9_=+/-]{32})[a-z_=+/-]*[A-Z]')            AS review_literals,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname = 'skillup_dev'
  -- EDIT POINT (optional): remove the leading "--" and set a table name
  -- AND tablename = 'users'
ORDER BY tablename, cmd, policyname;


-- ---------------------------------------------------------------------
-- 2b. Policies on the OTHER schemas that section 7 scans (public, every
--     schema in pgrst.db_schemas, every schema with a table in the
--     supabase_realtime publication), verbatim, same columns as section 2.
--     skillup_dev is section 2 and storage is section 6c, so they are not
--     repeated here. Section 7 shows only a redacted, cut copy of a policy
--     expression; the full text of a G2 row on one of these schemas is here.
--     Run it on its own. Same size rules and review_literals hint as section 2.
-- ---------------------------------------------------------------------
WITH exposed_cfg AS (   -- ONLY the exposed-schema names; no other role setting is read
  SELECT btrim(s) AS nspname
  FROM pg_db_role_setting st
  CROSS JOIN LATERAL unnest(st.setconfig) AS c
  CROSS JOIN LATERAL unnest(string_to_array(regexp_replace(c, '^[^=]*=', ''), ',')) AS s
  WHERE c ~* '^pgrst\.db_schemas='
),
other_schemas AS (
  SELECT n.nspname
  FROM pg_namespace n
  WHERE n.nspname !~ '^pg_' AND n.nspname NOT IN ('information_schema', 'skillup_dev', 'storage')
    AND ( n.nspname = 'public'
       OR n.nspname IN (SELECT nspname FROM exposed_cfg)
       OR n.nspname IN (SELECT schemaname FROM pg_publication_tables WHERE pubname = 'supabase_realtime') )
)
SELECT count(*) OVER ()                                           AS result_rows,
       CASE WHEN count(*) OVER () >= 900
            THEN 'WARNING: near/over the 1000-row editor cap; rows may be cut. Filter by schema or table (see the marked lines) and re-run'
       END                                                        AS warning,
       schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       ((coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~* '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?=[a-z0-9_=+/-]{32})[a-z_=+/-]*[0-9])'
        OR (coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~ '(?=[A-Za-z0-9_=+/-]{32})[a-z_=+/-]*[A-Z]')            AS review_literals,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname IN (SELECT nspname FROM other_schemas)
  -- EDIT POINT (optional): remove the leading "--" and set a schema and/or table name
  -- AND schemaname = 'public' AND tablename = 'users'
ORDER BY schemaname, tablename, cmd, policyname;


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
-- 3b. Default privileges: what NEW tables / sequences / functions / types
--     grant to anon / authenticated / service_role / PUBLIC. Two kinds of row,
--     shown in the `source` column:
--       configured          = a pg_default_acl entry (ALTER DEFAULT PRIVILEGES).
--                             A schema-specific entry is ADDED to the object
--                             type's global default for that creating role.
--       built-in (no global entry) = the PostgreSQL built-in default, shown for
--                             a creating role and object type that has NO global
--                             (all-schemas) pg_default_acl entry. The built-in
--                             default is NOT "closed": new functions and
--                             procedures grant EXECUTE to PUBLIC, and new types
--                             grant USAGE to PUBLIC. A global entry REPLACES the
--                             built-in default; explicit grants to other roles
--                             in a schema entry do not remove PUBLIC EXECUTE
--                             (only REVOKE ... FROM PUBLIC in a global entry does).
--     So an absent row means "nothing configured and no built-in grant to
--     PUBLIC/API roles" ONLY for tables and sequences; read the built-in rows
--     for functions. Scoped to the relevant schemas (skillup_dev, public,
--     storage, or "all schemas") and to the roles that actually create objects
--     there (owners of existing objects in those schemas, plus postgres,
--     supabase_admin and the current user). One row per (creating role,
--     schema, object type, grantee, source).
-- ---------------------------------------------------------------------
WITH scope AS (SELECT oid FROM pg_namespace WHERE nspname IN ('skillup_dev', 'public', 'storage')),
creators AS (
  SELECT relowner AS role_oid FROM pg_class WHERE relnamespace IN (SELECT oid FROM scope)
  UNION SELECT proowner FROM pg_proc WHERE pronamespace IN (SELECT oid FROM scope)
  UNION SELECT oid FROM pg_roles WHERE rolname IN ('postgres', 'supabase_admin', current_user)
),
api AS (SELECT oid FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'service_role')),
configured AS (
  SELECT pg_get_userbyid(d.defaclrole)                     AS objects_created_by,
         coalesce(n.nspname, '(all schemas)')              AS in_schema,
         CASE d.defaclobjtype
           WHEN 'r' THEN 'tables'  WHEN 'S' THEN 'sequences'
           WHEN 'f' THEN 'functions' WHEN 'T' THEN 'types'
           WHEN 'n' THEN 'schemas' ELSE d.defaclobjtype::text END AS object_type,
         CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
         a.privilege_type,
         'configured'::text                                AS source
  FROM pg_default_acl d
  LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
  CROSS JOIN LATERAL aclexplode(d.defaclacl) a
  WHERE d.defaclrole IN (SELECT role_oid FROM creators)
    AND (d.defaclnamespace = 0 OR d.defaclnamespace IN (SELECT oid FROM scope))
    AND (a.grantee = 0 OR a.grantee IN (SELECT oid FROM api))
),
builtin AS (   -- no global entry for (creator, type): the built-in default applies
  SELECT pg_get_userbyid(c.role_oid)                       AS objects_created_by,
         '(all schemas)'::text                             AS in_schema,
         CASE t.code WHEN 'r' THEN 'tables' WHEN 'S' THEN 'sequences'
                     WHEN 'f' THEN 'functions' WHEN 'T' THEN 'types' END AS object_type,
         CASE a.grantee WHEN 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
         a.privilege_type,
         'built-in (no global entry)'::text                AS source
  FROM creators c
  -- t.code = pg_default_acl.defaclobjtype; t.acl_code = the matching acldefault() type letter
  -- (the two differ only for sequences: 'S' in pg_default_acl, 's' in acldefault)
  CROSS JOIN (VALUES ('r'::"char", 'r'::"char"), ('S'::"char", 's'::"char"),
                     ('f'::"char", 'f'::"char"), ('T'::"char", 'T'::"char")) AS t(code, acl_code)
  CROSS JOIN LATERAL aclexplode(acldefault(t.acl_code, c.role_oid)) a
  WHERE NOT EXISTS (SELECT 1 FROM pg_default_acl d
                     WHERE d.defaclrole = c.role_oid AND d.defaclnamespace = 0
                       AND d.defaclobjtype = t.code)
    AND (a.grantee = 0 OR a.grantee IN (SELECT oid FROM api))
)
SELECT objects_created_by, in_schema, object_type, grantee,
       string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges,
       source
FROM (SELECT * FROM configured UNION ALL SELECT * FROM builtin) u
GROUP BY objects_created_by, in_schema, object_type, grantee, source
ORDER BY objects_created_by, in_schema, object_type, grantee, source;


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
--     usually stores this as a setting on the 'authenticator' role. The
--     query selects ONLY the exposed-schema settings (pgrst.db_schemas,
--     pgrst.db_extra_search_path). Other settings on the same role, such as
--     pgrst.jwt_secret, are filtered out and never printed. An empty result
--     does not mean "not exposed": confirm in Dashboard -> Project Settings
--     -> API -> Exposed schemas. Includes ALTER DATABASE-level settings
--     (setrole = 0, shown as "(all roles)") as well as per-role ones.
-- ---------------------------------------------------------------------
SELECT coalesce(r.rolname::text, '(all roles)')                      AS rolname,
       CASE s.setdatabase WHEN 0 THEN '(all databases)'
            ELSE coalesce((SELECT d.datname::text FROM pg_database d WHERE d.oid = s.setdatabase), 'db oid ' || s.setdatabase) END AS database,
       c AS setting
FROM pg_db_role_setting s
LEFT JOIN pg_roles r ON r.oid = s.setrole
CROSS JOIN LATERAL unnest(s.setconfig) AS c
WHERE c ~* '^pgrst\.db_(schemas|extra_search_path)=';


-- ---------------------------------------------------------------------
-- 4. Functions in skillup_dev: SECURITY DEFINER flag, search_path
--    setting, and who may EXECUTE. public_execute is derived from the
--    ACL (grantee 0 = PUBLIC); a NULL proacl means the owner-default ACL,
--    which grants EXECUTE to PUBLIC.
--    SIZE: result_rows is the true total; `warning` is set from 900 rows
--    (the SQL editor shows at most 1000). Rows are ordered SECURITY DEFINER
--    first, so the riskiest functions are the last to be cut. Narrow it with
--    the marked line below.
-- ---------------------------------------------------------------------
SELECT
  count(*) OVER ()                                       AS result_rows,
  CASE WHEN count(*) OVER () >= 900
       THEN 'WARNING: near/over the 1000-row editor cap; rows may be cut. Filter by function name (see the marked line)'
  END                                                    AS warning,
  p.proname                                              AS function_name,
  pg_get_function_identity_arguments(p.oid)              AS arguments,
  CASE p.prokind WHEN 'f' THEN 'function' WHEN 'p' THEN 'procedure' ELSE p.prokind::text END AS kind,
  p.prosecdef                                            AS security_definer,
  -- Only the search_path entry is shown; any other function setting could
  -- hold a value that should not be printed, so only its count is shown.
  -- Free text could hide in the value, so only schema-name-shaped entries (lower-case
  -- identifiers, "$user", "") are printed; any other entry is shown as ?.
  (SELECT 'search_path=' || string_agg(CASE WHEN btrim(t.v) ~ '^([a-z_][a-z0-9_$]*|"\$user"|"")$'
                                            THEN btrim(t.v) ELSE '?' END, ', ' ORDER BY t.ord)
     FROM unnest(p.proconfig) o
     CROSS JOIN LATERAL regexp_split_to_table(regexp_replace(o, '^search_path=', '', 'i'), ',')
                        WITH ORDINALITY AS t(v, ord)
    WHERE o ~* '^search_path=')                          AS search_path_setting,
  EXISTS (SELECT 1 FROM unnest(p.proconfig) o
           WHERE o ~* '^search_path=')                   AS has_search_path,
  (SELECT count(*) FROM unnest(p.proconfig) o
    WHERE o !~* '^search_path=')                         AS other_settings_hidden,
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
  -- EDIT POINT (optional): remove the leading "--" and set a function name
  -- AND p.proname = 'my_function'
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
-- 6a. Storage buckets: public flag, size and MIME limits. If the running
--     role is itself subject to RLS on storage.buckets (or there are no
--     buckets) an extra first row with a `note` explains that the list may
--     be incomplete, so an empty result is never read as "no buckets".
--     Bucket ids and names are printed as stored; a name can be sensitive,
--     so skim this section before sharing the output.
-- ---------------------------------------------------------------------
WITH b AS (
  SELECT id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
  FROM storage.buckets
),
w AS (SELECT row_security_active('storage.buckets') AS rls_active, (SELECT count(*) FROM b) AS n)
SELECT note, id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
FROM (
SELECT 0 AS sort_key,
       CASE WHEN w.rls_active
            THEN 'WARNING: row-level security applies to ' || current_user
                 || ' on storage.buckets; the buckets below may be incomplete. Re-run as a role that bypasses RLS (postgres in the SQL editor).'
            ELSE 'No buckets exist.' END AS note,
       NULL::text AS id, NULL::text AS name, NULL::boolean AS public,
       NULL::bigint AS file_size_limit, NULL::text[] AS allowed_mime_types,
       NULL::timestamptz AS created_at, NULL::timestamptz AS updated_at
FROM w WHERE w.rls_active OR w.n = 0
UNION ALL
SELECT 1, NULL, b.id::text, b.name::text, b.public, b.file_size_limit::bigint,
       b.allowed_mime_types::text[], b.created_at::timestamptz, b.updated_at::timestamptz
FROM b
) u
ORDER BY sort_key, name;


-- ---------------------------------------------------------------------
-- 6b. storage.objects / storage.buckets: RLS flags (run on its own)
-- ---------------------------------------------------------------------
SELECT c.relname, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced_for_owner
FROM pg_class c
WHERE c.relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
  AND c.relname IN ('objects', 'buckets')
ORDER BY c.relname;


-- ---------------------------------------------------------------------
-- 6c. storage schema policies (run on its own). Printed verbatim, like
--     section 2: a policy often names a bucket (bucket_id = '...') or embeds
--     another literal. review_literals marks UUID / e-mail / long token-like
--     text (a hint only); skim every row before sharing.
-- ---------------------------------------------------------------------
SELECT schemaname, tablename, policyname, permissive,
       roles::text AS roles, cmd,
       ((coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~* '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?=[a-z0-9_=+/-]{32})[a-z_=+/-]*[0-9])'
        OR (coalesce(qual, '') || ' ' || coalesce(with_check, ''))
         ~ '(?=[A-Za-z0-9_=+/-]{32})[a-z_=+/-]*[A-Z]')            AS review_literals,
       qual        AS using_expr,
       with_check  AS with_check_expr
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, cmd, policyname;


-- ---------------------------------------------------------------------
-- 6d. Realtime: tables in the supabase_realtime publication, with RLS flag
--     and policy count. Realtime delivers changes only to roles that pass
--     RLS, so a published table with RLS off (or an open SELECT policy)
--     streams its rows to anyone with the anon key.
-- ---------------------------------------------------------------------
SELECT pt.schemaname, pt.tablename,
       c.relrowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies p
         WHERE p.schemaname = pt.schemaname AND p.tablename = pt.tablename) AS policy_count,
       has_any_column_privilege('anon', c.oid, 'SELECT')          AS anon_select,
       has_any_column_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select
FROM pg_publication_tables pt
LEFT JOIN pg_class c ON c.relname = pt.tablename
 AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = pt.schemaname)
WHERE pt.pubname = 'supabase_realtime'
ORDER BY pt.schemaname, pt.tablename;


-- ---------------------------------------------------------------------
-- 6e. Installed extensions (names, versions, schemas only).
-- ---------------------------------------------------------------------
SELECT e.extname, e.extversion, n.nspname AS installed_in_schema,
       e.extname IN ('dblink', 'pg_net', 'http', 'postgres_fdw', 'file_fdw',
                     'plpython3u', 'plperlu', 'pltclu', 'plv8', 'pg_cron',
                     'supabase_vault', 'pgsodium', 'wrappers')   AS outbound_or_privileged
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;


-- ---------------------------------------------------------------------
-- 7. SUMMARY of red flags (one screen). The result is NEVER empty: the
--    FIRST row is always a G0 SUMMARY row (total flag rows, counts per
--    severity and per check, and a WARNING when the total exceeds 900),
--    followed by G0 rows saying what was scanned. A result with only G0
--    INFO rows means "nothing matched these patterns", not "clean": the
--    flags are heuristics over catalog data that point at things to read,
--    they are not proof. Sections 1a, 2, 2b and 4 are the evidence, and reading
--    sections 2 and 2b is mandatory.
--    SIZE / ORDER: the SQL editor shows at most 1000 rows and silently drops
--    the rest. Rows are ordered SUMMARY, G0 scan rows, HIGH, MEDIUM, REVIEW,
--    INFO (inside a severity, checks with fewer rows of that severity first), so the most
--    serious rows are the last to be cut. If the SUMMARY row warns, run the
--    section once per check: at the very end of this section edit the line
--    marked EDIT POINT 1 (for example check_id IN ('G3')), Run, repeat for
--    each check_id that has rows (EDIT POINT 2 narrows by severity if one
--    check alone is over 900 rows). result_rows is the number of rows
--    returned by the current run.
--    Scope: skillup_dev, public, storage, every schema named in the
--    pgrst.db_schemas setting (if present) and every schema that has a
--    table in the supabase_realtime publication. Extension-owned objects
--    are skipped.
--    check_id:
--      G0  always present. "scanned N tables, M policies, K functions,
--          J views in <schema>" per scanned schema (views include
--          materialized views), plus "schema missing" (HIGH if tables
--          exist in public instead, else INFO) or "schema has no tables".
--      G1  anon (anyone with the anon key) or authenticated (needs a login)
--          holds SELECT/INSERT/UPDATE/DELETE (table or column level) on a
--          table that has RLS DISABLED; the detail shows the SELECT flags
--          separately. HIGH when the
--          role also has USAGE on the schema; MEDIUM when the schema is
--          known not to be in pgrst.db_schemas; INFO when no API role has
--          schema USAGE (unreachable). Also covers foreign tables (relkind
--          f), which cannot have RLS.
--      G2  PERMISSIVE policy that applies to public/anon/authenticated (TO
--          list, including a role that anon/authenticated EFFECTIVELY belongs
--          to: pg_has_role(.., 'USAGE'), i.e. membership with INHERIT; a
--          NOINHERIT membership does not count) and
--          whose USING or WITH CHECK is always true for that role:
--          literally true, true AND true, 1=1, auth.role()/auth.jwt()->>'role'
--          /current_setting('request.jwt.claims')->>'role' equal to, or IN /
--          = ANY (list, ARRAY[...] or '{a,b}' literal) CONTAINING,
--          anon/authenticated, auth.uid()/auth.jwt()
--          IS NOT NULL, including the Supabase "(select auth.uid())"
--          initplan style. A cheap secondary flag marks policies that are
--          POSSIBLY open (MEDIUM when anon holds the privilege or
--          authenticated holds it on a sensitive table, else REVIEW; never
--          HIGH): an OR arm that is open to an API role
--          (auth.role()='authenticated' OR auth.uid()=id), "... OR true",
--          the request.jwt.claims form with an anon/authenticated literal,
--          or "<column> IS NOT NULL". The two expressions are matched to the
--          privilege each one needs: an always-true USING needs SELECT (cmd
--          SELECT), UPDATE, DELETE or any of the three (ALL); an always-true
--          WITH CHECK needs INSERT (cmd INSERT), UPDATE or INSERT/UPDATE (ALL);
--          an ALL/UPDATE policy without WITH CHECK uses its USING as the check.
--          So ALL USING (false) WITH CHECK (true) is not HIGH for a role that
--          holds only SELECT. HIGH = anon holds the matching privilege (any
--          table), or authenticated holds it on a sensitive table;
--          REVIEW = authenticated-only on a non-sensitive table (fine only
--          for genuine reference data); INFO = open policy but no matching
--          privilege is held. Restrictive policies are NOT evaluated (their
--          count is shown), so a permissive true policy neutralised by a
--          restrictive one is still flagged. Policies limited to
--          service_role are not flagged. Anything cleverer is caught only
--          by reading sections 2, 2b and 6c. Also applies to storage.objects.
--      G3  SECURITY DEFINER function (not a trigger function) executable
--          by PUBLIC/anon (HIGH) or by authenticated only (MEDIUM, raised
--          to HIGH when search_path is not pinned).
--      G4  (info) RLS on, API roles hold grants, but the table has NO
--          policy: SELECT returns no rows, UPDATE/DELETE silently affect 0
--          rows, INSERT/upsert raises 42501 (audit C1a).
--      G5  (info) RLS on, policies exist, an API role holds a write grant,
--          but every permissive write policy that applies to that role
--          REFERENCES an auth function (auth.uid()/auth.jwt()/auth.role()/
--          request.jwt). The rejection claim (INSERT raises 42501, UPDATE/
--          DELETE affect 0 rows when no user JWT is sent) is made only when
--          every such policy is written so that it REQUIRES an identity
--          (auth.uid() = col, IS NOT NULL, auth.role() = 'authenticated').
--          A policy containing IS NULL, NOT, <>, !=, OR, true, coalesce,
--          CASE, IS DISTINCT or 'anon' (for example WITH CHECK
--          (auth.uid() IS NULL), which PASSES without a JWT) gets neutral
--          wording instead: no rejection is claimed. A row appears only if a
--          write policy targets that role (no policy for the role = blocked).
--      G6  View or materialized view that runs with owner rights (no
--          security_invoker=true) and that anon/authenticated can SELECT
--          (HIGH for both: a matview copies base rows with no RLS).
--      G7  Storage: public bucket (MEDIUM), or a warning that the running
--          role is subject to RLS on storage.buckets so the bucket list
--          may be incomplete. Open storage.objects policies and RLS-off
--          storage tables appear as G2 / G1 rows.
--      G8  Realtime: supabase_realtime publication summary (INFO), and
--          published tables with RLS off (graded like G1 but on the SELECT
--          privilege only, since Realtime streams rows: INFO when no API
--          role has schema USAGE, MEDIUM when the schema is not exposed or
--          no API role holds SELECT (an INSERT-only grant is MEDIUM), else
--          HIGH) or with a SELECT/ALL policy whose USING is open (or
--          possibly open): HIGH only when the role holds SELECT.
--      G9  anon/authenticated holds TRUNCATE (bypasses RLS), TRIGGER or
--          REFERENCES on a table (including foreign tables). One row per
--          table and role.
--      G10 Installed extensions (INFO); dblink/pg_net/http-style ones are
--          marked as outbound-capable or privileged.
-- ---------------------------------------------------------------------
WITH sensitive(name) AS (
  VALUES ('users'), ('game_states'), ('level_scores'), ('posts'), ('post_likes'),
         ('post_comments'), ('post_reports'), ('comments'), ('notifications'),
         ('guild_messages'), ('guilds'), ('guild_members'), ('career_context_items'),
         ('portfolio_accounts'), ('claim_codes'), ('transactions'), ('withdrawals'),
         ('feedback'), ('user_feedback'), ('mapping_feedback'), ('dm_threads'),
         ('dm_messages'), ('thread_participants'),
         ('user_mfa_settings'), ('user_roles'), ('user_notes'), ('user_blocks'),
         ('user_mutes'), ('user_last_position'), ('active_sessions'),
         ('auth_email_codes'), ('oauth_states'), ('push_tokens'), ('onboarding_drafts'),
         ('student_consents'), ('student_consent_requests'), ('student_affiliations'),
         ('student_subject_choices'), ('student_subject_grade_sets'),
         ('student_starting_points'), ('student_provision_drafts'),
         ('student_pathway_choices'), ('student_merge_candidates'),
         ('student_entrepreneurship_preferences'),
         ('account_deletion_cooldowns'), ('institution_verification_submissions'),
         ('institution_members'), ('institution_member_invites'),
         ('learning_interest_events'), ('learning_interest_active_selections'),
         ('referrals'), ('saved_items'), ('guidance_report_paths'), ('bookmarks'),
         ('bookmark_folders'), ('collections'), ('friends'), ('friend_requests'),
         ('follows'), ('follow_requests'), ('interview_sessions'),
         ('merchandise_orders'), ('starknet_transactions'), ('xp_events'),
         ('analytics_events'), ('notification_prefs'), ('project_members')
),
exposed_cfg AS (   -- ONLY the exposed-schema names; no other role setting is read
  SELECT btrim(s) AS nspname
  FROM pg_db_role_setting st
  CROSS JOIN LATERAL unnest(st.setconfig) AS c
  CROSS JOIN LATERAL unnest(string_to_array(regexp_replace(c, '^[^=]*=', ''), ',')) AS s
  WHERE c ~* '^pgrst\.db_schemas='
),
rt AS (SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'),
sc AS (
  SELECT n.oid, n.nspname
  FROM pg_namespace n
  WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
    AND ( n.nspname IN ('skillup_dev', 'public', 'storage')
       OR n.nspname IN (SELECT nspname FROM exposed_cfg)
       OR n.nspname IN (SELECT schemaname FROM rt) )
),
tbl AS (
  SELECT c.oid, n.nspname, c.relname, c.relrowsecurity, c.relkind,
         has_schema_privilege('anon', n.oid, 'USAGE')           AS anon_usage,
         has_schema_privilege('authenticated', n.oid, 'USAGE')  AS auth_usage,
         CASE WHEN NOT EXISTS (SELECT 1 FROM exposed_cfg) THEN 'unknown'
              WHEN n.nspname IN (SELECT nspname FROM exposed_cfg) THEN 'yes' ELSE 'no' END AS exposed,
         (has_any_column_privilege('anon', c.oid, 'SELECT')
          OR has_any_column_privilege('anon', c.oid, 'INSERT')
          OR has_any_column_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE'))          AS anon_any,
         (has_any_column_privilege('authenticated', c.oid, 'SELECT')
          OR has_any_column_privilege('authenticated', c.oid, 'INSERT')
          OR has_any_column_privilege('authenticated', c.oid, 'UPDATE')
          OR has_table_privilege('authenticated', c.oid, 'DELETE')) AS auth_any,
         has_any_column_privilege('anon', c.oid, 'SELECT')          AS anon_sel,
         has_any_column_privilege('authenticated', c.oid, 'SELECT') AS auth_sel,
         (has_any_column_privilege('anon', c.oid, 'INSERT')
          OR has_any_column_privilege('anon', c.oid, 'UPDATE')
          OR has_table_privilege('anon', c.oid, 'DELETE'))          AS anon_write,
         (has_any_column_privilege('authenticated', c.oid, 'INSERT')
          OR has_any_column_privilege('authenticated', c.oid, 'UPDATE')
          OR has_table_privilege('authenticated', c.oid, 'DELETE')) AS auth_write,
         concat_ws(',',
           CASE WHEN has_table_privilege('anon', c.oid, 'TRUNCATE') THEN 'TRUNCATE' END,
           CASE WHEN has_table_privilege('anon', c.oid, 'TRIGGER') THEN 'TRIGGER' END,
           CASE WHEN has_any_column_privilege('anon', c.oid, 'REFERENCES') THEN 'REFERENCES' END) AS anon_extra,
         concat_ws(',',
           CASE WHEN has_table_privilege('authenticated', c.oid, 'TRUNCATE') THEN 'TRUNCATE' END,
           CASE WHEN has_table_privilege('authenticated', c.oid, 'TRIGGER') THEN 'TRIGGER' END,
           CASE WHEN has_any_column_privilege('authenticated', c.oid, 'REFERENCES') THEN 'REFERENCES' END) AS auth_extra
  FROM pg_class c
  JOIN sc n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p', 'f')     -- tables, partitioned tables, foreign tables (a foreign table cannot have RLS)
    AND NOT EXISTS (SELECT 1 FROM pg_depend d
                     WHERE d.classid = 'pg_class'::regclass AND d.objid = c.oid AND d.deptype = 'e')
),
eff AS (   -- EFFECTIVE role sets: PUBLIC plus every role the API role has the privileges of.
  -- pg_has_role(.., 'USAGE') is the inheritance-aware membership test (a role granted
  -- to anon WITH INHERIT counts; a NOINHERIT membership does not), the same test
  -- PostgreSQL applies when it decides whether a policy's TO list covers the current role.
  SELECT ARRAY['public'::name] || coalesce((SELECT array_agg(r.rolname) FROM pg_roles r
                                              WHERE pg_has_role('anon', r.oid, 'USAGE')), '{}'::name[])          AS anon_roles,
         ARRAY['public'::name] || coalesce((SELECT array_agg(r.rolname) FROM pg_roles r
                                              WHERE pg_has_role('authenticated', r.oid, 'USAGE')), '{}'::name[]) AS auth_roles
),
pol AS (   -- permissive policies with a normalised expression
  SELECT t.oid AS tbl_oid, t.nspname, p.tablename, p.policyname, p.cmd, p.roles,
         p.qual, p.with_check,
         (p.roles && eff.anon_roles)                             AS hits_anon,
         (p.roles && eff.auth_roles)                             AS hits_auth,
         ((coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''))
            ~* '(auth\.(uid|jwt|role|email)\s*\(|request\.jwt)') AS uses_auth_fn,
         -- id_req: references an auth function AND is written in a form that REQUIRES an
         -- identity (auth.uid() = col, auth.uid() IS NOT NULL, auth.role() = 'authenticated').
         -- Any IS NULL / NOT / <> / != / OR / true / coalesce / nullif / CASE / IS DISTINCT /
         -- 'anon' in the text makes this false: such a policy may PASS without a user JWT, so
         -- G5 must not claim it is rejected. (Conservative: a word inside a literal also does.)
         (((coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''))
             ~* '(auth\.(uid|jwt|role|email)\s*\(|request\.jwt)')
          AND NOT (regexp_replace(lower(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, '')),
                                  'is\s+not\s+null', '', 'g')
                   ~ '(\mis\s+null\M|\mnot\M|<>|!=|\mor\M|\mcoalesce\M|\mnullif\M|\mtrue\M|\mcase\M|\mis\s+distinct\M|''anon'')')) AS id_req
  FROM pg_policies p
  CROSS JOIN eff
  JOIN tbl t ON t.nspname = p.schemaname AND t.relname = p.tablename
  WHERE p.permissive = 'PERMISSIVE'
),
expr AS (  -- one row per USING / WITH CHECK expression, normalised
  SELECT o.nspname, o.tablename, o.policyname, k.kind, k.raw,
         -- lower-case; drop "AS alias" and ::type casts; drop the word
         -- "select" (initplan wrapper); drop parentheses and whitespace
         -- then drop always-true AND arms ("x AND true", "true AND x") so that
         -- "auth.role()='authenticated' AND true" reads as the bare role test
         regexp_replace(
           regexp_replace(
             regexp_replace(
               regexp_replace(
                 regexp_replace(
                   regexp_replace(lower(k.raw), '\s+as\s+[a-z_][a-z0-9_]*', '', 'g'),
                   '::(text|character varying|varchar|name|bpchar|uuid|boolean|bool|integer|int4|bigint|int8|jsonb|json|regclass|regrole)(\[\])?', '', 'g'),
                 '\mselect\M', '', 'g'),
               '[()\s]', '', 'g'),
             'and(true|1=1)(?=and|or|$)', '', 'g'),
           '(^|or)(true|1=1)and', '\1', 'g') AS n,
         -- display form for section 7 (see the rd / win laterals below)
         CASE WHEN length(rd.full) <= 300 THEN rd.full
              ELSE CASE WHEN win.st > 1 THEN '...' ELSE '' END
                   || substr(rd.full, win.st, 300)
                   || CASE WHEN win.st + 299 < length(rd.full) THEN '...' ELSE '' END END AS raw_red
  FROM pol o
  CROSS JOIN LATERAL (VALUES ('USING', o.qual), ('WITH CHECK', o.with_check)) AS k(kind, raw)
  -- rd.full = display text with secrets masked. The text is split into tokens in
  -- ONE left-to-right pass, so a quote of one kind inside a token of the other
  -- kind cannot desynchronise the quote pairing: a '...' string literal becomes
  -- '?' (a literal that is exactly a role name or JWT claim key the patterns use
  -- is kept); a "..." identifier (any name, including one that holds an
  -- apostrophe, a space or a doubled quote) becomes "?"; a bare numeric literal
  -- becomes # (a lone 0 or 1 is kept, see above). Everything else is kept (unquoted
  -- column, function and type names print as written). Masking affects the DISPLAY
  -- only: detection (the n column above) runs on the unredacted text.
  CROSS JOIN LATERAL (
    SELECT coalesce(string_agg(
             CASE WHEN m.g[1] IS NOT NULL THEN
                    CASE WHEN m.g[1] ~ '^''(anon|authenticated|service_role|role|email|sub|app_metadata|user_metadata|request\.jwt\.claims|request\.jwt\.claim\.role)''$'
                         THEN m.g[1] ELSE '''?''' END
                  WHEN m.g[2] IS NOT NULL THEN '"?"'
                  ELSE coalesce(regexp_replace(m.g[3],
                         -- bare numeric literals become #: decimal, 3.14, .5, 1e9, 1.5e-3, 1_000,
                         -- 0x.. / 0b.. / 0o.. (negative numbers keep their minus sign). A lone 0 or 1
                         -- is kept so an always-true arm such as 1=1 stays readable. Digits inside
                         -- names (col1, int4) are not literals: \m only matches at the start of a word.
                         '(?![01](?![0-9A-Za-z_]|\.[0-9A-Za-z_]))(?:\m0[xX][0-9a-fA-F_]+|\m0[bB][01_]+|\m0[oO][0-7_]+|\m[0-9][0-9_]*(?:\.[0-9_]*)?(?:[eE][+-]?[0-9]+)?|\.[0-9][0-9_]*(?:[eE][+-]?[0-9]+)?)',
                         '#', 'g'), m.g[4]) END,
             '' ORDER BY m.ord), '') AS full
    FROM regexp_matches(k.raw, '(''(?:[^'']|'''')*'')|("(?:[^"]|"")*")|([^''"]+)|([''"])', 'g')
         WITH ORDINALITY AS m(g, ord)
  ) rd
  -- win.st = start of the 300-character window: it is placed so the first token
  -- that can trigger a flag (true, 1=1, auth.*, request.jwt, IS NOT NULL, an API
  -- role name) sits about a third into it, so a long expression is not cut
  -- before the arm that matched.
  CROSS JOIN LATERAL (
    SELECT greatest(1, coalesce(length(substring(rd.full from
             '(?i)^(.*?)(?:\mtrue\M|1\s*=\s*1|auth\.|request\.jwt|is\s+not\s+null|''(?:anon|authenticated)'')')), 0) + 1 - 100) AS st
  ) win
  WHERE k.raw IS NOT NULL
),
pat AS (   -- R = an expression that yields the caller's role
  SELECT '(auth\.role|auth\.jwt->>''role''|current_setting''request\.jwt\.claim\.role''(,(true|false))?|current_setting''request\.jwt\.claims''(,(true|false))?->>''role'')' AS r,
         -- IN-list / array-literal tails that CONTAIN the role W among any elements
         -- (W is replaced by anon, authenticated or the (anon|authenticated) group)
         'in(''[^'']*'',)*''W''(,''[^'']*'')*' AS in_tpl,
         '=any(array\[(''[^'']*'',)*''W''(,''[^'']*'')*\]|''\{([^''}]*,)?"?W"?(,[^''}]*)?\}'')' AS any_tpl
),
pat2 AS (   -- A = one OR arm that is open to an API role (used by the "possibly open" review flag)
  SELECT pat.*,
         '(' || pat.r || '=''(anon|authenticated)''|''(anon|authenticated)''=' || pat.r
             || '|' || pat.r || replace(pat.in_tpl, 'W', '(anon|authenticated)')
             || '|' || pat.r || replace(pat.any_tpl, 'W', '(anon|authenticated)')
             || '|auth\.(uid|jwt|role)isnotnull)' AS arm
  FROM pat
),
exprflag AS (
  SELECT e.nspname, e.tablename, e.policyname, e.kind, e.raw, e.raw_red,
         -- true for every caller
         (e.n ~ '^(true|1=1|true=true|notfalse|nottrue=false)$'
          OR e.n ~ '^(true|1=1)(and(true|1=1))+$') AS p_all,
         -- true for anon
         (e.n ~ ('^' || pat2.r || '=''anon''$') OR e.n ~ ('^''anon''=' || pat2.r || '$')
          OR e.n ~ ('^' || pat2.r || replace(pat2.in_tpl, 'W', 'anon') || '$')
          OR e.n ~ ('^' || pat2.r || replace(pat2.any_tpl, 'W', 'anon') || '$')
          OR e.n ~ ('^' || pat2.r || '(<>|!=)''authenticated''$')) AS p_anon,
         -- true for authenticated
         (e.n ~ ('^' || pat2.r || '=''authenticated''$') OR e.n ~ ('^''authenticated''=' || pat2.r || '$')
          OR e.n ~ ('^' || pat2.r || replace(pat2.in_tpl, 'W', 'authenticated') || '$')
          OR e.n ~ ('^' || pat2.r || replace(pat2.any_tpl, 'W', 'authenticated') || '$')
          OR e.n ~ ('^' || pat2.r || '(<>|!=)''anon''$')
          OR e.n ~ '^(auth\.(uid|jwt|role)isnotnull|notauth\.(uid|jwt|role)isnull)$') AS p_auth,
         -- cheap "possibly open" flag (reported as REVIEW/MEDIUM, never HIGH):
         -- an OR arm that is open to an API role (auth.role()='authenticated'
         -- OR auth.uid()=id), an always-true OR arm in any position ("true OR x",
         -- "x OR true"), the request.jwt.claims form with an API role literal,
         -- or "<column> IS NOT NULL"
         (e.n ~ ('(^|or)' || pat2.arm || '(or|$)')
          OR e.n ~ '(^|or)(true|1=1)(or|$)'
          OR (e.n ~ 'request\.jwt\.claims' AND e.n ~ '''(anon|authenticated)''')
          OR e.n ~ '^[a-z_][a-z0-9_.]*isnotnull$') AS p_rev
  FROM expr e CROSS JOIN pat2
),
openpol AS (  -- policies that are always-true for an API role they apply to, kept PER EXPRESSION KIND
  -- USING and WITH CHECK are different expressions: USING gates SELECT/UPDATE/DELETE (and the
  -- read side of ALL), WITH CHECK gates INSERT/UPDATE (and the write side of ALL). They are
  -- evaluated separately and each is matched to the privileges it actually needs (openpol2).
  SELECT o.*,
         coalesce(bool_or(f.p_all OR f.p_anon) FILTER (WHERE f.kind = 'USING')      OVER w, false) AS u_anon,
         coalesce(bool_or(f.p_all OR f.p_auth) FILTER (WHERE f.kind = 'USING')      OVER w, false) AS u_auth,
         coalesce(bool_or(f.p_all OR f.p_anon) FILTER (WHERE f.kind = 'WITH CHECK') OVER w, false) AS c_anon,
         coalesce(bool_or(f.p_all OR f.p_auth) FILTER (WHERE f.kind = 'WITH CHECK') OVER w, false) AS c_auth,
         coalesce(bool_or(f.p_rev)             FILTER (WHERE f.kind = 'USING')      OVER w, false) AS u_rev,
         coalesce(bool_or(f.p_rev)             FILTER (WHERE f.kind = 'WITH CHECK') OVER w, false) AS c_rev,
         string_agg(f.kind || ' ' || f.raw_red, ' / ') FILTER (WHERE f.p_all OR f.p_anon OR f.p_auth OR f.p_rev) OVER w AS matched_expr
  FROM pol o
  JOIN exprflag f ON f.nspname = o.nspname AND f.tablename = o.tablename AND f.policyname = o.policyname
  WINDOW w AS (PARTITION BY o.nspname, o.tablename, o.policyname)
),
openpol1 AS (   -- an ALL or UPDATE policy with no WITH CHECK applies its USING expression as the check
  SELECT o.*,
         CASE WHEN o.with_check IS NULL AND o.cmd IN ('ALL', 'UPDATE') THEN o.u_anon ELSE o.c_anon END AS ce_anon,
         CASE WHEN o.with_check IS NULL AND o.cmd IN ('ALL', 'UPDATE') THEN o.u_auth ELSE o.c_auth END AS ce_auth,
         CASE WHEN o.with_check IS NULL AND o.cmd IN ('ALL', 'UPDATE') THEN o.u_rev  ELSE o.c_rev  END AS ce_rev
  FROM openpol o
),
openpol2 AS (
  SELECT DISTINCT ON (o.nspname, o.tablename, o.policyname)
         o.nspname, o.tbl_oid, o.tablename, o.policyname, o.cmd, o.roles,
         (o.hits_anon AND (o.u_anon OR o.ce_anon)) AS anon_open,
         (o.hits_auth AND (o.u_auth OR o.ce_auth)) AS auth_open,
         ((o.u_rev OR o.ce_rev) AND (o.hits_anon OR o.hits_auth)
            AND NOT ((o.hits_anon AND (o.u_anon OR o.ce_anon)) OR (o.hits_auth AND (o.u_auth OR o.ce_auth)))) AS maybe_open,
         o.hits_anon, o.hits_auth,
         o.matched_expr,
         -- *_holds: an always-true expression is matched to the privilege it needs.
         --   USING          needs SELECT (cmd SELECT), UPDATE (UPDATE), DELETE (DELETE), any of the three (ALL)
         --   WITH CHECK     needs INSERT (cmd INSERT), UPDATE (UPDATE), INSERT or UPDATE (ALL)
         -- so ALL USING (false) WITH CHECK (true) is not "held" by a role with only SELECT.
         (o.u_anon AND CASE o.cmd WHEN 'SELECT' THEN pr.a_sel WHEN 'UPDATE' THEN pr.a_upd WHEN 'DELETE' THEN pr.a_del
                                  WHEN 'ALL' THEN (pr.a_sel OR pr.a_upd OR pr.a_del) ELSE false END)
          OR (o.ce_anon AND CASE o.cmd WHEN 'INSERT' THEN pr.a_ins WHEN 'UPDATE' THEN pr.a_upd
                                       WHEN 'ALL' THEN (pr.a_ins OR pr.a_upd) ELSE false END) AS anon_holds,
         (o.u_auth AND CASE o.cmd WHEN 'SELECT' THEN pr.u_sel WHEN 'UPDATE' THEN pr.u_upd WHEN 'DELETE' THEN pr.u_del
                                  WHEN 'ALL' THEN (pr.u_sel OR pr.u_upd OR pr.u_del) ELSE false END)
          OR (o.ce_auth AND CASE o.cmd WHEN 'INSERT' THEN pr.u_ins WHEN 'UPDATE' THEN pr.u_upd
                                       WHEN 'ALL' THEN (pr.u_ins OR pr.u_upd) ELSE false END) AS auth_holds,
         -- the same matching for the "possibly open" heuristic
         (o.u_rev AND CASE o.cmd WHEN 'SELECT' THEN pr.a_sel WHEN 'UPDATE' THEN pr.a_upd WHEN 'DELETE' THEN pr.a_del
                                 WHEN 'ALL' THEN (pr.a_sel OR pr.a_upd OR pr.a_del) ELSE false END)
          OR (o.ce_rev AND CASE o.cmd WHEN 'INSERT' THEN pr.a_ins WHEN 'UPDATE' THEN pr.a_upd
                                      WHEN 'ALL' THEN (pr.a_ins OR pr.a_upd) ELSE false END) AS anon_rev_holds,
         (o.u_rev AND CASE o.cmd WHEN 'SELECT' THEN pr.u_sel WHEN 'UPDATE' THEN pr.u_upd WHEN 'DELETE' THEN pr.u_del
                                 WHEN 'ALL' THEN (pr.u_sel OR pr.u_upd OR pr.u_del) ELSE false END)
          OR (o.ce_rev AND CASE o.cmd WHEN 'INSERT' THEN pr.u_ins WHEN 'UPDATE' THEN pr.u_upd
                                      WHEN 'ALL' THEN (pr.u_ins OR pr.u_upd) ELSE false END) AS auth_rev_holds,
         -- Realtime (G8) delivers rows by the USING side of a SELECT or ALL policy and needs SELECT:
         (o.hits_anon AND o.u_anon) AS rt_anon_open,
         (o.hits_auth AND o.u_auth) AS rt_auth_open,
         (o.u_rev AND (o.hits_anon OR o.hits_auth)
            AND NOT ((o.hits_anon AND o.u_anon) OR (o.hits_auth AND o.u_auth))) AS rt_maybe_open,
         pr.a_sel AS anon_sel, pr.u_sel AS auth_sel,
         concat_ws(' ', CASE WHEN o.hits_anon AND o.u_anon  THEN 'anon:USING' END,
                        CASE WHEN o.hits_anon AND o.ce_anon THEN 'anon:WITH CHECK' END,
                        CASE WHEN o.hits_auth AND o.u_auth  THEN 'authenticated:USING' END,
                        CASE WHEN o.hits_auth AND o.ce_auth THEN 'authenticated:WITH CHECK' END) AS open_kinds
  FROM openpol1 o
  CROSS JOIN LATERAL (SELECT
      has_any_column_privilege('anon', o.tbl_oid, 'SELECT')          AS a_sel,
      has_any_column_privilege('anon', o.tbl_oid, 'INSERT')          AS a_ins,
      has_any_column_privilege('anon', o.tbl_oid, 'UPDATE')          AS a_upd,
      has_table_privilege('anon', o.tbl_oid, 'DELETE')               AS a_del,
      has_any_column_privilege('authenticated', o.tbl_oid, 'SELECT') AS u_sel,
      has_any_column_privilege('authenticated', o.tbl_oid, 'INSERT') AS u_ins,
      has_any_column_privilege('authenticated', o.tbl_oid, 'UPDATE') AS u_upd,
      has_table_privilege('authenticated', o.tbl_oid, 'DELETE')      AS u_del) pr
  WHERE o.matched_expr IS NOT NULL
    AND ((o.hits_anon AND (o.u_anon OR o.ce_anon)) OR (o.hits_auth AND (o.u_auth OR o.ce_auth))
         OR ((o.u_rev OR o.ce_rev) AND (o.hits_anon OR o.hits_auth)))
),
buckets AS (   -- one fixed constant SELECT on storage.buckets, only if it exists
  -- Control characters (including tab, newline and the ones XML 1.0 cannot carry) are replaced by ?
  -- inside that SELECT, so a hostile bucket name can neither make query_to_xml produce a document
  -- the parser rejects (which would abort the whole statement) nor break the one-line display. xmltable returns the text unescaped (a<b&c stays a<b&c) and an empty
  -- name stays an empty string.
  SELECT coalesce(x.name, '')                  AS name,
         coalesce(x.is_public = 'true', false) AS is_public
  FROM xmltable('/table/row'
         PASSING CASE WHEN to_regclass('storage.buckets') IS NOT NULL
                      THEN query_to_xml('SELECT regexp_replace(name, ''[\x01-\x1F\x7F\uFFFE\uFFFF]'', ''?'', ''g'') AS name, public FROM storage.buckets', false, false, '') END
         COLUMNS name text PATH 'name', is_public text PATH 'public') AS x
),
bucket_rls AS (
  SELECT CASE WHEN to_regclass('storage.buckets') IS NOT NULL
              THEN row_security_active('storage.buckets') END AS rls_active
),
schema_counts AS (
  SELECT s.nspname,
         EXISTS (SELECT 1 FROM pg_namespace x WHERE x.nspname = s.nspname)           AS schema_exists,
         (SELECT count(*) FROM tbl t WHERE t.nspname = s.nspname)                    AS n_tables,
         (SELECT count(*) FROM pg_policies p WHERE p.schemaname = s.nspname)         AS n_policies,
         (SELECT count(*) FROM pg_proc p JOIN pg_namespace pn ON pn.oid = p.pronamespace
           WHERE pn.nspname = s.nspname AND p.prokind IN ('f', 'p')
             AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_proc'::regclass
                               AND d.objid = p.oid AND d.deptype = 'e'))             AS n_functions,
         (SELECT count(*) FROM pg_class v JOIN pg_namespace vn ON vn.oid = v.relnamespace
           WHERE vn.nspname = s.nspname AND v.relkind IN ('v', 'm')
             AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass
                               AND d.objid = v.oid AND d.deptype = 'e'))             AS n_views
  FROM (SELECT 'skillup_dev'::name AS nspname UNION SELECT nspname FROM sc) s
),
flags AS (
  -- G0: what was scanned (always at least one row) -------------------
  SELECT 'G0'::text AS check_id, 'INFO'::text AS severity, k.nspname::text AS object,
         concat('scanned ', k.n_tables, ' tables, ', k.n_policies, ' policies, ',
                k.n_functions, ' functions, ', k.n_views, ' views in ', k.nspname) AS detail
  FROM schema_counts k
  UNION ALL
  SELECT 'G0',
         CASE WHEN (SELECT n_tables FROM schema_counts WHERE nspname = 'skillup_dev') = 0
                   AND (SELECT n_tables FROM schema_counts WHERE nspname = 'public') > 0 THEN 'HIGH' ELSE 'INFO' END,
         'skillup_dev',
         concat('schema missing: skillup_dev does not exist, so nothing in it was checked',
                CASE WHEN (SELECT n_tables FROM schema_counts WHERE nspname = 'public') > 0
                     THEN concat('; ', (SELECT n_tables FROM schema_counts WHERE nspname = 'public'),
                                 ' tables live in public instead (see the public G0 row and G1-G9 rows for public)')
                     ELSE '' END)
  FROM schema_counts k
  WHERE k.nspname = 'skillup_dev' AND NOT k.schema_exists
  UNION ALL
  SELECT 'G0', 'MEDIUM', 'skillup_dev',
         'schema exists but contains no tables: the app data may live in another schema'
  FROM schema_counts k
  WHERE k.nspname = 'skillup_dev' AND k.schema_exists AND k.n_tables = 0
  UNION ALL
  SELECT 'G0', 'INFO', 'pgrst.db_schemas',
         CASE WHEN EXISTS (SELECT 1 FROM exposed_cfg)
              THEN 'exposed schemas per role setting: ' || (SELECT string_agg(DISTINCT nspname, ', ' ORDER BY nspname) FROM exposed_cfg)
              ELSE 'no pgrst.db_schemas role setting found (exposure unknown: confirm in Dashboard -> API settings)' END

  -- G1 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G1',
         CASE WHEN NOT ((t.anon_any AND t.anon_usage) OR (t.auth_any AND t.auth_usage)) THEN 'INFO'
              WHEN t.exposed = 'no' THEN 'MEDIUM' ELSE 'HIGH' END,
         t.nspname || '.' || t.relname,
         concat('RLS disabled; anon holds a table/column privilege=', t.anon_any,
                ' (SELECT=', t.anon_sel, '), authenticated=', t.auth_any, ' (SELECT=', t.auth_sel, ')',
                '; schema USAGE anon=', t.anon_usage, ' authenticated=', t.auth_usage,
                '; schema in pgrst.db_schemas: ', t.exposed,
                CASE WHEN NOT (t.anon_usage OR t.auth_usage)
                     THEN ' (no API role has schema USAGE: unreachable through the API)' ELSE '' END,
                CASE WHEN t.relkind = 'f'
                     THEN '; FOREIGN TABLE: it cannot have RLS, so the grants are the only control' ELSE '' END)
  FROM tbl t
  WHERE NOT t.relrowsecurity AND (t.anon_any OR t.auth_any)

  -- G2 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G2',
         CASE WHEN o.anon_open AND o.anon_holds THEN 'HIGH'
              WHEN o.auth_open AND o.auth_holds AND s.name IS NOT NULL THEN 'HIGH'
              WHEN o.auth_open AND o.auth_holds THEN 'REVIEW'
              WHEN o.maybe_open AND ((o.hits_anon AND o.anon_rev_holds)
                                  OR (o.hits_auth AND o.auth_rev_holds AND s.name IS NOT NULL)) THEN 'MEDIUM'
              WHEN o.maybe_open AND o.hits_auth AND o.auth_rev_holds THEN 'REVIEW'
              ELSE 'INFO' END,
         o.nspname || '.' || o.tablename,
         concat('policy ', o.policyname, ' (', o.cmd, ', roles ', o.roles::text, '): ',
                CASE WHEN o.maybe_open
                     THEN '[POSSIBLY open: an OR arm or always-true form that the patterns only partly recognise (heuristic, not proof); read sections 2/2b/6c] '
                     ELSE '' END,
                o.matched_expr,
                '; open to anon=', o.anon_open, ' and anon holds the privilege that expression needs=', (o.anon_open AND o.anon_holds),
                '; open to authenticated=', o.auth_open, ' and authenticated holds the privilege that expression needs=', (o.auth_open AND o.auth_holds),
                CASE WHEN o.open_kinds <> '' THEN '; always-true expression kind(s): ' || o.open_kinds ELSE '' END,
                '; sensitive table=', (s.name IS NOT NULL),
                '; restrictive policies on table (not evaluated)=',
                (SELECT count(*) FROM pg_policies r
                  WHERE r.schemaname = o.nspname AND r.tablename = o.tablename AND r.permissive = 'RESTRICTIVE'))
  FROM openpol2 o
  LEFT JOIN sensitive s ON s.name = o.tablename

  -- G3 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G3',
         CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'HIGH'
              WHEN NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) o WHERE o ~* '^search_path=') THEN 'HIGH'
              ELSE 'MEDIUM' END,
         pn.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
         concat('SECURITY DEFINER; public_execute=',
                EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'),
                ' anon_execute=', has_function_privilege('anon', p.oid, 'EXECUTE'),
                ' authenticated_execute=', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
                '; search_path pinned=',
                EXISTS (SELECT 1 FROM unnest(p.proconfig) o WHERE o ~* '^search_path='),
                CASE WHEN NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) o WHERE o ~* '^search_path=')
                     THEN ' (NOT pinned: search-path hijack risk)' ELSE '' END)
  FROM pg_proc p
  JOIN sc pn ON pn.oid = p.pronamespace
  WHERE p.prokind IN ('f', 'p')
    AND p.prosecdef
    AND p.prorettype NOT IN ('trigger'::regtype, 'event_trigger'::regtype)
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_proc'::regclass
                      AND d.objid = p.oid AND d.deptype = 'e')
    AND ( has_function_privilege('anon', p.oid, 'EXECUTE')
       OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
       OR EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                   WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'))

  -- G4 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G4', 'INFO', t.nspname || '.' || t.relname,
         concat('RLS on, no policy at all; anon=', t.anon_any, ' authenticated=', t.auth_any,
                ' (SELECT returns no rows; UPDATE/DELETE silently affect 0 rows; INSERT/upsert raises 42501)')
  FROM tbl t
  WHERE t.relrowsecurity
    AND (t.anon_any OR t.auth_any)
    AND NOT EXISTS (SELECT 1 FROM pg_policies p
                     WHERE p.schemaname = t.nspname AND p.tablename = t.relname)

  -- G5 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G5', 'INFO', t.nspname || '.' || t.relname || ' [' || r.role_name || ']',
         CASE WHEN NOT EXISTS (SELECT 1 FROM pol o        -- every applicable write policy REQUIRES an identity
                                WHERE o.tbl_oid = t.oid AND o.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
                                  AND ((r.role_name = 'anon' AND o.hits_anon)
                                    OR (r.role_name = 'authenticated' AND o.hits_auth))
                                  AND NOT o.id_req)
              THEN concat('RLS on; ', r.role_name, ' holds a write grant; every permissive INSERT/UPDATE/DELETE/ALL policy that applies to it ',
                          'references an auth function in a form that REQUIRES an identity (auth.uid() = col, IS NOT NULL, ',
                          'auth.role() = ''authenticated''). Expected for normal tables; only relevant if the backend uses ',
                          'this role WITHOUT a Supabase user JWT (then INSERT raises 42501, UPDATE/DELETE affect 0 rows)')
              ELSE concat('RLS on; ', r.role_name, ' holds a write grant; every permissive write policy that applies to it references an auth function ',
                          '(auth.uid()/auth.jwt()/auth.role()/request.jwt). At least one is written in a form that may still PASS ',
                          'without a user JWT (IS NULL, NOT, <>, OR, true, coalesce, CASE, ''anon''): no rejection is claimed; read the expression in sections 2/2b')
         END
  FROM tbl t
  CROSS JOIN LATERAL (VALUES ('anon', t.anon_write), ('authenticated', t.auth_write)) AS r(role_name, has_write)
  WHERE t.relrowsecurity
    AND r.has_write
    AND EXISTS (SELECT 1 FROM pg_policies p
                 WHERE p.schemaname = t.nspname AND p.tablename = t.relname)   -- no-policy tables are G4
    AND EXISTS (SELECT 1 FROM pol o        -- a write policy must target this role; otherwise it is simply blocked
                 WHERE o.tbl_oid = t.oid AND o.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
                   AND ((r.role_name = 'anon' AND o.hits_anon)
                     OR (r.role_name = 'authenticated' AND o.hits_auth)))
    AND NOT EXISTS (SELECT 1 FROM pol o
                     WHERE o.tbl_oid = t.oid
                       AND o.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
                       AND ((r.role_name = 'anon' AND o.hits_anon)
                         OR (r.role_name = 'authenticated' AND o.hits_auth))
                       AND NOT o.uses_auth_fn)

  -- G6 ---------------------------------------------------------------
  UNION ALL
  SELECT 'G6', 'HIGH',
         vn.nspname || '.' || c.relname,
         concat(CASE c.relkind WHEN 'v' THEN 'view' ELSE 'materialized view' END,
                ' without security_invoker=true (owner ', pg_get_userbyid(c.relowner),
                '); anon select=', has_any_column_privilege('anon', c.oid, 'SELECT'),
                ' authenticated select=', has_any_column_privilege('authenticated', c.oid, 'SELECT'),
                CASE c.relkind WHEN 'm' THEN '; a materialized view holds a copy of the base rows and never applies RLS'
                     ELSE '; runs with owner rights, bypassing RLS on its base tables' END)
  FROM pg_class c
  JOIN sc vn ON vn.oid = c.relnamespace
  WHERE c.relkind IN ('v', 'm')
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass
                      AND d.objid = c.oid AND d.deptype = 'e')
    AND (c.relkind = 'm'
         OR NOT coalesce((SELECT bool_or(o ~* '^security_invoker=(true|on|1|yes)$')
                            FROM unnest(c.reloptions) o), false))
    AND ( has_any_column_privilege('anon', c.oid, 'SELECT')
       OR has_any_column_privilege('authenticated', c.oid, 'SELECT'))

  -- G7: storage ------------------------------------------------------
  UNION ALL
  SELECT 'G7', 'MEDIUM', 'storage.bucket ' || CASE WHEN b.name = '' THEN '(empty name)' ELSE b.name END,
         'public bucket: objects are readable by URL without authentication'
  FROM buckets b WHERE b.is_public
  UNION ALL
  SELECT 'G7', 'MEDIUM', 'storage.buckets',
         concat('row-level security applies to ', current_user,
                ' on storage.buckets: the bucket list (and any public-bucket finding) may be incomplete; re-run as postgres')
  FROM bucket_rls WHERE rls_active
  UNION ALL
  SELECT 'G7', 'INFO', 'storage.buckets',
         concat((SELECT count(*) FROM buckets), ' buckets visible, ',
                (SELECT count(*) FROM buckets WHERE is_public), ' public')
  FROM bucket_rls WHERE rls_active IS NOT NULL

  -- G8: realtime -----------------------------------------------------
  UNION ALL
  SELECT 'G8', 'INFO', 'supabase_realtime',
         CASE WHEN EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
              THEN concat('publication supabase_realtime publishes ', (SELECT count(*) FROM rt), ' tables')
              ELSE 'publication supabase_realtime not found' END
  UNION ALL
  SELECT 'G8',
         CASE WHEN NOT (t.anon_usage OR t.auth_usage) THEN 'INFO'      -- same rule as G1: unreachable
              WHEN (t.anon_sel AND t.anon_usage) OR (t.auth_sel AND t.auth_usage)   -- Realtime streams rows: SELECT is what matters
                   THEN CASE WHEN t.exposed = 'no' THEN 'MEDIUM' ELSE 'HIGH' END
              ELSE 'MEDIUM' END,
         t.nspname || '.' || t.relname,
         concat('published to realtime with RLS DISABLED; anon SELECT=', t.anon_sel, ' authenticated SELECT=', t.auth_sel,
                ' (any privilege: anon=', t.anon_any, ' authenticated=', t.auth_any, ')',
                '; schema USAGE anon=', t.anon_usage, ' authenticated=', t.auth_usage,
                '; schema in pgrst.db_schemas: ', t.exposed,
                CASE WHEN NOT (t.anon_usage OR t.auth_usage)
                     THEN ' (no API role has schema USAGE: unreachable through the API)' ELSE '' END)
  FROM rt JOIN tbl t ON t.nspname = rt.schemaname AND t.relname = rt.tablename
  WHERE NOT t.relrowsecurity
  UNION ALL
  SELECT 'G8',
         CASE WHEN o.rt_anon_open AND o.anon_sel THEN 'HIGH'
              WHEN o.rt_auth_open AND o.auth_sel AND s.name IS NOT NULL THEN 'HIGH'
              ELSE 'REVIEW' END,
         o.nspname || '.' || o.tablename,
         concat('published to realtime and open SELECT/ALL policy ', o.policyname, ' (', o.matched_expr, ')',
                '; USING open to anon=', o.rt_anon_open, ' authenticated=', o.rt_auth_open,
                CASE WHEN o.rt_maybe_open THEN ' [POSSIBLY open: heuristic]' ELSE '' END,
                '; SELECT privilege anon=', o.anon_sel, ' authenticated=', o.auth_sel)
  FROM rt
  JOIN openpol2 o ON o.nspname = rt.schemaname AND o.tablename = rt.tablename
  LEFT JOIN sensitive s ON s.name = o.tablename
  WHERE o.cmd IN ('SELECT', 'ALL') AND (o.rt_anon_open OR o.rt_auth_open OR o.rt_maybe_open)

  -- G9: TRUNCATE / TRIGGER / REFERENCES ------------------------------
  UNION ALL
  SELECT 'G9',
         CASE WHEN r.role_name = 'anon' AND r.privs LIKE '%TRUNCATE%' THEN 'HIGH'
              WHEN r.role_name = 'anon' THEN 'MEDIUM'
              WHEN r.privs LIKE '%TRUNCATE%' THEN 'MEDIUM' ELSE 'REVIEW' END,
         t.nspname || '.' || t.relname || ' [' || r.role_name || ']',
         concat(r.role_name, ' holds ', r.privs, CASE WHEN r.privs LIKE '%TRUNCATE%'
                THEN ' (TRUNCATE bypasses RLS and empties the table)' ELSE '' END,
                '; RLS enabled=', t.relrowsecurity)
  FROM tbl t
  CROSS JOIN LATERAL (VALUES ('anon', t.anon_extra), ('authenticated', t.auth_extra)) AS r(role_name, privs)
  WHERE r.privs <> ''

  -- G10: extensions --------------------------------------------------
  UNION ALL
  SELECT 'G10', 'INFO', 'extension ' || e.extname,
         concat('version ', e.extversion, ', schema ', n.nspname,
                CASE WHEN e.extname IN ('dblink', 'pg_net', 'http', 'postgres_fdw', 'file_fdw',
                                        'plpython3u', 'plperlu', 'pltclu', 'plv8', 'pg_cron',
                                        'supabase_vault', 'pgsodium', 'wrappers')
                     THEN '; OUTBOUND-CAPABLE or PRIVILEGED: check who may call its functions (a SECURITY DEFINER wrapper or an exposed function reachable by anon/authenticated)'
                     ELSE '' END)
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
),
totals AS (   -- counts over ALL flag rows, before any display filter
  SELECT count(*)                                                         AS n_all,
         count(*) FILTER (WHERE severity = 'HIGH')                        AS n_high,
         count(*) FILTER (WHERE severity = 'MEDIUM')                      AS n_medium,
         count(*) FILTER (WHERE severity = 'REVIEW')                      AS n_review,
         count(*) FILTER (WHERE severity = 'INFO')                        AS n_info,
         (SELECT string_agg(g.check_id || '=' || g.n, ', ' ORDER BY substr(g.check_id, 2)::int)
            FROM (SELECT check_id, count(*) AS n FROM flags GROUP BY check_id) g) AS per_check
  FROM flags
),
summary AS (   -- always-present first row: how many flag rows exist per check
  SELECT 'G0'::text AS check_id, 'SUMMARY'::text AS severity, 'section 7 totals'::text AS object,
         concat('total flag rows=', t.n_all,
                ' (HIGH=', t.n_high, ', MEDIUM=', t.n_medium, ', REVIEW=', t.n_review, ', INFO=', t.n_info,
                '); rows per check: ', t.per_check,
                CASE WHEN t.n_all > 900
                     THEN '. WARNING: more than 900 rows; the SQL editor shows at most 1000, so rows may be cut off. '
                          || 'Rows are ordered HIGH first, but re-run per check: edit the line marked EDIT POINT 1 '
                          || '(for example check_id IN (''G3'')), then Run, once per check_id with rows. '
                          || 'If one check alone exceeds 900 rows, also narrow EDIT POINT 2 to one severity.'
                     ELSE '. All rows fit within the 1000-row editor cap.' END,
                ' Heuristic; read sections 2/2b/6c; not a verdict.') AS detail
  FROM totals t
),
shown AS (
  SELECT check_id, severity, object, detail,
         CASE WHEN severity = 'SUMMARY' THEN 0
              WHEN check_id = 'G0' AND severity = 'INFO' THEN 1   -- what was scanned
              WHEN severity = 'HIGH' THEN 2
              WHEN severity = 'MEDIUM' THEN 3
              WHEN severity = 'REVIEW' THEN 4
              ELSE 5 END AS sev_rank,
         count(*) OVER (PARTITION BY check_id, severity) AS check_rows
  FROM (SELECT * FROM flags UNION ALL SELECT * FROM summary) u
)
SELECT count(*) OVER ()                                          AS result_rows,
       CASE WHEN count(*) OVER () >= 900
            THEN 'WARNING: near/over the 1000-row editor cap; later rows may be cut. See the SUMMARY row, then filter per check'
       END                                                       AS warning,
       check_id, severity, object, detail
FROM shown
WHERE sev_rank = 0                                               -- the SUMMARY row is always kept
   OR ( check_id IN ('G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10')   -- EDIT POINT 1: keep only the checks you want, e.g. check_id IN ('G3')
        AND severity IN ('HIGH', 'MEDIUM', 'REVIEW', 'INFO') )                            -- EDIT POINT 2: keep only some severities, e.g. severity IN ('HIGH')
-- Order: SUMMARY row, what was scanned, then HIGH, MEDIUM, REVIEW, INFO; inside a
-- severity the checks with FEWER rows (of that severity) come first, so a rare finding (for
-- example a HIGH G3 function) is not pushed behind thousands of G9 rows.
ORDER BY sev_rank, check_rows, substr(check_id, 2)::int, object;
