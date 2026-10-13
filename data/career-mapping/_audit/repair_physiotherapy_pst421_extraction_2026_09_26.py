"""Restore the source-confirmed Physiotherapy PST 421 row and remove page spill."""

from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
OUTCOMES = [
    "discuss the general principles that guides decision making in physiotherapy care in neurological conditions;",
    "apply knowledge and understanding of the general principles and approaches for maximised outcome in neurological conditions;",
    "use clinical judgment and reflection to identify, monitor, and enhance clinical reasoning to minimise errors and enhance patient/client outcomes in neurological condition;",
    "describe the philosophical basis of each of the traditional approaches to neuro-rehabilitation;",
    "explain the current motor control theory and compare it to traditional theories of motor control; and",
    "describe the aetiology, pathological basis, clinical features and outline treatment plans for the neurological conditions listed in the course contents.",
]
CONTENT = (
    "Review of the physiology and anatomy of the nervous system. Infectious diseases of the nervous "
    "system, trauma, degenerative disorders, epilepsy, disorders of equilibrium, cranial and peripheral "
    "nerve disorders. Specific lesions within the skull include hemiplegia, Parkinson's disease, head "
    "injuries and space-occupying brain lesions. Lesions within the spinal column include paraplegia, "
    "quadriplegia, tabes dorsalis, disseminated sclerosis, polyneuritis and peripheral neuropathy. Other "
    "conditions include syringomyelia, poliomyelitis, myasthenia gravis, Gullian Barre syndrome, multiple "
    "sclerosis and amyotrophic lateral sclerosis. The course covers neurological assessment of sensory "
    "and motor dysfunctions and medical and physiotherapy management."
)


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(packages)}")
    rows = [c for c in packages[0]["courses"] if c.get("code") == "PST 421"]
    if len(rows) != 1:
        raise SystemExit(f"Expected one PST 421; got {len(rows)}")
    row = rows[0]
    if not str(row.get("content_summary", "")).startswith("Allied Health Sciences  618"):
        raise SystemExit("PST 421 no longer has the audited page-header contamination; refusing edit")
    if len(row.get("skills_learned", [])) != 6 or not row["skills_learned"][-1].endswith("for"):
        raise SystemExit("PST 421 no longer has the audited truncated outcome; refusing edit")
    row.update(
        title="Neurological Physiotherapy-I",
        units=2,
        status="C",
        lh=30,
        ph=0,
        skills_learned=OUTCOMES,
        content_summary=CONTENT,
        source_url=URL,
        source_locator="Physiotherapy PST 421 course structure printed p. 588; outcomes and contents printed pp. 619-620",
        source_accessed_on="2026-09-26",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Restored PST 421 course metadata, complete outcomes/content, and item-specific NUC locator.")


if __name__ == "__main__":
    main()
