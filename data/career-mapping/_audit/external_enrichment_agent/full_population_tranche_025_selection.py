"""Claim tranche 025 through the shared lock-aware selector."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "025"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
