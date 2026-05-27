from datetime import datetime

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.group import Group
from tests.conftest import MakeTx


async def _make_group(db: AsyncSession, name: str, user) -> Group:
    group = Group(name=name, owner_id=user.id)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


# --- Фильтры и пагинация транзакций ---

async def test_filter_by_category(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Кафе", "expense", "Еда", 500, datetime(2026, 5, 1, 12))
    await make_tx("Uber", "expense", "Такси", 200, datetime(2026, 5, 2, 12))

    response = await client.get("/transactions/", params={"category": "Еда"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "Еда"


async def test_filter_by_date_range(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Ранняя", "expense", "Еда", 100, datetime(2026, 4, 1, 12))
    await make_tx("В периоде", "expense", "Еда", 200, datetime(2026, 5, 15, 12))

    response = await client.get("/transactions/", params={
        "dt_from": "2026-05-01T00:00:00",
        "dt_to": "2026-05-31T23:59:59",
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "В периоде"


async def test_pagination_limit(client: AsyncClient, make_tx: MakeTx) -> None:
    for i in range(5):
        await make_tx(f"Tx{i}", "expense", "Еда", 100, datetime(2026, 5, i + 1, 12))

    response = await client.get("/transactions/", params={"limit": 2, "offset": 0})
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_pagination_offset(client: AsyncClient, make_tx: MakeTx) -> None:
    for i in range(4):
        await make_tx(f"Tx{i}", "expense", "Еда", 100, datetime(2026, 5, i + 1, 12))

    page1 = await client.get("/transactions/", params={"limit": 2, "offset": 0})
    page2 = await client.get("/transactions/", params={"limit": 2, "offset": 2})

    ids1 = {t["id"] for t in page1.json()}
    ids2 = {t["id"] for t in page2.json()}
    assert ids1.isdisjoint(ids2)


# --- Смена пароля ---

async def test_change_password_success(client: AsyncClient, user) -> None:
    response = await client.post("/auth/change-password", json={
        "old_password": "test",
        "new_password": "newpass",
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated"

    login = await client.post("/auth/login", json={"username": "test", "password": "newpass"})
    assert login.status_code == 200


async def test_change_password_wrong_old(client: AsyncClient, user) -> None:
    response = await client.post("/auth/change-password", json={
        "old_password": "wrong",
        "new_password": "newpass",
    })
    assert response.status_code == 401


# --- Обновление токена ---

async def test_refresh_token_returns_new_token(client: AsyncClient, user) -> None:
    login = await client.post("/auth/login", json={"username": "test", "password": "test"})
    token = login.json()["token"]

    response = await client.post("/auth/refresh", json={"token": token})
    assert response.status_code == 200
    new_token = response.json()["token"]
    assert new_token != token


async def test_refresh_token_invalidates_old(client: AsyncClient, user) -> None:
    login = await client.post("/auth/login", json={"username": "test", "password": "test"})
    token = login.json()["token"]

    await client.post("/auth/refresh", json={"token": token})

    response = await client.post("/auth/refresh", json={"token": token})
    assert response.status_code == 401


async def test_refresh_invalid_token(client: AsyncClient, user) -> None:
    response = await client.post("/auth/refresh", json={"token": "invalid-token"})
    assert response.status_code == 401


# --- Аналитика по группам ---

async def test_groups_analytics_empty(client: AsyncClient, user) -> None:
    response = await client.get("/analytics/groups")
    assert response.status_code == 200
    assert response.json() == []


async def test_groups_analytics_with_data(
    client: AsyncClient,
    db: AsyncSession,
    user,
    make_tx: MakeTx,
) -> None:
    await _make_group(db, "Семья", user)
    await make_tx("Зарплата", "income", "Работа", 50000, datetime(2026, 5, 5, 9))
    await make_tx("Продукты", "expense", "Еда", 3000, datetime(2026, 5, 1, 12))

    response = await client.get("/analytics/groups", params={
        "dt_from": "2026-05-01T00:00:00",
        "dt_to": "2026-05-31T23:59:59",
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["group_name"] == "Семья"
    assert data[0]["income"] == 50000.0
    assert data[0]["expense"] == 3000.0
