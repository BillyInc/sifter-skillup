"""Phase 1 of the migration system: static tooling only.

Nothing in this package connects to a database or executes SQL. It reads
migration/seed files, validates an explicit manifest, lints the SQL text and
prints what *would* run. See ``README.md``.
"""
