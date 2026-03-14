from unittest.mock import patch, MagicMock


class TestPortfolioAccounts:
    def test_get_accounts_empty(self, client, mock_db, sample_user, auth_header):
        mock_result = MagicMock()
        mock_result.data = []
        mock_db.get_service_client().table().select().eq().execute.return_value = mock_result
        with patch("auth.Auth.get_current_user", return_value=sample_user):
            response = client.get("/api/portfolio/accounts", headers=auth_header)
            assert response.status_code == 200
