"""Guards against the REAL repository manifest.

``test_every_migration_is_registered`` is the guard that a new
``backend/migration_*.sql`` (or seed/patch file) cannot be forgotten: it must be
added to ``backend/migrate/manifest.toml`` as an ordered entry or, when its
order is not documented, as an ``[[unordered]]`` item with a reason.
"""

import re
from pathlib import Path

from migrate import cli, lint
from migrate import manifest as mf
from migrate import sqlio

BACKEND = Path(__file__).resolve().parents[1]
MANIFEST = BACKEND / "migrate" / "manifest.toml"


def test_real_manifest_verifies():
    issues = [
        i
        for i in mf.validate(mf.load_manifest(MANIFEST), BACKEND)
        if i.severity
        == "error"  # warnings (UNRESOLVED_DEPENDENCY) are reported, not fatal
    ]
    assert issues == [], "\n".join(str(i) for i in issues)


def test_verify_manifest_cli_succeeds_on_the_real_repo(capsys):
    assert cli.main(["verify-manifest"]) == 0
    assert "0 errors" in capsys.readouterr().out


def test_every_migration_is_registered():
    manifest = mf.load_manifest(MANIFEST)
    registered: set[str] = set()
    for entry in manifest.entries:
        registered |= mf._covered_keys(entry.path or entry.parts_glob or "")
    for item in manifest.unordered:
        registered |= mf._covered_keys(item.path)
    on_disk = {path.name for path in BACKEND.glob("migration_*.sql")}
    forgotten = sorted(name for name in on_disk if sqlio.stem(name) not in registered)
    assert forgotten == [], (
        f"register these in backend/migrate/manifest.toml: {forgotten}"
    )


def test_career_v2_is_never_automatic_and_replacement_seeds_are_destructive():
    by_id = {entry.id: entry for entry in mf.load_manifest(MANIFEST).entries}
    career_v2 = by_id["migration_career_v2"]
    assert career_v2.kind == "rebuild" and career_v2.manual_only and career_v2.approval
    assert by_id["seed_subject_options"].kind == "destructive"


def test_contextual_parts_group_is_the_documented_35():
    group = next(
        e
        for e in mf.load_manifest(MANIFEST).entries
        if e.id == "seed_career_context_items_v1_parts"
    )
    assert group.is_group and group.expected_parts == 35
    assert len(mf.entry_files(group, BACKEND)) == 35


def test_documented_orderings_hold():
    ids = [e.id for e in mf.load_manifest(MANIFEST).entries]
    before = lambda a, b: ids.index(a) < ids.index(b)  # noqa: E731
    assert before("migration_subject_catalog", "migration_career_pilot")
    assert before(
        "migration_school_subject_pass_conditions_2026-10-24", "seed_career_pilot"
    )
    assert before("seed_subject_rule_records", "seed_subject_options")
    # runbook: the domain-guidance seed UPDATEs a row the 35 contextual parts create.
    assert before(
        "seed_career_context_items_v1_parts",
        "seed_sociology_domain_guidance_2026-10-08",
    )
    assert before(
        "seed_d078_guided_content_2026-10-12",
        "seed_d078_role_item_contracts_2026-10-15",
    )
    assert before(
        "seed_d078_role_item_contracts_2026-10-15", "seed_d078_role_tools_2026-10-16"
    )


# --- hardening guards --------------------------------------------------------

# Entries the linter calls destructive that a human still has to classify. Do NOT add
# to this set to silence a new finding: give the entry `kind = "destructive"` (with
# approval/manual_only) or an `allow_destructive_reason` in the manifest. Entries here
# must be resolved by a human and then removed. Empty since 2026-11-20: the curriculum
# contract's DROP CONSTRAINT was decided as intentional (see its manifest entry).
NEEDS_HUMAN_TRIAGE: set[str] = set()


def test_lint_destructive_entries_are_classified_or_justified():
    conflicts = {
        c.entry_id: c for c in lint.kind_conflicts(mf.load_manifest(MANIFEST), BACKEND)
    }
    unexpected = sorted(set(conflicts) - NEEDS_HUMAN_TRIAGE)
    assert unexpected == [], (
        "linter reports destructive SQL in schema/seed entries; set kind = "
        '"destructive" (+ approval) or add allow_destructive_reason:\n'
        + "\n".join(str(conflicts[i]) for i in unexpected)
    )
    stale = sorted(NEEDS_HUMAN_TRIAGE - set(conflicts))
    assert stale == [], f"no longer flagged, remove from NEEDS_HUMAN_TRIAGE: {stale}"


def test_allow_destructive_reason_only_where_the_sql_is_flagged():
    for entry in mf.load_manifest(MANIFEST).entries:
        if not entry.allow_destructive_reason:
            continue
        found = False
        for path in mf.entry_files(entry, BACKEND):
            analysis = lint.lint_file(path, BACKEND).analysis
            found = found or bool(analysis and analysis.destructive)
        assert found, f"{entry.id} has a reason but its SQL is not flagged: remove it"
        assert entry.kind != "destructive"


_CREATE = re.compile(
    r"\bCREATE\s+(?:UNLOGGED\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([\w.\"]+)", re.I
)
_USE = re.compile(
    r"\b(?:ALTER\s+TABLE(?:\s+IF\s+EXISTS)?(?:\s+ONLY)?|INSERT\s+INTO|REFERENCES|UPDATE"
    r"|DELETE\s+FROM)\s+([\w.\"]+)",
    re.I,
)


def _table(name):
    return name.replace('"', "").lower().split(".")[-1]


