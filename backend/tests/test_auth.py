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
                "message": "Sign in to Sifter Skill_Up",
            })
            assert response.status_code == 401
