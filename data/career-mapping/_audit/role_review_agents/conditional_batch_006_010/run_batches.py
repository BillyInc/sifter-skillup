"""Run the shared conservative conditional-role worker for batches 006-010."""

from __future__ import annotations

import importlib.util
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
WORKER = ROOT / "data" / "career-mapping" / "_audit" / "role_review_agents" / "conditional_batch_001_005" / "review_conditional_batches.py"

spec = importlib.util.spec_from_file_location("conditional_worker", WORKER)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Cannot load shared worker: {WORKER}")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.INPUT_BATCHES = tuple(
    module.QUEUE / f"batch-{n:03d}.json" for n in range(6, 11)
)
module.OUT = HERE
module.main()
