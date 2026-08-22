from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Test that the /api/health endpoint returns status 200 and valid payload."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "version" in data
    assert "timestamp" in data
