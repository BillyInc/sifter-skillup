"""SQL lint detections on small synthetic strings (no database)."""

import gzip

from migrate import lint


def test_explicit_transaction_detected():
    result = lint.analyse_sql(
        "BEGIN;\nCREATE TABLE IF NOT EXISTS t (id int);\nCOMMIT;\n"
    )
    assert (
        result.explicit_transaction
        and result.begin_count == 1
        and result.commit_count == 1
    )


def test_begin_inside_do_block_is_not_a_transaction():
    sql = "DO $$\nBEGIN\n  PERFORM 1;\nEND $$;\n"
    result = lint.analyse_sql(sql)
    assert result.begin_count == 0 and not result.explicit_transaction


def test_begin_in_comment_or_string_is_ignored():
    sql = "-- BEGIN;\n/* BEGIN;\nCOMMIT; */\nSELECT 'BEGIN;\nCOMMIT;';\n"
    result = lint.analyse_sql(sql)
    assert result.begin_count == 0 and result.commit_count == 0


def test_missing_commit_is_not_explicit():
    assert not lint.analyse_sql("BEGIN;\nSELECT 1;\n").explicit_transaction


def test_multiple_transaction_blocks_counted():
    result = lint.analyse_sql(
        "BEGIN;\nSELECT 1;\nCOMMIT;\nBEGIN;\nSELECT 2;\nCOMMIT;\n"
    )
    assert result.begin_count == 2 and result.explicit_transaction


def test_destructive_statements_detected():
    sql = (
        "DROP TABLE IF EXISTS a;\nALTER TABLE b DROP COLUMN c;\nTRUNCATE t;\n"
        "DELETE FROM x;\nDROP SCHEMA s CASCADE;\n"
    )
    result = lint.analyse_sql(sql)
    assert (result.drop_table, result.drop_column, result.truncate) == (1, 1, 1)
    assert (
        result.delete_without_where == 1
        and result.drop_schema == 1
        and result.destructive
    )


def test_delete_with_where_is_not_flagged():
    result = lint.analyse_sql(
        "DELETE FROM x WHERE id = 1;\nDELETE FROM y\n USING z WHERE y.id = z.id;\n"
    )
    assert result.delete_without_where == 0 and not result.destructive


def test_destructive_words_in_comments_and_strings_are_ignored():
    sql = "-- DROP TABLE a;\nSELECT 'TRUNCATE t; DELETE FROM x;';\nCREATE TABLE IF NOT EXISTS ok (id int);\n"
    result = lint.analyse_sql(sql)
    assert not result.destructive


def test_on_delete_cascade_and_date_trunc_are_not_destructive():
    sql = "CREATE TABLE IF NOT EXISTS c (a int REFERENCES p ON DELETE CASCADE);\nSELECT date_trunc('day', now());\n"
    assert not lint.analyse_sql(sql).destructive


def test_destructive_inside_do_block_is_found():
    sql = "DO $$\nBEGIN\n  DROP TABLE legacy;\nEND $$;\n"
    assert lint.analyse_sql(sql).drop_table == 1


def test_idempotence_hints():
    assert lint.analyse_sql(
        "CREATE TABLE IF NOT EXISTS t (id int);"
    ).has_idempotence_hint
    assert lint.analyse_sql(
        "CREATE OR REPLACE VIEW v AS SELECT 1;"
    ).has_idempotence_hint
    assert lint.analyse_sql(
        "INSERT INTO t VALUES (1) ON CONFLICT DO NOTHING;"
    ).has_idempotence_hint
    assert lint.analyse_sql("DROP INDEX IF EXISTS i;").has_idempotence_hint
    bare = lint.analyse_sql("CREATE TABLE t (id int);\nINSERT INTO t VALUES (1);\n")
    assert not bare.has_idempotence_hint


def test_rls_mentions():
    without = lint.analyse_sql("CREATE TABLE a (id int);\nCREATE TABLE b (id int);")
    assert without.tables_created == 2 and without.creates_tables_without_rls
    with_rls = lint.analyse_sql(
        "CREATE TABLE a (id int);\nALTER TABLE a ENABLE ROW LEVEL SECURITY;"
    )
    assert not with_rls.creates_tables_without_rls
    with_policy = lint.analyse_sql(
        "CREATE TABLE a (id int);\nCREATE POLICY p ON a FOR SELECT USING (true);"
    )
    assert with_policy.mentions_rls
    assert not lint.analyse_sql(
        "ALTER TABLE a ADD COLUMN b int;"
    ).creates_tables_without_rls


def test_tagged_dollar_quote_and_nested_quotes():
    sql = "CREATE FUNCTION f() RETURNS void AS $fn$ BEGIN PERFORM 'it''s'; END $fn$ LANGUAGE plpgsql;\nBEGIN;\nCOMMIT;\n"
    result = lint.analyse_sql(sql)
    assert result.begin_count == 1 and result.explicit_transaction


def test_lint_file_checksum_is_over_decompressed_bytes_and_flags_counterpart(tmp_path):
    body = b"BEGIN;\nCREATE TABLE IF NOT EXISTS t (id int);\nCOMMIT;\n"
    (tmp_path / "migration_a.sql").write_bytes(body)
    with gzip.open(tmp_path / "migration_a.sql.gz", "wb") as handle:
        handle.write(body)
    report = lint.lint_file(tmp_path / "migration_a.sql", tmp_path)
    gz_report = lint.lint_file(tmp_path / "migration_a.sql.gz", tmp_path)
    assert report.sha256 == gz_report.sha256
    assert report.counterpart == "match"
    assert report.role == "migration" and report.analysis.explicit_transaction

    with gzip.open(tmp_path / "migration_a.sql.gz", "wb") as handle:
        handle.write(body.replace(b"\n", b"\r\n"))
    assert (
        lint.lint_file(tmp_path / "migration_a.sql", tmp_path).counterpart
        == "crlf-only"
    )
    with gzip.open(tmp_path / "migration_a.sql.gz", "wb") as handle:
        handle.write(b"SELECT 2;\n")
    assert (
        lint.lint_file(tmp_path / "migration_a.sql", tmp_path).counterpart == "MISMATCH"
    )


def test_oversized_file_is_hashed_but_not_analysed(tmp_path):
    (tmp_path / "seed_big.sql").write_bytes(b"SELECT 1;\n" * 100)
    report = lint.lint_file(tmp_path / "seed_big.sql", tmp_path, max_bytes=50)
    assert not report.analysed and report.analysis is None and len(report.sha256) == 64


def test_report_summary_and_outputs(tmp_path):
    (tmp_path / "migration_ok.sql").write_text(
        "BEGIN;\nCREATE TABLE IF NOT EXISTS t (id int);\nCOMMIT;\n"
    )
    (tmp_path / "migration_bad.sql").write_text(
        "DROP TABLE t;\nCREATE TABLE u (id int);\n"
    )
    files = [tmp_path / "migration_bad.sql", tmp_path / "migration_ok.sql"]
    report = lint.build_report(files, tmp_path)
    summary = report["summary"]["migration"]
    assert summary["files"] == 2
    assert summary["without_explicit_transaction"] == 1
    assert summary["destructive"] == 1
    assert summary["without_idempotence_hint"] == 1
    assert '"migration_bad.sql"' in lint.to_json(report)
    table = lint.format_table(report)
    assert "migration_bad.sql" in table and "DT1" in table
