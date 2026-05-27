from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.routers.auth import auth_required
from app.services import charts
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics")

Granularity = Literal["day", "week", "month"]
ChartKind = Literal["line", "bar"]


def _default_dt_from() -> datetime:
    now = datetime.utcnow()
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _default_dt_to() -> datetime:
    now = datetime.utcnow()
    return now.replace(hour=23, minute=59, second=59, microsecond=0)


def _normalize(value: Optional[datetime], default_factory) -> datetime:
    if value is None:
        return default_factory()
    if value.tzinfo is not None:
        return value.replace(tzinfo=None)
    return value


@dataclass
class TimeRange:
    dt_from: datetime
    dt_to: datetime


def time_range(
    dt_from: Optional[datetime] = None,
    dt_to: Optional[datetime] = None,
) -> TimeRange:
    return TimeRange(
        dt_from=_normalize(dt_from, _default_dt_from),
        dt_to=_normalize(dt_to, _default_dt_to),
    )


@router.get("/by-category")
async def by_category(
    rng: TimeRange = Depends(time_range),
    service: AnalyticsService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.by_category(user_id, rng.dt_from, rng.dt_to)


@router.get("/by-category/chart.png")
async def by_category_chart(
    rng: TimeRange = Depends(time_range),
    service: AnalyticsService = Depends(),
    user_id: int = Depends(auth_required),
):
    data = await service.by_category(user_id, rng.dt_from, rng.dt_to)
    image = charts.render_pie(data["labels"], data["values"])
    return StreamingResponse(image, media_type="image/png")


@router.get("/timeline")
async def timeline(
    rng: TimeRange = Depends(time_range),
    granularity: Granularity = "day",
    service: AnalyticsService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.timeline(user_id, rng.dt_from, rng.dt_to, granularity)


@router.get("/timeline/chart.png")
async def timeline_chart(
    rng: TimeRange = Depends(time_range),
    granularity: Granularity = "day",
    kind: ChartKind = "line",
    service: AnalyticsService = Depends(),
    user_id: int = Depends(auth_required),
):
    data = await service.timeline(user_id, rng.dt_from, rng.dt_to, granularity)
    image = charts.render_timeline(
        data["labels"], data["expense"], data["income"], kind,
    )
    return StreamingResponse(image, media_type="image/png")


@router.get("/groups")
async def groups_analytics(
    rng: TimeRange = Depends(time_range),
    service: AnalyticsService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.groups_analytics(user_id, rng.dt_from, rng.dt_to)
