"""Repair two Computing course summaries contaminated by cross-reference text."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "ccmas" / "computing.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf"


def main() -> None:
    document = json.loads(PATH.read_text(encoding="utf-8"))
    data_science = next(p for p in document["programmes"] if p["name"] == "Data Science")
    ict = next(p for p in document["programmes"] if p["name"] == "Information and Communication Technology")
    dts = next(c for c in data_science["courses"] if c["code"] == "DTS 498")
    csc = next(c for c in ict["courses"] if c["code"] == "CSC 432")
    assert "[SEE CS" in (dts.get("content_summary") or "")
    assert "[SEE CS" in (csc.get("content_summary") or "")

    dts["content_summary"] = (
        "Continuation of DTS 497. The course covers implementation and evaluation "
        "of the project. Chapters 4–5 of a formal report must be approved by the "
        "supervisor; the final report comprising chapters 1–5 is submitted for "
        "departmental grading, followed by an oral presentation."
    )
    dts["source_url"] = URL
    dts["source_locator"] = "DTS 498 Final Year Project II, printed pp. 115-116."
    dts["source_accessed_on"] = "2026-09-26"

    csc["content_summary"] = (
        "Communication mechanisms and protocols; RPC and RMI; stream-oriented "
        "communication; synchronization, global state, election and distributed "
        "mutual exclusion; distributed transactions; naming schemes including "
        "DNS and localization; replication, coherence and consistency models; "
        "fault tolerance; access control, key management and cryptography; "
        "distributed file systems; and secure distributed applications including "
        "e-commerce and online business."
    )
    csc["source_url"] = URL
    csc["source_locator"] = "CSC 432 Distributed Computing Systems, printed pp. 143-144."
    csc["source_accessed_on"] = "2026-09-26"

    PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log = ROOT / "_audit" / "computing_cross_reference_spill_repair_2026-09-26.json"
    log.write_text(
        json.dumps(
            {
                "status": "source_backed_repair",
                "changed": [
                    {"programme": "Data Science", "code": "DTS 498", "printed_pages": "115-116"},
                    {"programme": "Information and Communication Technology", "code": "CSC 432", "printed_pages": "143-144"},
                ],
                "source_url": URL,
                "accessed_on": "2026-09-26",
                "rule": "Resolve the source course block rather than copying the CCMAS cross-reference marker into the course content.",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"changed": 2, "log": str(log)}, indent=2))


if __name__ == "__main__":
    main()
