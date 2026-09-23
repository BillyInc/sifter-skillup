"""Claim tranche 023 through the shared lock-backed selector."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "023"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
