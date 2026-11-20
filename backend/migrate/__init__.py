"""Migration system.

Phase 1 (plan, lint, manifest, checksums) never connects to a database. Phase 2
adds ``status`` and ``apply``, which do, through the ``Executor`` seam in
``executor.py``; the database URL is read only from the environment, never from
a command-line argument, and ``apply`` is a dry run unless ``--apply`` is given.
See ``README.md``.
"""
