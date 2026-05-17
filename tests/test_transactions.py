from datetime import datetime

from httpx import AsyncClient

from tests.conftest import MakeTx


async def test_get_transactions_empty(client: AsyncClient, user) -> None:
    response = await client.get("/transactions/")
    assert response.status_code == 200
    assert response.json() == []


async def test_create_expense_returns_correct_fields(
    client: AsyncClient, user,
) -> None:
    response = await client.post(
        "/transactions/",
        json={"title": "Кафе", "type": "expense", "category": "Еда", "amount": 500},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Кафе"
    assert data["type"] == "expense"
    assert data["category"] == "Еда"
    assert data["amount"] == 500.0
    assert "id" in data
    assert "created_at" in data


async def test_create_income_returns_correct_fields(
    client: AsyncClient, user,
) -> None:
    response = await client.post(
        "/transactions/",
        json={"title": "Зарплата", "type": "income", "category": "Работа", "amount": 80000},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "income"
    assert data["amount"] == 80000.0


async def test_create_transaction_missing_fields_returns_422(
    client: AsyncClient, user,
) -> None:
    response = await client.post(
        "/transactions/",
        json={"title": "Без суммы", "type": "expense", "category": "Еда"},
    )
    assert response.status_code == 422


async def test_get_transactions_returns_all(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    await make_tx("Продукты", "expense", "Еда", 1000, datetime(2026, 5, 1, 12))
    await make_tx("Зарплата", "income", "Работа", 50000, datetime(2026, 5, 5, 9))
    response = await client.get("/transactions/")
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_delete_transaction(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    tx = await make_tx("Удалить меня", "expense", "Прочее", 100, datetime(2026, 5, 1, 12))
    response = await client.delete(f"/transactions/{tx.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "deleted"}

    remaining = await client.get("/transactions/")
    assert all(t["id"] != tx.id for t in remaining.json())


async def test_delete_nonexistent_returns_404(
    client: AsyncClient, user,
) -> None:
    response = await client.delete("/transactions/99999")
    assert response.status_code == 404


async def test_update_transaction_amount(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    tx = await make_tx("Обновить", "expense", "Еда", 200, datetime(2026, 5, 1, 12))
    response = await client.patch(
        f"/transactions/{tx.id}",
        json={"amount": 350},
    )
    assert response.status_code == 200
    assert response.json()["amount"] == 350.0


async def test_update_transaction_title(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    tx = await make_tx("Старое название", "expense", "Еда", 100, datetime(2026, 5, 1, 12))
    response = await client.patch(
        f"/transactions/{tx.id}",
        json={"title": "Новое название"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Новое название"
    assert response.json()["amount"] == 100.0


async def test_update_nonexistent_returns_404(
    client: AsyncClient, user,
) -> None:
    response = await client.patch("/transactions/99999", json={"amount": 100})
    assert response.status_code == 404
