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


async def test_register_duplicate_returns_409(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "bob", "password": "pass123"})
    response = await client.post(
        "/auth/register",
        json={"username": "bob", "password": "pass123"},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "User already exists"
    assert response.json()["error_code"] == "CONFLICT"


async def test_register_missing_fields_returns_400(client: AsyncClient) -> None:
    response = await client.post("/auth/register", json={"username": "carol"})
    assert response.status_code == 400


async def test_login_success_returns_token(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "dave", "password": "123456"})
    response = await client.post(
        "/auth/login",
        json={"username": "dave", "password": "123456"},
    )
    assert response.status_code == 200
    assert "token" in response.json()


async def test_login_wrong_password_returns_401(client: AsyncClient) -> None:
    await client.post("/auth/register", json={"username": "eve", "password": "rightpass"})
    response = await client.post(
        "/auth/login",
        json={"username": "eve", "password": "wrongpass"},
    )
    assert response.status_code == 401


async def test_login_unknown_user_returns_401(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/login",
        json={"username": "ghost", "password": "pass"},
    )
    assert response.status_code == 401


async def test_token_scopes_transactions_to_user(client: AsyncClient) -> None:
    for username in ("alice", "bob"):
        await client.post(
            "/auth/register",
            json={"username": username, "password": "secret"},
        )

    alice = await client.post(
        "/auth/login", json={"username": "alice", "password": "secret"}
    )
    bob = await client.post(
        "/auth/login", json={"username": "bob", "password": "secret"}
    )
    alice_headers = {"Authorization": f"Bearer {alice.json()['token']}"}
    bob_headers = {"Authorization": f"Bearer {bob.json()['token']}"}

    created = await client.post(
        "/transactions/",
        headers=alice_headers,
        json={"title": "Alice tx", "type": "expense", "category": "Food", "amount": 100},
    )
    assert created.status_code == 201

    alice_list = await client.get("/transactions/", headers=alice_headers)
    bob_list = await client.get("/transactions/", headers=bob_headers)
    assert alice_list.json()["total"] == 1
    assert bob_list.json()["total"] == 0


async def test_invalid_token_returns_401(client: AsyncClient) -> None:
    await client.post(
        "/auth/register", json={"username": "carol", "password": "secret"}
    )
    response = await client.get(
        "/transactions/",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
