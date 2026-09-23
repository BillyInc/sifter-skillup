"""Select tranche 019 after rereading the queue and all claimed item ledgers."""

import os
import runpy


os.environ["ITEM_TRANCHE"] = "019"
runpy.run_path(
    os.path.join(os.path.dirname(__file__), "full_population_tranche_017_selection.py"),
    run_name="__main__",
)
