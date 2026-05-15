from fastapi import APIRouter, Depends

from app.routers.analytics import TimeRange, time_range
from app.routers.auth import auth_required
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai")


@router.get("/recommendations")
async def recommendations(
    rng: TimeRange = Depends(time_range),
    service: AIService = Depends(),
    user_id: int = Depends(auth_required),
):
    text = await service.recommendations(user_id, rng.dt_from, rng.dt_to)
    return {"recommendations": text}
