from fastapi.testclient import TestClient


def test_info_endpoint(client: TestClient):
    """Test that the /api/info endpoint returns status 200 and valid system metadata."""
    response = client.get("/api/info")
    assert response.status_code == 200

    data = response.json()
    assert data["project_name"] == "IoTShield"
    assert data["status"] == "online"
    assert "version" in data
    assert "stage" in data
    assert isinstance(data["capabilities"], list)
    assert len(data["capabilities"]) > 0


def test_root_endpoint(client: TestClient):
    """Test that the root endpoint returns welcome metadata."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert "IoTShield" in data["message"]
    assert "docs" in data
