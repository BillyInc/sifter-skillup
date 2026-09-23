"""Claim tranche 022 through the shared serialized item selector."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "022"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
