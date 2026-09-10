from unittest.mock import patch, MagicMock


class TestGuestAuth:
    def test_guest_auth_creates_user(self, client, mock_db):
        mock_result = MagicMock()
        mock_result.data = [{
            "id": "new-guest-123",
            "username": "Guest_abc12345",
            "auth_provider": "guest",
            "points": 1000,
            "streak": 1,
        }]
        mock_db.get_service_client().table().insert().execute.return_value = mock_result
        response = client.post("/api/auth/guest")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert "user" in data["data"]


class TestBaseWalletAuth:
    def test_invalid_signature_returns_401(self, client):
        with patch("main.Auth.verify_base_wallet", return_value=False):
            response = client.post("/api/auth/base-wallet", json={
                "walletAddress": "0x1234567890abcdef",
                "signature": "invalid_sig",
                "message": "Sign in to Sifter LevelUp",
            })
            assert response.status_code == 401


class TestGetMeDoesNotCallTheLeaderboardRpc:
    """Session restoration must not depend on the legacy `get_user_rank` RPC.

    That function is absent or slow on some deployed databases, and rank has
    nothing to do with the identity/profile data needed to open the workspace:
    a missing RPC turned every session restore into a failure. The call was
    removed and `rank` pinned to None -- but NOTHING referenced `rank` or
    `get_user_rank` in the suite, so putting
    `db.get_client().rpc("get_user_rank", ...)` back changed no test result.
    """

    def _login_as(self, mock_db, row):
        sc = mock_db.get_service_client.return_value
        (
            sc.table.return_value.select.return_value.eq.return_value
            .single.return_value.execute.return_value
        ) = MagicMock(data=row)

    def test_rank_is_reported_as_unknown_and_the_rpc_is_never_called(
        self, client, auth_header, mock_db
    ):
        self._login_as(mock_db, {
            "id": "test-user-123",
            "username": "RankTester",
            "auth_provider": "guest",
            "account_type": "student",
            "password_hash": "supersecret-hash",
        })

        response = client.get("/api/users/me", headers=auth_header)

        assert response.status_code == 200, response.text
        body = response.json()["data"]
        # Present and explicitly unknown -- not absent, which the client would
        # render as "no rank yet", and not a number this route cannot afford.
        assert "rank" in body
        assert body["rank"] is None
        assert "password_hash" not in body

        rpc_names = [
            call.args[0]
            for call in mock_db.get_client.return_value.rpc.call_args_list
            if call.args
        ] + [
            call.args[0]
            for call in mock_db.get_service_client.return_value.rpc.call_args_list
            if call.args
        ]
        assert "get_user_rank" not in rpc_names, (
            "restoring a session must not depend on the leaderboard RPC"
        )
