from fastapi import APIRouter, Depends

from app.schemas.group import GroupCreate
from app.services.group_service import GroupService
from app.routers.auth import auth_required

router = APIRouter(prefix="/groups")


@router.post("/")
async def create(data: GroupCreate, service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.create_group(name=data.name, user_id=user_id)


@router.get("/")
async def get_all(service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.get_groups(user_id=user_id)