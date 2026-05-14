from datetime import datetime

from httpx import AsyncClient


PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


async def test_by_category_returns_empty_for_no_data(
    client: AsyncClient, user,
) -> None:
    response = await client.get("/analytics/by-category")
    assert response.status_code == 200
    assert response.json() == {"labels": [], "values": []}


async def test_by_category_aggregates_expenses(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))
    await make_tx("b", "expense", "Food", 50, datetime(2026, 5, 2, 12))
    await make_tx("c", "expense", "Taxi", 200, datetime(2026, 5, 1, 12))
    await make_tx("d", "income", "Job", 1000, datetime(2026, 5, 1, 12))

    response = await client.get(
        "/analytics/by-category",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-31T23:59:59",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["labels"] == ["Taxi", "Food"]
    assert data["values"] == [200.0, 150.0]


async def test_by_category_ignores_income(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "income", "Job", 1000, datetime(2026, 5, 1, 12))

    response = await client.get(
        "/analytics/by-category",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-31T23:59:59",
        },
    )

    assert response.json() == {"labels": [], "values": []}


async def test_by_category_respects_date_range(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("inside", "expense", "Food", 100, datetime(2026, 5, 15, 12))
    await make_tx("before", "expense", "Food", 999, datetime(2026, 4, 15, 12))

    response = await client.get(
        "/analytics/by-category",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-31T23:59:59",
        },
    )

    assert response.json() == {"labels": ["Food"], "values": [100.0]}


async def test_by_category_chart_returns_png(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))

    response = await client.get("/analytics/by-category/chart.png")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(PNG_MAGIC)


async def test_by_category_chart_handles_empty_data(
    client: AsyncClient, user,
) -> None:
    response = await client.get(
        "/analytics/by-category/chart.png",
        params={
            "dt_from": "2026-01-01T00:00:00",
            "dt_to": "2026-01-31T23:59:59",
        },
    )

    assert response.status_code == 200
    assert response.content.startswith(PNG_MAGIC)


async def test_timeline_fills_empty_buckets_with_zeros(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))
    await make_tx("b", "expense", "Food", 200, datetime(2026, 5, 3, 12))

    response = await client.get(
        "/analytics/timeline",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-03T23:59:59",
            "granularity": "day",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["labels"] == ["2026-05-01", "2026-05-02", "2026-05-03"]
    assert data["expense"] == [100.0, 0.0, 200.0]
    assert data["income"] == [0.0, 0.0, 0.0]


async def test_timeline_splits_income_and_expense(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))
    await make_tx("b", "income", "Job", 500, datetime(2026, 5, 1, 12))

    response = await client.get(
        "/analytics/timeline",
        params={
            "dt_from": "2026-05-01T00:00:00",
            "dt_to": "2026-05-01T23:59:59",
            "granularity": "day",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["expense"] == [100.0]
    assert data["income"] == [500.0]


async def test_timeline_week_granularity_aggregates_per_week(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 4, 12))
    await make_tx("b", "expense", "Food", 200, datetime(2026, 5, 7, 12))

    response = await client.get(
        "/analytics/timeline",
        params={
            "dt_from": "2026-05-04T00:00:00",
            "dt_to": "2026-05-10T23:59:59",
            "granularity": "week",
        },
    )

    assert response.status_code == 200
    assert response.json()["expense"] == [300.0]


async def test_timeline_chart_line_returns_png(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))

    response = await client.get(
        "/analytics/timeline/chart.png",
        params={"kind": "line"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content.startswith(PNG_MAGIC)


async def test_timeline_chart_bar_returns_png(
    client: AsyncClient, make_tx,
) -> None:
    await make_tx("a", "expense", "Food", 100, datetime(2026, 5, 1, 12))

    response = await client.get(
        "/analytics/timeline/chart.png",
        params={"kind": "bar"},
    )

    assert response.status_code == 200
    assert response.content.startswith(PNG_MAGIC)


async def test_timeline_rejects_invalid_granularity(
    client: AsyncClient, user,
) -> None:
    response = await client.get(
        "/analytics/timeline",
        params={"granularity": "year"},
    )
    assert response.status_code == 422


async def test_timeline_chart_rejects_invalid_kind(
    client: AsyncClient, user,
) -> None:
    response = await client.get(
        "/analytics/timeline/chart.png",
        params={"kind": "pie"},
    )
    assert response.status_code == 422
