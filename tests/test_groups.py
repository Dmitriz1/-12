from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.group import Group
from app.models.user import User


async def _make_group(db: AsyncSession, name: str, user: User) -> Group:
    group = Group(name=name, owner_id=user.id)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


async def test_get_groups_empty(client: AsyncClient, user) -> None:
    response = await client.get("/groups/")
    assert response.status_code == 200
    assert response.json() == []


async def test_create_group_returns_correct_fields(
    client: AsyncClient, user,
) -> None:
    response = await client.post("/groups/", json={"name": "Семья"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Семья"
    assert "id" in data
    assert "owner_id" in data


async def test_create_group_missing_name_returns_422(
    client: AsyncClient, user,
) -> None:
    response = await client.post("/groups/", json={})
    assert response.status_code == 422


async def test_get_groups_returns_all(
    client: AsyncClient, db: AsyncSession, user,
) -> None:
    await _make_group(db, "Семья", user)
    await _make_group(db, "Друзья", user)
    response = await client.get("/groups/")
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_delete_group(
    client: AsyncClient, db: AsyncSession, user,
) -> None:
    group = await _make_group(db, "Удалить", user)
    response = await client.delete(f"/groups/{group.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "deleted"}

    remaining = await client.get("/groups/")
    assert all(g["id"] != group.id for g in remaining.json())


async def test_delete_nonexistent_group_returns_404(
    client: AsyncClient, user,
) -> None:
    response = await client.delete("/groups/99999")
    assert response.status_code == 404


async def test_update_group_name(
    client: AsyncClient, db: AsyncSession, user,
) -> None:
    group = await _make_group(db, "Старое", user)
    response = await client.patch(f"/groups/{group.id}", json={"name": "Новое"})
    assert response.status_code == 200
    assert response.json()["name"] == "Новое"


async def test_update_nonexistent_group_returns_404(
    client: AsyncClient, user,
) -> None:
    response = await client.patch("/groups/99999", json={"name": "X"})
    assert response.status_code == 404
