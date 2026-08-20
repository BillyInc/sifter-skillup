"""Small shared loader for source-backed programme-domain audit scripts."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "career-mapping"


def load_mapping_inputs():
    sys.path.insert(0, str(DATA))
    import _build_programme_domain_evidence as evidence  # type: ignore

    mapping = json.loads((DATA / "programme_domain_final.json").read_text(encoding="utf-8"))
    meta = json.loads((DATA / "domain_meta.json").read_text(encoding="utf-8"))
    structure = json.loads((DATA / "domain_structure.json").read_text(encoding="utf-8"))
    programmes, source_files = evidence.load_programmes()

    def anchor_phrases(domain_id, domain, domain_structure):
        phrases = list(evidence.EXTRA_ANCHORS.get(domain_id, []))
        phrases.extend(
            [
                domain.get("domain_name", ""),
                *(item.get("skill", "") for item in domain_structure.get("foundation_skills", [])[:20]),
            ]
        )
        return [
            phrase.lower().strip()
            for phrase in phrases
            if isinstance(phrase, str) and len(phrase.strip()) > 2
        ]

    return mapping, meta, structure, programmes, source_files, anchor_phrases

