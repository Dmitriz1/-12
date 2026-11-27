from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.group import Group
from app.models.transaction import Transaction
from app.models.user import User


async def test_create_user_returns_201(client: AsyncClient, user) -> None:
    response = await client.post(
        "/users/", json={"username": "newbie", "password": "secret1"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newbie"
    assert "password" not in data


async def test_create_duplicate_user_returns_409(
    client: AsyncClient, user
) -> None:
    response = await client.post(
        "/users/", json={"username": "test", "password": "secret1"}
    )
    assert response.status_code == 409
    assert response.json()["error_code"] == "CONFLICT"


async def test_create_user_with_short_password_returns_400(
    client: AsyncClient, user
) -> None:
    response = await client.post(
        "/users/", json={"username": "shorty", "password": "123"}
    )
    assert response.status_code == 400


async def test_get_users_empty(client: AsyncClient, user) -> None:
    response = await client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["username"] == "test"
    assert data["page"] == 1
    assert data["per_page"] == 10
    assert data["total_pages"] == 1


async def test_get_users_pagination(
    client: AsyncClient, db: AsyncSession, user
) -> None:
    for i in range(11):
        db.add(User(username=f"u{i:02d}", password="pass123"))
    await db.commit()

    response = await client.get("/users/?page=2&per_page=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 12
    assert data["total_pages"] == 3
    assert len(data["items"]) == 5


async def test_get_users_sorting(
    client: AsyncClient, db: AsyncSession, user
) -> None:
    for name in ("adam", "zoe"):
        db.add(User(username=name, password="pass123"))
    await db.commit()

    response = await client.get("/users/?sort_by=username&sort_order=asc")
    names = [item["username"] for item in response.json()["items"]]
    assert names == sorted(names)


async def test_get_users_invalid_sort_field_returns_400(
    client: AsyncClient, user
) -> None:
    response = await client.get("/users/?sort_by=password")
    assert response.status_code == 400


async def test_get_users_search(client: AsyncClient, db: AsyncSession, user) -> None:
    db.add(User(username="alice", password="pass123"))
    db.add(User(username="bob", password="pass123"))
    await db.commit()

    response = await client.get("/users/?search=ali")
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["username"] == "alice"


async def test_get_user_by_id(client: AsyncClient, user) -> None:
    response = await client.get(f"/users/{user.id}")
    assert response.status_code == 200
    assert response.json() == {"id": user.id, "username": "test"}


async def test_get_missing_user_returns_404(client: AsyncClient, user) -> None:
    response = await client.get("/users/999999")
    assert response.status_code == 404
    assert response.json()["error_code"] == "NOT_FOUND"


async def test_replace_user(client: AsyncClient, user) -> None:
    response = await client.put(
        f"/users/{user.id}",
        json={"username": "renamed", "password": "newpass"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "renamed"


async def test_replace_user_with_taken_username_returns_409(
    client: AsyncClient, db: AsyncSession, user
) -> None:
    other = User(username="taken", password="pass123")
    db.add(other)
    await db.commit()

    response = await client.put(
        f"/users/{user.id}", json={"username": "taken", "password": "newpass"}
    )
    assert response.status_code == 409


async def test_patch_user_partial(client: AsyncClient, user) -> None:
    response = await client.patch(
        f"/users/{user.id}", json={"password": "brand-new-pass"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "test"

    login = await client.post(
        "/auth/login", json={"username": "test", "password": "brand-new-pass"}
    )
    assert login.status_code == 200


async def test_patch_missing_user_returns_404(client: AsyncClient, user) -> None:
    response = await client.patch("/users/999999", json={"username": "ghost"})
    assert response.status_code == 404


async def test_delete_user(client: AsyncClient, db: AsyncSession, user) -> None:
    # второй пользователь остаётся, чтобы было от чьего имени смотреть ответ
    db.add(User(username="keeper", password="pass123"))
    await db.commit()

    response = await client.delete(f"/users/{user.id}")
    assert response.status_code == 204

    check = await client.get(f"/users/{user.id}")
    assert check.status_code == 404


async def test_delete_missing_user_returns_404(
    client: AsyncClient, db: AsyncSession, user
) -> None:
    other = User(username="victim", password="pass123")
    db.add(other)
    await db.commit()

    response = await client.delete(f"/users/{other.id + 1000}")
    assert response.status_code == 404


async def test_delete_user_removes_related_data(
    client: AsyncClient, db: AsyncSession, user
) -> None:
    db.add(Transaction(
        title="coffee", type="expense", category="food",
        amount=3.5, user_id=user.id,
    ))
    db.add(Group(name="trips", owner_id=user.id))
    db.add(User(username="keeper", password="pass123"))
    await db.commit()

    response = await client.delete(f"/users/{user.id}")
    assert response.status_code == 204

    txs = await client.get("/transactions/")
    assert txs.json()["items"] == []
    groups = await client.get("/groups/")
    assert groups.json()["items"] == []
