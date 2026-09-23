"""Run the deterministic selector for tranche 018 with a pre-search checkpoint."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "018"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
