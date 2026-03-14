from unittest.mock import patch, MagicMock


class TestHealthCheck:
    def test_health_returns_ok(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestGameState:
    def test_get_game_state_empty(self, client, mock_db, sample_user, auth_header):
        mock_result = MagicMock()
        mock_result.data = []
        mock_db.get_client().table().select().eq().execute.return_value = mock_result
        with patch("auth.Auth.get_current_user", return_value=sample_user):
            response = client.get("/api/game/state", headers=auth_header)
            assert response.status_code == 200

    def test_get_quant_gate_locked(self, client, sample_user, auth_header):
        with patch("auth.Auth.get_current_user", return_value=sample_user):
            response = client.get("/api/game/quant-gate", headers=auth_header)
            assert response.status_code == 200
            data = response.json()["data"]
            assert data["quant_trader_unlocked"] is True
            assert data["quant_researcher_unlocked"] is True
            assert data["quant_developer_unlocked"] is False
