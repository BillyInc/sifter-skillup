"""Claim tranche 020 through the shared lock-aware item selector."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "020"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
