from httpx import AsyncClient


async def test_register_returns_id(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/register",
        json={"username": "alice", "password": "secret"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert isinstance(data["id"], int)


async def test_register_duplicate_returns_400(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "bob", "password": "pass"})
    response = await client.post(
        "/auth/register",
        json={"username": "bob", "password": "pass"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "User already exists"


async def test_register_missing_fields_returns_422(client: AsyncClient) -> None:
    response = await client.post("/auth/register", json={"username": "carol"})
    assert response.status_code == 422


async def test_login_success_returns_token(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "dave", "password": "1234"})
    response = await client.post(
        "/auth/login",
        json={"username": "dave", "password": "1234"},
    )
    assert response.status_code == 200
    assert "token" in response.json()


async def test_login_wrong_password_returns_401(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "eve", "password": "right"})
    response = await client.post(
        "/auth/login",
        json={"username": "eve", "password": "wrong"},
    )
    assert response.status_code == 401


async def test_login_unknown_user_returns_401(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/login",
        json={"username": "ghost", "password": "pass"},
    )
    assert response.status_code == 401
