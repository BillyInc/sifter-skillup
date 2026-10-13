"""Quality gates for the source-backed Sociology programme-theme claim ledger."""

from __future__ import annotations

import json
import unittest
from pathlib import Path
from urllib.parse import urlparse


LEDGER_PATH = Path(__file__).with_name("_audit") / "sociology_programme_theme_claims_2026_10_08.json"
REQUIRED_EVIDENCE = {
    "item_identity",
    "checkpoint_fit",
    "plain_meaning",
    "contextual_use",
    "expected_output",
}


def validate_ledger(ledger: dict) -> list[str]:
    errors: list[str] = []
    content_policy = ledger.get("content_policy") or {}
    if content_policy.get("owner") != "programme":
        errors.append("theme claims must remain programme-owned")
    if content_policy.get("selection") != "fixed_curriculum_guidance_not_selectable":
        errors.append("programme curriculum explanations must not be selectable extras")
    sources = ledger.get("sources") or {}
    claims = ledger.get("claims") or []
    if len(claims) != 3:
        errors.append(f"expected 3 reviewed pilot claims, found {len(claims)}")
    seen: set[str] = set()
    for index, claim in enumerate(claims):
        prefix = f"claims[{index}]"
        item_key = claim.get("item_key")
        if not item_key or item_key in seen:
            errors.append(f"{prefix} has a missing or duplicate item_key")
        seen.add(item_key)
        if claim.get("claim_review_state") != "approved":
            errors.append(f"{prefix} is not explicitly reviewed")
        if claim.get("selection_state") != "fixed_programme_guidance_not_selectable":
            errors.append(f"{prefix} wrongly treats programme learning as selectable")
        if not all(str(claim.get(key) or "").strip() for key in ("plain_meaning", "everyday_example", "contextual_use", "expected_output")):
            errors.append(f"{prefix} is missing learner-facing explanation")
        evidence = claim.get("evidence") or {}
        missing = REQUIRED_EVIDENCE - set(evidence)
        if missing:
            errors.append(f"{prefix} is missing evidence claims: {sorted(missing)}")
        for evidence_key in REQUIRED_EVIDENCE:
            refs = evidence.get(evidence_key) or []
            if not refs:
                errors.append(f"{prefix}.{evidence_key} has no source reference")
            for ref in refs:
                source_id, separator, locator_key = ref.partition(":")
                source = sources.get(source_id) or {}
                if not separator or not source or locator_key not in (source.get("locators") or {}):
                    errors.append(f"{prefix}.{evidence_key} has unresolved source locator {ref!r}")
        resource = claim.get("learning_resource") or {}
        source_id = resource.get("source_id")
        source = sources.get(source_id) or {}
        parsed_url = urlparse(str(resource.get("url") or ""))
        if parsed_url.scheme != "https" or not parsed_url.netloc:
            errors.append(f"{prefix} learning resource URL must use HTTPS")
        if not source or resource.get("url") != source.get("url"):
            errors.append(f"{prefix} learning resource must match a catalogued source")
        if not resource.get("label") or not resource.get("verified_on"):
            errors.append(f"{prefix} learning resource needs an action label and verification date")
        if not claim.get("limitations"):
            errors.append(f"{prefix} must state evidence limits")
    for index, relationship in enumerate(ledger.get("relationships") or []):
        prefix = f"relationships[{index}]"
        if not relationship.get("from", {}).get("item_type") or not relationship.get("to", {}).get("item_type"):
            errors.append(f"{prefix} must use typed endpoints")
        if relationship.get("claim_review_state") != "approved":
            errors.append(f"{prefix} is not explicitly reviewed")
        if not relationship.get("learner_explanation") or not relationship.get("limitations"):
            errors.append(f"{prefix} needs an explanation and limits")
        for ref in relationship.get("evidence") or []:
            source_id, separator, locator_key = ref.partition(":")
            source = sources.get(source_id) or {}
            if not separator or locator_key not in (source.get("locators") or {}):
                errors.append(f"{prefix} has unresolved source locator {ref!r}")
        if not relationship.get("evidence"):
            errors.append(f"{prefix} has no evidence")
    return errors


class SociologyProgrammeThemeClaimTests(unittest.TestCase):
    def test_checked_in_ledger_passes_all_claim_and_link_gates(self) -> None:
        ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
        self.assertEqual([], validate_ledger(ledger))

    def test_curriculum_claim_cannot_be_changed_into_a_learner_choice(self) -> None:
        ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
        ledger["claims"][0]["selection_state"] = "selectable_extra"
        self.assertTrue(any("wrongly treats programme learning as selectable" in error for error in validate_ledger(ledger)))

    def test_claim_with_unresolved_evidence_or_http_learning_link_fails(self) -> None:
        ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
        ledger["claims"][0]["evidence"]["contextual_use"] = []
        ledger["claims"][1]["learning_resource"]["url"] = "http://example.org/"
        errors = validate_ledger(ledger)
        self.assertTrue(any("contextual_use has no source reference" in error for error in errors))
        self.assertTrue(any("must use HTTPS" in error for error in errors))

    def test_relationships_need_typed_endpoints_and_evidence(self) -> None:
        ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
        ledger["relationships"][0]["to"].pop("item_type")
        ledger["relationships"][0]["evidence"] = []
        errors = validate_ledger(ledger)
        self.assertTrue(any("must use typed endpoints" in error for error in errors))
        self.assertTrue(any("has no evidence" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
