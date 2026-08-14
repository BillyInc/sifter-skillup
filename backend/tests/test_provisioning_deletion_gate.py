import pytest
from fastapi import HTTPException

from routes.provisioning_routes import _deletion_gate


def _student(**overrides):
    row = {
        "provisioning_school_id": "school-1",
        "provenance": "provisioned",
        "claim_state": "unclaimed",
        "chosen_direction": None,
    }
    row.update(overrides)
    return row


def test_unclaimed_unguided_school_account_can_be_deleted():
    _deletion_gate(_student(), "school-1")


@pytest.mark.parametrize(
    "overrides, status",
    [
        ({"claim_state": "claimed"}, 409),
        ({"chosen_direction": {"domain_key": "health"}}, 409),
        ({"provenance": "self"}, 409),
        ({"provisioning_school_id": "school-2"}, 404),
    ],
)
def test_delete_gate_blocks_privacy_boundary_and_wrong_scope(overrides, status):
    with pytest.raises(HTTPException) as caught:
        _deletion_gate(_student(**overrides), "school-1")
    assert caught.value.status_code == status
