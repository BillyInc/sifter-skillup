"""Regression checks for learner-facing relationship explanations."""

from backend import d078_guided_content as content


def _items():
    payload = content.d078_guided_content()
    rows = list(payload["domainItems"])
    rows.extend(item for items in payload["areaItems"].values() for item in items)
    rows.extend(item for items in content._d078_role_items_by_owner().values() for item in items)
    return rows


def test_every_visible_relationship_explains_what_it_means():
    relationships = [
        relationship
        for item in _items()
        for relationship in item.get("relationships") or []
    ]
    assert relationships
    assert all(len(str(row.get("learnerExplanation") or "").split()) >= 14 for row in relationships)
    assert all(row.get("relationshipType") for row in relationships)


def test_relationship_copy_does_not_expose_internal_shortcuts():
    forbidden = {"not cumulative.", "tool choice follows method and project constraints."}
    explanations = {
        str(row.get("learnerExplanation") or "").strip().casefold()
        for item in _items()
        for row in item.get("relationships") or []
    }
    assert not explanations.intersection(forbidden)

