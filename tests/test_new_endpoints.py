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
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["category"] == "Еда"


async def test_filter_by_date_range(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Ранняя", "expense", "Еда", 100, datetime(2026, 4, 1, 12))
    await make_tx("В периоде", "expense", "Еда", 200, datetime(2026, 5, 15, 12))

    response = await client.get("/transactions/", params={
        "dt_from": "2026-05-01T00:00:00",
        "dt_to": "2026-05-31T23:59:59",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "В периоде"


async def test_pagination_per_page(client: AsyncClient, make_tx: MakeTx) -> None:
    for i in range(5):
        await make_tx(f"Tx{i}", "expense", "Еда", 100, datetime(2026, 5, i + 1, 12))

    response = await client.get("/transactions/", params={"page": 1, "per_page": 2})
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3


async def test_pagination_pages_are_disjoint(client: AsyncClient, make_tx: MakeTx) -> None:
    for i in range(4):
        await make_tx(f"Tx{i}", "expense", "Еда", 100, datetime(2026, 5, i + 1, 12))

    page1 = await client.get("/transactions/", params={"page": 1, "per_page": 2})
    page2 = await client.get("/transactions/", params={"page": 2, "per_page": 2})

    ids1 = {t["id"] for t in page1.json()["items"]}
    ids2 = {t["id"] for t in page2.json()["items"]}
    assert ids1.isdisjoint(ids2)


# --- Поиск и диапазон суммы (практика 6) ---

async def test_search_by_title_case_insensitive(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Покупки в Перекрестке", "expense", "Еда", 900, datetime(2026, 5, 1, 12))
    await make_tx("Зарплата", "income", "Работа", 50000, datetime(2026, 5, 5, 9))

    response = await client.get("/transactions/", params={"search": "перекрестке"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Покупки в Перекрестке"


async def test_search_by_category(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Обед", "expense", "Рестораны", 700, datetime(2026, 5, 1, 12))
    await make_tx("Такси", "expense", "Транспорт", 300, datetime(2026, 5, 2, 12))

    response = await client.get("/transactions/", params={"search": "ресторан"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["category"] == "Рестораны"


async def test_search_too_short_returns_400(client: AsyncClient, user) -> None:
    response = await client.get("/transactions/", params={"search": "а"})
    assert response.status_code == 400
    assert response.json()["error_code"] == "VALIDATION_ERROR"


async def test_filter_by_amount_range(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Мелочь", "expense", "Еда", 100, datetime(2026, 5, 1, 12))
    await make_tx("Среднее", "expense", "Еда", 500, datetime(2026, 5, 2, 12))
    await make_tx("Крупная", "expense", "Еда", 5000, datetime(2026, 5, 3, 12))

    response = await client.get(
        "/transactions/", params={"min_amount": 200, "max_amount": 1000}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Среднее"


async def test_min_amount_greater_than_max_returns_400(
    client: AsyncClient, user,
) -> None:
    response = await client.get(
        "/transactions/", params={"min_amount": 1000, "max_amount": 100}
    )
    assert response.status_code == 400
    assert response.json()["error_code"] == "BAD_REQUEST"


async def test_search_combines_with_filters_and_pagination(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    await make_tx("Продукты", "expense", "Супермаркет", 800, datetime(2026, 5, 1, 12))
    await make_tx("Продукты оптом", "expense", "Супермаркет", 1200, datetime(2026, 5, 2, 12))
    await make_tx("Продукты", "income", "Кэшбэк", 50, datetime(2026, 5, 3, 12))
    await make_tx("Кино", "expense", "Развлечения", 400, datetime(2026, 5, 4, 12))

    response = await client.get("/transactions/", params={
        "search": "продукты",
        "type": "expense",
        "sort_by": "amount",
        "sort_order": "desc",
        "page": 1,
        "per_page": 1,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 1
    assert data["items"][0]["amount"] == 1200.0
    assert data["total_pages"] == 2


# --- Статистика и отчёты (практика 6) ---

async def test_analytics_summary_empty(client: AsyncClient, user) -> None:
    response = await client.get("/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["sum_amount"] == 0.0
    assert data["by_type"] == []
    assert data["by_category"] == []


async def test_analytics_summary_aggregates(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))
    await make_tx("b", "expense", "Food", 300, datetime(2026, 5, 2, 12))
    await make_tx("c", "income", "Job", 1000, datetime(2026, 5, 3, 12))

    response = await client.get("/analytics/summary", params={
        "dt_from": "2026-05-01T00:00:00",
        "dt_to": "2026-05-31T23:59:59",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert data["sum_amount"] == 1400.0
    assert data["avg_amount"] == pytest.approx(1400.0 / 3)
    by_type = {row["type"]: row for row in data["by_type"]}
    assert by_type["expense"]["count"] == 2
    assert by_type["expense"]["total"] == 400.0
    assert by_type["income"]["total"] == 1000.0
    by_category = {row["category"]: row for row in data["by_category"]}
    assert by_category["Food"]["count"] == 2
    assert by_category["Food"]["total"] == 400.0


async def test_analytics_top_categories(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))
    await make_tx("b", "expense", "Taxi", 500, datetime(2026, 5, 2, 12))
    await make_tx("c", "expense", "Food", 200, datetime(2026, 5, 3, 12))
    await make_tx("d", "expense", "Rent", 1000, datetime(2026, 5, 4, 12))
    await make_tx("e", "income", "Job", 9999, datetime(2026, 5, 5, 12))

    response = await client.get("/analytics/top-categories", params={
        "dt_from": "2026-05-01T00:00:00",
        "dt_to": "2026-05-31T23:59:59",
        "type": "expense",
        "limit": 2,
    })
    assert response.status_code == 200
    data = response.json()
    assert [row["category"] for row in data] == ["Rent", "Taxi"]
    assert data[0]["total"] == 1000.0


# --- Экспорт ---

async def test_malformed_json_body_returns_400_not_500(client: AsyncClient, user) -> None:
    response = await client.post(
        "/transactions/",
        content=b'{"title": ,"type":"expense"}',
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 400
    assert response.json()["error_code"] == "VALIDATION_ERROR"


async def test_export_csv_returns_rows(client: AsyncClient, make_tx: MakeTx) -> None:
    await make_tx("Продукты", "expense", "Еда", 1000, datetime(2026, 5, 1, 12))
    await make_tx("Зарплата", "income", "Работа", 50000, datetime(2026, 5, 5, 9))

    response = await client.get("/transactions/export", params={"format": "csv"})
    assert response.status_code == 200
    body = response.text
    assert "id,title,type,category,amount,created_at" in body
    assert "Продукты" in body
    assert "Зарплата" in body


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
    assert response.status_code == 400
    assert response.json()["error_code"] == "BAD_REQUEST"


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
