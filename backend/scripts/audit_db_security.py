#!/usr/bin/env python3
"""Static database-security audit of the repository's SQL (stdlib only, read-only).

Reads supabase-schema.sql, portfolio-schema.sql and backend/migration_*.sql, replays their
statements in apply order and reports the FINAL state of every table, view and function in
the ``skillup_dev`` schema:

* tables / views that never get ``ENABLE ROW LEVEL SECURITY`` (tables only);
* tables / views that never get ``REVOKE ALL ... FROM anon, authenticated`` after their last
  GRANT (the repository has no schema-wide GRANT, so real exposure also depends on grants made
  in the Supabase dashboard, which a static scan cannot see);
* ``SECURITY DEFINER`` functions that anon / authenticated can still execute (Postgres grants
  EXECUTE to PUBLIC on creation, so a function is exposed until a ``REVOKE ... FROM PUBLIC``).

It never connects to a database and never runs SQL. ``.sql.gz`` seed transports are skipped:
they only load rows and define no tables.

Usage (from the repository root)::

    python backend/scripts/audit_db_security.py                  # table report
    python backend/scripts/audit_db_security.py --json           # machine readable
    python backend/scripts/audit_db_security.py --emit-sql       # the hardening migration body
    python backend/scripts/audit_db_security.py --strict         # exit 1 when findings remain

Order matters: a REVOKE or ENABLE ROW LEVEL SECURITY seen before a table's (re)creation does
not count, and a later GRANT undoes an earlier REVOKE. Dynamic SQL (``EXECUTE format(...)`` in
a DO block) cannot be proven statically; tables named inside such blocks are reported as
"unverified" instead of "lacking".
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

SCHEMA = "skillup_dev"
ROLES = ("anon", "authenticated", "public")
DIRECT_ROLES = ("anon", "authenticated")

# Tables the application reaches with the anon key (a client that is NOT the service role), so
# locking them down here would break a live code path. Each entry says where the access is.
# Tables that carry any CREATE POLICY are also treated as designed for direct access.
ANON_ACCESSED: dict[str, str] = {
    "users": "backend db.get_client() (main.py, routes/missing_routes.py) and src/lib/supabase.ts",
    "level_scores": "backend db.get_client() (main.py) and src/lib/supabase.ts",
    "game_states": "backend db.get_client() (main.py)",
    "posts": "backend db.get_client() (routes/missing_routes.py) and src/hooks/useCommunity.ts",
    "post_likes": "backend db.get_client() embed in the posts query (routes/missing_routes.py)",
    "post_reactions": "src/hooks/useCommunity.ts realtime subscription",
    "notifications": "src/hooks/useCommunity.ts realtime subscription",
    "dm_messages": "src/hooks/useCommunity.ts realtime subscription",
    "guilds": "src/lib/supabase.ts",
    "guild_members": "src/lib/supabase.ts",
}

_ID = r'(?:"[^"]+"|[A-Za-z_][\w$]*)'
_QNAME = rf"(?:{_ID}\s*\.\s*)?{_ID}"

TYPE_ALIASES = {
    "int": "integer", "int4": "integer", "int8": "bigint", "int2": "smallint",
    "bool": "boolean", "varchar": "character varying", "timestamptz": "timestamp with time zone",
    "timestamp": "timestamp without time zone", "float8": "double precision", "float4": "real",
    "decimal": "numeric",
}


@dataclass
class Table:
    key: str
    kind: str  # "table" | "view"
    created_in: str
    rls: bool = False
    rls_unverified: bool = False
    revoke_unverified: bool = False
    policies: int = 0
    state: dict = field(default_factory=lambda: {r: None for r in ROLES})  # revoked|granted|partial|None


@dataclass
class Function:
    key: str
    sigs: set = field(default_factory=set)
    created_in: str = ""
    definer: bool = False
    search_path: bool = False
    returns_trigger: bool = False
    public_exec: bool = True
    grants: dict = field(default_factory=lambda: {"anon": False, "authenticated": False})
    in_policy: bool = False


# ----------------------------------------------------------------------------- tokenizer
def split_statements(sql: str):
    """Yield (statement_text, line_no). Comments are removed; strings and dollar-quoted
    bodies are kept intact so a ';' inside them never splits a statement."""
    out, buf = [], []
    i, n, line = 0, len(sql), 1
    start_line = 1
    while i < n:
        c = sql[i]
        two = sql[i:i + 2]
        if two == "--":
            j = sql.find("\n", i)
            i = n if j < 0 else j
            continue
        if two == "/*":
            depth, i = 1, i + 2
            while i < n and depth:
                if sql.startswith("/*", i):
                    depth, i = depth + 1, i + 2
                elif sql.startswith("*/", i):
                    depth, i = depth - 1, i + 2
                else:
                    line += sql[i] == "\n"
                    i += 1
            buf.append(" ")
            continue
        if c == "'":
            j = i + 1
            escaped = i > 0 and sql[i - 1] in "eE" and (i < 2 or not (sql[i - 2].isalnum() or sql[i - 2] == "_"))
            while j < n:
                if escaped and sql[j] == "\\":
                    j += 2
                    continue
                if sql[j] == "'":
                    if j + 1 < n and sql[j + 1] == "'":
                        j += 2
                        continue
                    break
                j += 1
            seg = sql[i:j + 1]
            line += seg.count("\n")
            buf.append(seg)
            i = j + 1
            continue
        if c == '"':
            j = sql.find('"', i + 1)
            j = n - 1 if j < 0 else j
            seg = sql[i:j + 1]
            buf.append(seg)
            line += seg.count("\n")
            i = j + 1
            continue
        if c == "$":
            m = re.match(r"\$([A-Za-z_]\w*)?\$", sql[i:])
            if m:
                tag = m.group(0)
                j = sql.find(tag, i + len(tag))
                j = n if j < 0 else j + len(tag)
                seg = sql[i:j]
                buf.append(seg)
                line += seg.count("\n")
                i = j
                continue
        if c == ";":
            text = "".join(buf).strip()
            if text:
                out.append((text, start_line))
            buf = []
            i += 1
            start_line = line
            continue
        if c == "\n":
            line += 1
        if not buf and c.isspace():
            start_line = line + (1 if c == "\n" else 0)
        buf.append(c)
        i += 1
    text = "".join(buf).strip()
    if text:
        out.append((text, start_line))
    return out


def strip_bodies(text: str) -> str:
    return re.sub(r"(\$([A-Za-z_]\w*)?\$).*?\1", "$$BODY$$", text, flags=re.S)


def _unq(name: str):
    parts = [p.strip().strip('"') for p in re.split(r"\s*\.\s*", name.strip())]
    schema = parts[0].lower() if len(parts) == 2 else SCHEMA
    return schema, parts[-1].lower()


def _key(name: str):
    schema, obj = _unq(name)
    return f"{schema}.{obj}"


def _split_top(text: str, sep=","):
    parts, depth, cur, q = [], 0, [], None
    for ch in text:
        if q:
            cur.append(ch)
            if ch == q:
                q = None
            continue
        if ch in "'\"":
            q = ch
            cur.append(ch)
            continue
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    if "".join(cur).strip():
        parts.append("".join(cur).strip())
    return parts


_MULTIWORD = ("double precision", "character varying", "timestamp with time zone",
              "timestamp without time zone", "time with time zone", "time without time zone",
              "bit varying")


def arg_types(arglist: str):
    types = []
    for arg in _split_top(arglist):
        arg = re.sub(r"^(?:IN|OUT|INOUT|VARIADIC)\s+", "", arg.strip(), flags=re.I)
        arg = re.split(r"\s+DEFAULT\s+|\s*=\s*", arg, maxsplit=1, flags=re.I)[0].strip()
        low = re.sub(r"\s+", " ", arg.lower())
        tail = next((m for m in _MULTIWORD if low.endswith(m)), None)
        if tail:
            rest = low[: -len(tail)].strip()
            typ = tail if (not rest or " " not in rest) and len(rest.split()) <= 1 else tail
        else:
            toks = low.split(" ")
            typ = low if len(toks) == 1 else " ".join(toks[1:])
        typ = TYPE_ALIASES.get(typ, typ)
        types.append(typ)
    return tuple(types)


# ----------------------------------------------------------------------------- model
class Analysis:
    def __init__(self):
        self.tables: dict[str, Table] = {}
        self.functions: dict[str, Function] = {}
        self.default_grants_info: list[str] = []
        self.files: list[str] = []

    # -- helpers
    def _roles(self, text: str):
        return [r.lower() for r in re.split(r"\s*,\s*", text.strip().strip(";")) if r.strip().lower() in ROLES
                or r.strip().lower() == "public"]

    def _apply_table_priv(self, keys, action, privs_text, roles):
        full = bool(re.search(r"\bALL\b", privs_text, re.I)) or all(
            re.search(rf"\b{p}\b", privs_text, re.I) for p in ("SELECT", "INSERT", "UPDATE", "DELETE")
        )
        for key in keys:
            t = self.tables.get(key)
            if not t:
                continue
            for r in roles:
                if action == "grant":
                    t.state[r] = "granted"
                else:
                    t.state[r] = "revoked" if full else ("partial" if t.state[r] != "revoked" else "revoked")

    # -- statement handlers
    def feed(self, text: str, fname: str):
        head = strip_bodies(text)
        low = re.sub(r"\s+", " ", head).strip()
        up = low.upper()

        m = re.match(rf"CREATE (?:UNLOGGED )?TABLE (?:IF NOT EXISTS )?({_QNAME})", low, re.I)
        if m and not up.startswith("CREATE TEMP"):
            key = _key(m.group(1))
            if key not in self.tables:
                self.tables[key] = Table(key, "table", fname)
            return
        m = re.match(rf"CREATE (?:OR REPLACE )?(MATERIALIZED )?VIEW ({_QNAME})", low, re.I)
        if m:
            key = _key(m.group(2))
            if key not in self.tables:
                self.tables[key] = Table(key, "view", fname)
            return
        m = re.match(r"DROP (?:TABLE|VIEW|MATERIALIZED VIEW) (?:IF EXISTS )?(.+?)(?: CASCADE| RESTRICT)?$", low, re.I)
        if m:
            for nm in _split_top(m.group(1)):
                self.tables.pop(_key(nm), None)
            return
        m = re.match(rf"ALTER (?:TABLE|VIEW) (?:IF EXISTS )?(?:ONLY )?({_QNAME}) RENAME TO ({_ID})", low, re.I)
        if m:
            old = _key(m.group(1))
            t = self.tables.pop(old, None)
            if t:
                schema = _unq(m.group(1))[0]
                t.key = f"{schema}.{m.group(2).strip(chr(34)).lower()}"
                self.tables[t.key] = t
            return
        m = re.match(rf"ALTER TABLE (?:IF EXISTS )?(?:ONLY )?({_QNAME}) (.*)$", low, re.I)
        if m:
            t = self.tables.get(_key(m.group(1)))
            if t:
                if re.search(r"\b(ENABLE|FORCE) ROW LEVEL SECURITY\b", m.group(2), re.I):
                    t.rls = True
                if re.search(r"\bDISABLE ROW LEVEL SECURITY\b", m.group(2), re.I):
                    t.rls = False
            return
        m = re.match(rf"CREATE POLICY (?:{_ID}|\"[^\"]*\") ON ({_QNAME})", low, re.I)
        if m:
            t = self.tables.get(_key(m.group(1)))
            if t:
                t.policies += 1
            for fn in self.functions.values():  # functions named in a policy need EXECUTE for the caller
                if re.search(rf"\b{re.escape(fn.key.split('.')[-1])}\s*\(", low, re.I):
                    fn.in_policy = True
            return
        m = re.match(rf"CREATE (?:OR REPLACE )?FUNCTION ({_QNAME})\s*\((.*)", head, re.I | re.S)
        if m:
            key = _key(m.group(1))
            rest = m.group(2)
            depth, idx = 1, 0
            for idx, ch in enumerate(rest):
                depth += ch == "("
                depth -= ch == ")"
                if depth == 0:
                    break
            args, tail = rest[:idx], rest[idx + 1:]
            fn = self.functions.setdefault(key, Function(key, created_in=fname))
            new_sig = arg_types(args) if args.strip() else ()
            is_new = new_sig not in fn.sigs
            fn.sigs.add(new_sig)
            fn.definer = bool(re.search(r"\bSECURITY\s+DEFINER\b", tail, re.I)) or (fn.definer and not is_new)
            fn.search_path = bool(re.search(r"\bSET\s+search_path\b", tail, re.I))
            fn.returns_trigger = bool(re.search(r"\bRETURNS\s+trigger\b", tail, re.I))
            if is_new and len(fn.sigs) == 1:
                fn.public_exec = True
            return
        m = re.match(rf"DROP FUNCTION (?:IF EXISTS )?({_QNAME})\s*(?:\((.*?)\))?(?: CASCADE| RESTRICT)?$", low, re.I)
        if m:
            fn = self.functions.get(_key(m.group(1)))
            if fn:
                if m.group(2) is not None and m.group(2).strip():
                    fn.sigs.discard(arg_types(m.group(2)))
                elif m.group(2) is not None:
                    fn.sigs.discard(())
                else:
                    fn.sigs.clear()
                if not fn.sigs:
                    self.functions.pop(fn.key, None)
            return
        m = re.match(rf"ALTER FUNCTION ({_QNAME})\s*(?:\(.*?\))?\s+(?:SECURITY DEFINER|SECURITY INVOKER)", low, re.I)
        if m and self.functions.get(_key(m.group(1))):
            self.functions[_key(m.group(1))].definer = "SECURITY DEFINER" in up
            return
        m = re.match(r"ALTER DEFAULT PRIVILEGES (.*)$", low, re.I)
        if m:
            self.default_grants_info.append(f"{fname}: {m.group(1)[:160]}")
            return
        m = re.match(r"(REVOKE|GRANT) (.+?) ON (.+?) (FROM|TO) (.+)$", low, re.I)
        if m:
            action = m.group(1).lower()
            privs, target, roles_txt = m.group(2), m.group(3), m.group(5)
            roles = self._roles(re.sub(r"\s+WITH GRANT OPTION.*$|\s+CASCADE$|\s+RESTRICT$", "", roles_txt, flags=re.I))
            if not roles:
                return
            tu = target.upper()
            if tu.startswith("ALL TABLES IN SCHEMA"):
                schema = target[len("ALL TABLES IN SCHEMA"):].strip().strip('"').lower()
                keys = [k for k, t in self.tables.items() if k.startswith(schema + ".")]
                self._apply_table_priv(keys, "grant" if action == "grant" else "revoke", privs, roles)
                return
            if tu.startswith("ALL FUNCTIONS IN SCHEMA"):
                schema = target[len("ALL FUNCTIONS IN SCHEMA"):].strip().strip('"').lower()
                for fn in self.functions.values():
                    if fn.key.startswith(schema + "."):
                        self._function_priv(fn, action, privs, roles)
                return
            if tu.startswith("FUNCTION"):
                body = target[len("FUNCTION"):].strip()
                for item in _split_top(body):
                    mm = re.match(rf"({_QNAME})\s*(?:\((.*)\))?$", item.strip(), re.I)
                    if not mm:
                        continue
                    fn = self.functions.get(_key(mm.group(1)))
                    if fn:
                        self._function_priv(fn, action, privs, roles)
                return
            if re.match(r"(SEQUENCE|SCHEMA|DATABASE|ALL SEQUENCES|LANGUAGE|TYPE|DOMAIN|FOREIGN)", tu):
                return
            body = re.sub(r"^TABLE\s+", "", target, flags=re.I)
            keys = [_key(x) for x in _split_top(body)]
            self._apply_table_priv(keys, "grant" if action == "grant" else "revoke", privs, roles)
            return
        if up.startswith("DO "):
            self._dynamic(text)

    def _function_priv(self, fn: Function, action, privs, roles):
        executes = bool(re.search(r"\b(ALL|EXECUTE)\b", privs, re.I))
        if not executes:
            return
        for r in roles:
            if action == "revoke":
                if r == "public":
                    fn.public_exec = False
                elif r in fn.grants:
                    fn.grants[r] = False
            else:
                if r == "public":
                    fn.public_exec = True
                elif r in fn.grants:
                    fn.grants[r] = True

    def _dynamic(self, text: str):
        """DO blocks. One shape is recognised as proof: a loop over a literal ``ARRAY['a','b']``
        whose body runs ``format('ALTER TABLE ... ENABLE ROW LEVEL SECURITY ...')``,
        ``format('REVOKE ALL ON TABLE ... FROM <roles>')`` or
        ``format('REVOKE ALL ON FUNCTION %s FROM <roles>')``. Every other DO block that merely
        mentions RLS or REVOKE leaves the tables it names "unverified" rather than "lacking"."""
        has_rls = bool(re.search(r"ROW LEVEL SECURITY", text, re.I))
        has_rev = bool(re.search(r"\bREVOKE\b", text, re.I))
        if not (has_rls or has_rev):
            return
        arrays = re.findall(r"ARRAY\s*\[(.*?)\]", text, re.I | re.S)
        names = {n.lower() for a in arrays for n in re.findall(r"'([A-Za-z_][\w]*)'", a)}
        loops = bool(re.search(r"\bLOOP\b", text, re.I)) and "format(" in text.lower()
        proven_tables = set()
        if names and loops:
            enables = bool(re.search(r"ALTER\s+TABLE\s+[\w.%]+\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY", text, re.I))
            tab_rev = re.search(r"REVOKE\s+ALL\s+ON\s+TABLE\s+[\w.%]+\s+FROM\s+([a-z_,\s]+?)'", text, re.I)
            fn_rev = re.search(r"REVOKE\s+ALL\s+ON\s+FUNCTION\s+%s\s+FROM\s+([a-z_,\s]+?)'", text, re.I)
            for name in names:
                t = self.tables.get(f"{SCHEMA}.{name}")
                if t:
                    if enables and t.kind == "table":
                        t.rls = True
                        proven_tables.add(t.key)
                    if tab_rev:
                        for r in self._roles(tab_rev.group(1)):
                            t.state[r] = "revoked"
                        proven_tables.add(t.key)
                fn = self.functions.get(f"{SCHEMA}.{name}")
                if fn and fn_rev:
                    self._function_priv(fn, "revoke", "ALL", self._roles(fn_rev.group(1)))
        literals = set(re.findall(r"'([A-Za-z_][\w.]*)'", text)) | set(re.findall(r"\b([a-z_][a-z0-9_]*)\b", text.lower()))
        for key, t in self.tables.items():
            name = key.split(".")[-1]
            if key in proven_tables:
                continue
            if name in literals or key in literals:
                if has_rls and not t.rls:
                    t.rls_unverified = True
                if has_rev and t.state["anon"] != "revoked":
                    t.revoke_unverified = True

    # -- loading
    def load(self, paths):
        for p in paths:
            self.files.append(str(p))
            for stmt, _line in split_statements(Path(p).read_text(encoding="utf-8", errors="replace")):
                self.feed(stmt, Path(p).name)
        return self

    # -- results
    @staticmethod
    def _excluded_reason(name: str, t: Table):
        if name in ANON_ACCESSED:
            return ANON_ACCESSED[name]
        if t.policies:
            return f"has {t.policies} CREATE POLICY statement(s): designed for direct access"
        return None

    def result(self):
        schema_tables = {k: t for k, t in self.tables.items() if k.startswith(SCHEMA + ".")}
        lacking_rls, unverified_rls, lacking_revoke, unverified_revoke, excluded = [], [], [], [], {}
        for key, t in sorted(schema_tables.items()):
            name = key.split(".", 1)[1]
            reason = self._excluded_reason(name, t)
            revoked = all(t.state[r] == "revoked" for r in DIRECT_ROLES)
            if reason and (not t.rls or not revoked):
                excluded[name] = reason
                continue
            if t.kind == "table" and not t.rls:
                (unverified_rls if t.rls_unverified else lacking_rls).append(name)
            if not revoked:
                (unverified_revoke if t.revoke_unverified else lacking_revoke).append(name)
        exposed_fns = []
        for key, fn in sorted(self.functions.items()):
            if not key.startswith(SCHEMA + ".") or not fn.definer:
                continue
            if fn.public_exec or any(fn.grants.values()):
                exposed_fns.append({
                    "name": key.split(".", 1)[1], "defined_in": fn.created_in,
                    "search_path_set": fn.search_path, "returns_trigger": fn.returns_trigger,
                    "used_in_policy": fn.in_policy,
                })
        return {
            "schema": SCHEMA,
            "files_scanned": len(self.files),
            "tables": sum(1 for t in schema_tables.values() if t.kind == "table"),
            "views": sum(1 for t in schema_tables.values() if t.kind == "view"),
            "functions_security_definer": sum(1 for k, f in self.functions.items() if k.startswith(SCHEMA + ".") and f.definer),
            "tables_without_rls": lacking_rls,
            "tables_rls_unverified_dynamic_sql": unverified_rls,
            "relations_without_revoke_anon_authenticated": lacking_revoke,
            "relations_revoke_unverified_dynamic_sql": unverified_revoke,
            "excluded_direct_access": excluded,
            "security_definer_functions_executable_by_anon": exposed_fns,
            "default_privilege_statements": self.default_grants_info,
        }


# ----------------------------------------------------------------------------- inputs
def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


# Scripts that are never applied forward: an undo script and a superseded migration that
# CLAUDE.md says must never be run. Replaying them would erase or invent objects.
NON_FORWARD = {"migration_v2_down.sql", "migration_career_intelligence.sql"}


def ordered_files(root: Path, exclude=()):
    """Apply order: base schemas, then manifest-ordered migrations, then the rest by name."""
    skip = set(exclude) | NON_FORWARD
    files = [root / n for n in ("supabase-schema.sql", "portfolio-schema.sql") if (root / n).exists()]
    backend = root / "backend"
    ordered = []
    manifest = backend / "migrate" / "manifest.toml"
    if manifest.exists():
        try:
            import tomllib
            data = tomllib.loads(manifest.read_text(encoding="utf-8"))
            ordered = [backend / e["path"] for e in data.get("entry", []) if str(e.get("path", "")).endswith(".sql")]
        except Exception:  # unreadable manifest: fall back to name order
            ordered = []
    rest = sorted(set(backend.glob("migration_*.sql")) - set(ordered))
    seen = set(files)
    for p in ordered + rest:
        if p.exists() and p not in seen and p.name not in skip and not p.name.endswith("_down.sql"):
            files.append(p)
            seen.add(p)
    # Convention: hardening migrations are applied after everything else (they only act on
    # objects that already exist), so they are replayed last even though unordered files
    # (migration_v2_*.sql) sort after them in the manifest.
    files = [p for p in files if p.name not in skip]
    last = [p for p in files if p.name.startswith("migration_security_hardening_")]
    return [p for p in files if p not in last] + sorted(last)


def analyze(root: Path | None = None, exclude=()):
    root = root or repo_root()
    return Analysis().load(ordered_files(root, exclude))


# ----------------------------------------------------------------------------- SQL emit
def emit_sql(res: dict) -> str:
    fns = sorted({f["name"] for f in res["security_definer_functions_executable_by_anon"]
                  if not f["used_in_policy"]})
    tables = sorted(set(res["tables_without_rls"]))
    revoke_only = sorted(set(res["relations_without_revoke_anon_authenticated"]) - set(tables))
    q = lambda xs: ",\n        ".join(f"'{x}'" for x in xs)  # noqa: E731
    parts = [
        "-- Part 1. SECURITY DEFINER functions: only the service role may call them.\n"
        "-- Postgres grants EXECUTE to PUBLIC on creation, which anon and authenticated inherit.\n"
        "-- Matches by name in pg_proc so overloads are covered and absent functions are skipped.\n"
        "DO $$\nDECLARE\n    r record;\nBEGIN\n"
        "    FOR r IN\n        SELECT p.oid::regprocedure AS sig\n        FROM pg_proc p\n"
        "        JOIN pg_namespace n ON n.oid = p.pronamespace\n"
        "        WHERE n.nspname = 'skillup_dev'\n          AND p.prosecdef\n"
        "          AND p.proname = ANY (ARRAY[\n        " + q(fns) + "\n        ])\n    LOOP\n"
        "        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);\n"
        "        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);\n"
        "    END LOOP;\nEND\n$$;\n",
        "-- Part 2. Tables with no row-level security: enable it (default deny) and close direct\n"
        "-- access. The backend uses the service-role client, which bypasses RLS.\n"
        "DO $$\nDECLARE\n    t text;\nBEGIN\n    FOREACH t IN ARRAY ARRAY[\n        " + q(tables) + "\n    ]\n    LOOP\n"
        "        IF to_regclass('skillup_dev.' || quote_ident(t)) IS NOT NULL THEN\n"
        "            EXECUTE format('ALTER TABLE skillup_dev.%I ENABLE ROW LEVEL SECURITY', t);\n"
        "            EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t);\n"
        "        END IF;\n    END LOOP;\nEND\n$$;\n",
        "-- Part 3. Relations that already have RLS (or are views) but never revoke direct access.\n"
        "DO $$\nDECLARE\n    t text;\nBEGIN\n    FOREACH t IN ARRAY ARRAY[\n        " + q(revoke_only) + "\n    ]\n    LOOP\n"
        "        IF to_regclass('skillup_dev.' || quote_ident(t)) IS NOT NULL THEN\n"
        "            EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t);\n"
        "        END IF;\n    END LOOP;\nEND\n$$;\n",
    ]
    # An empty list must still be a typed array, or the DO block fails to compile.
    return re.sub(r"ARRAY\[\s*\]", "ARRAY[]::text[]", "\n".join(parts))


def render_table(res: dict) -> str:
    lines = [
        f"schema {res['schema']}: {res['tables']} tables, {res['views']} views, "
        f"{res['functions_security_definer']} SECURITY DEFINER functions; {res['files_scanned']} SQL files scanned",
        "",
        f"tables without ROW LEVEL SECURITY: {len(res['tables_without_rls'])}",
    ]
    lines += [f"  - {x}" for x in res["tables_without_rls"]]
    lines += ["", f"relations without REVOKE for anon/authenticated: {len(res['relations_without_revoke_anon_authenticated'])}"]
    lines += [f"  - {x}" for x in res["relations_without_revoke_anon_authenticated"]]
    lines += ["", f"SECURITY DEFINER functions executable by anon/authenticated: {len(res['security_definer_functions_executable_by_anon'])}"]
    lines += [f"  - {f['name']}  (defined in {f['defined_in']}, search_path set: {f['search_path_set']})"
              for f in res["security_definer_functions_executable_by_anon"]]
    lines += ["", f"excluded (reached with the anon key or carrying policies): {len(res['excluded_direct_access'])}"]
    lines += [f"  - {k}: {v}" for k, v in res["excluded_direct_access"].items()]
    if res["tables_rls_unverified_dynamic_sql"] or res["relations_revoke_unverified_dynamic_sql"]:
        lines += ["", "unverified (named inside dynamic SQL, cannot be proven statically):"]
        lines += [f"  - rls: {x}" for x in res["tables_rls_unverified_dynamic_sql"]]
        lines += [f"  - revoke: {x}" for x in res["relations_revoke_unverified_dynamic_sql"]]
    return "\n".join(lines)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--emit-sql", action="store_true", help="print the migration body for the current findings")
    ap.add_argument("--strict", action="store_true", help="exit 1 if any finding remains")
    ap.add_argument("--exclude", action="append", default=[], help="SQL file name to leave out of the scan")
    ap.add_argument("--root", default=None, help="repository root (default: the checkout containing this script)")
    args = ap.parse_args(argv)
    res = analyze(Path(args.root) if args.root else None, exclude=tuple(args.exclude)).result()
    if args.emit_sql:
        print(emit_sql(res))
    elif args.json:
        print(json.dumps(res, indent=2, sort_keys=True))
    else:
        print(render_table(res))
    bad = (res["tables_without_rls"] or res["relations_without_revoke_anon_authenticated"]
           or [f for f in res["security_definer_functions_executable_by_anon"] if not f["used_in_policy"]])
    return 1 if (args.strict and bad) else 0


if __name__ == "__main__":
    sys.exit(main())
