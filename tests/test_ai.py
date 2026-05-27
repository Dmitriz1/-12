from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from httpx import AsyncClient

from tests.conftest import MakeTx


async def test_recommendations_no_data_returns_message(
    client: AsyncClient, user,
) -> None:
    response = await client.get("/ai/recommendations")
    assert response.status_code == 200
    assert response.json()["recommendations"] == "Недостаточно данных для анализа."


async def test_recommendations_with_data_calls_groq(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    await make_tx("Продукты", "expense", "Еда", 3000, datetime(2026, 5, 1, 12))
    await make_tx("Зарплата", "income", "Работа", 80000, datetime(2026, 5, 1, 9))

    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "choices": [{"message": {"content": "Совет 1. Совет 2. Совет 3."}}]
    }

    with patch(
        "app.services.ai_service.httpx.AsyncClient.post",
        new_callable=AsyncMock,
        return_value=mock_response,
    ):
        response = await client.get("/ai/recommendations")

    assert response.status_code == 200
    assert response.json()["recommendations"] == "Совет 1. Совет 2. Совет 3."


async def test_recommendations_respects_date_range(
    client: AsyncClient, make_tx: MakeTx,
) -> None:
    await make_tx("Старая", "expense", "Еда", 1000, datetime(2026, 3, 1, 12))

    response = await client.get(
        "/ai/recommendations",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-31T23:59:59",
        },
    )
    assert response.status_code == 200
    assert response.json()["recommendations"] == "Недостаточно данных для анализа."
