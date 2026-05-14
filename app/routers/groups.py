from fastapi import APIRouter, Depends

from app.schemas.group import GroupCreate, GroupUpdate
from app.services.group_service import GroupService
from app.routers.auth import auth_required

router = APIRouter(prefix="/groups")


@router.post("/")
async def create(data: GroupCreate, service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.create_group(name=data.name, user_id=user_id)

@router.delete("/{group_id}")
async def delete(group_id: int, service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.delete_group(group_id=group_id, user_id=user_id)

@router.patch("/{group_id}")
async def update(group_id: int, data: GroupUpdate, service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.update_group(data=data.model_dump(exclude_unset=True), group_id=group_id, user_id=user_id)

@router.get("/")
async def get_all(service: GroupService = Depends(), user_id: int = Depends(auth_required)):
    return await service.get_groups(user_id=user_id)