"""Run the ICT evidence search against the collision-free 018b artifacts."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("tranche018_search_impl", HERE / "full_population_tranche_018_search.py")
assert spec and spec.loader
wrapper = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = wrapper
spec.loader.exec_module(wrapper)

impl = wrapper.module
impl.TRANCHE = "018b"
impl.SELECTION = HERE / "full_population_tranche_018b_selection_2026-09-21.json"
impl.CHECKPOINT = HERE / "full_population_tranche_018b_checkpoint_2026-09-21.json"
impl.LEDGER = HERE / "full_population_tranche_018b_search_ledger_2026-09-21.jsonl"
impl.REPORT_JSON = HERE / "full_population_tranche_018b_report_2026-09-21.json"
impl.REPORT_MD = HERE / "full_population_tranche_018b_report_2026-09-21.md"
impl.main()
