from datetime import datetime, timedelta

from fastapi import Depends

from app.repositories.analytics_repo import AnalyticsRepository


def _floor_to_bucket(dt: datetime, granularity: str) -> datetime:
    if granularity == "day":
        return dt.replace(hour=0, minute=0, second=0, microsecond=0)
    if granularity == "week":
        d = dt.replace(hour=0, minute=0, second=0, microsecond=0)
        return d - timedelta(days=d.weekday())
    if granularity == "month":
        return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Unsupported granularity: {granularity}")


def _next_bucket(dt: datetime, granularity: str) -> datetime:
    if granularity == "day":
        return dt + timedelta(days=1)
    if granularity == "week":
        return dt + timedelta(days=7)
    if granularity == "month":
        if dt.month == 12:
            return dt.replace(year=dt.year + 1, month=1)
        return dt.replace(month=dt.month + 1)
    raise ValueError(f"Unsupported granularity: {granularity}")


def _generate_buckets(
    dt_from: datetime,
    dt_to: datetime,
    granularity: str,
) -> list[datetime]:
    start = _floor_to_bucket(dt_from, granularity)
    end = _floor_to_bucket(dt_to, granularity)
    buckets: list[datetime] = []
    cur = start
    while cur <= end:
        buckets.append(cur)
        cur = _next_bucket(cur, granularity)
    return buckets


class AnalyticsService:
    def __init__(self, repo: AnalyticsRepository = Depends()):
        self.repo = repo

    async def by_category(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
    ) -> dict:
        rows = await self.repo.aggregate_by_category(user_id, dt_from, dt_to)
        return {
            "labels": [row.category for row in rows],
            "values": [float(row.total) for row in rows],
        }

    async def timeline(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
        granularity: str,
    ) -> dict:
        rows = await self.repo.aggregate_timeline(user_id, dt_from, dt_to, granularity)

        by_bucket: dict[datetime, dict[str, float]] = {}
        for row in rows:
            bucket_value = by_bucket.setdefault(
                row.bucket,
                {"expense": 0.0, "income": 0.0},
            )
            if row.type in bucket_value:
                bucket_value[row.type] = float(row.total)

        buckets = _generate_buckets(dt_from, dt_to, granularity)
        labels = [b.date().isoformat() for b in buckets]
        expense = [by_bucket.get(b, {}).get("expense", 0.0) for b in buckets]
        income = [by_bucket.get(b, {}).get("income", 0.0) for b in buckets]

        return {"labels": labels, "expense": expense, "income": income}