def test_requires_covers_every_table_another_ordered_entry_creates():
    """If entry X ALTERs/INSERTs into/REFERENCES a table that an *earlier ordered*
    entry CREATEs, that entry must be in X's transitive `requires`. Dependencies on
    unordered or later files belong in `external_requires`, not here."""
    manifest = mf.load_manifest(MANIFEST)
    created: dict[str, list[str]] = {}
    used: dict[str, dict[str, str]] = {}
    for entry in manifest.entries:
        if entry.is_group:
            continue  # data parts only
        creates: set[str] = set()
        uses: dict[str, str] = {}
        for path in mf.entry_files(entry, BACKEND):
            raw = sqlio.read_bytes(path).decode("utf-8", "replace")
            text = lint.strip_sql(raw, True)
            creates |= {_table(m.group(1)) for m in _CREATE.finditer(text)}
            for m in _USE.finditer(text):
                uses.setdefault(_table(m.group(1)), m.group(0).strip())
        used[entry.id] = {t: sql for t, sql in uses.items() if t not in creates}
        for table in creates:
            created.setdefault(table, []).append(entry.id)

    by_id = {e.id: e for e in manifest.entries}
    position = {e.id: n for n, e in enumerate(manifest.entries)}

    def closure(entry_id, seen=None):
        seen = set() if seen is None else seen
        for dep in by_id[entry_id].requires:
            if dep not in seen:
                seen.add(dep)
                closure(dep, seen)
        return seen

    missing = []
    for entry_id, uses in used.items():
        deps = closure(entry_id)
        for table, sql in uses.items():
            providers = [
                p for p in created.get(table, []) if position[p] < position[entry_id]
            ]
            if providers and not deps.intersection(providers):
                missing.append(f"{entry_id}: '{sql}' needs one of {providers}")
    assert missing == [], "add requires edges (cite the SQL line):\n" + "\n".join(
        missing
    )


def test_student_pipeline_live_reports_its_unordered_and_later_dependencies():
    manifest = mf.load_manifest(MANIFEST)
    entry = next(
        e for e in manifest.entries if e.id == "migration_student_pipeline_live"
    )
    refs = {ext.ref for ext in entry.external_requires}
    assert refs == {"migration_admission_intelligence.sql", "migration_career_v2"}
    messages = [
        i.message
        for i in mf.validate(manifest, BACKEND)
        if i.code == "UNRESOLVED_DEPENDENCY"
        and i.message.startswith("migration_student_pipeline_live ")
    ]
    assert len(messages) == 2


NEW_2026_11_ORDER = [
    "migration_display_name_2026-11-19",
    "migration_avatars_bucket_2026-11-19",
    "migration_my_world_collections_2026-11-19",
    "migration_student_subject_grade_sets_2026-11-19",
    "migration_learning_interest_analytics_2026-10-26",
    "migration_learning_interest_current_selections_2026-10-28",
]


def test_the_six_newer_migrations_are_ordered_with_their_proven_dependencies():
    manifest = mf.load_manifest(MANIFEST)
    ids = [e.id for e in manifest.entries]
    by_id = {e.id: e for e in manifest.entries}
    positions = [ids.index(i) for i in NEW_2026_11_ORDER]
    assert positions == sorted(positions)
    unordered = {u.path for u in manifest.unordered}
    for entry_id in NEW_2026_11_ORDER:
        assert by_id[entry_id].path not in unordered
        assert by_id[entry_id].kind == "schema"
    assert "migration_career_v2" in by_id[NEW_2026_11_ORDER[2]].requires
    assert "migration_student_pipeline_live" in by_id[NEW_2026_11_ORDER[3]].requires
    assert NEW_2026_11_ORDER[4] in by_id[NEW_2026_11_ORDER[5]].requires
    analytics_refs = {x.ref for x in by_id[NEW_2026_11_ORDER[4]].external_requires}
    assert analytics_refs == {"migration_provisioning.sql", "migration_school_identity.sql"}
    selections_refs = {x.ref for x in by_id[NEW_2026_11_ORDER[5]].external_requires}
    assert selections_refs == {"migration_account_lifecycle_patch.sql"}
    assert "pg_cron" in by_id[NEW_2026_11_ORDER[4]].note


def test_the_curriculum_contract_constraint_drop_is_recorded_as_a_decision():
    entry = next(
        e
        for e in mf.load_manifest(MANIFEST).entries
        if e.id == "migration_programme_curriculum_contract_general_2026-09-18"
    )
    assert entry.allow_destructive_reason
    waivers = {w.code: w.reason for w in entry.lint_waivers}
    assert set(waivers) == {"DROP_CONSTRAINT_NOT_READDED"}
    assert "must NOT be re-added" in waivers["DROP_CONSTRAINT_NOT_READDED"]
    assert "OWNER TRIAGE PENDING" not in waivers["DROP_CONSTRAINT_NOT_READDED"]


def test_proven_requires_edges_from_the_review_are_present():
    by_id = {e.id: e for e in mf.load_manifest(MANIFEST).entries}
    path_targets = by_id["migration_career_context_path_targets"].requires
    assert "migration_contextual_career_items" in path_targets
    tool_path = by_id["migration_sociology_domain_tool_path_2026-09-18"].requires
    assert "migration_career_item_relationships_2026-09-17" in tool_path
    assert "migration_career_resources_v1" in tool_path
    guided = by_id["seed_d078_guided_content_2026-10-12"].requires
    assert "migration_career_context_claim_validation" in guided
