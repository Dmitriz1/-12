from fastapi import APIRouter, Depends, status, Query, HTTPException

from app.routers.auth import auth_required
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate, GroupResponseMetaData
from app.services.group_service import GroupService

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post(
    "/",
    response_model=GroupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать группу",
)
async def create(
    data: GroupCreate,
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.create_group(name=data.name, user_id=user_id)

@router.get(
    "/",
    response_model=GroupResponseMetaData,
    summary="Список групп (пагинация + сортирока)",
)
async def get_all(
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    sort_by: str = Query("name", description="Поле сортировки"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    return await service.get_groups(
        user_id=user_id,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order
        )


@router.get(
    "/{group_id}",
    response_model=GroupResponse,
    summary="Получить группу по id",
)
async def get_one(
    group_id: int,
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.get_group(group_id=group_id, user_id=user_id)


@router.put(
    "/{group_id}",
    response_model=GroupResponse,
    summary="Полностью заменить группу",
)
async def replace(
    group_id: int,
    data: GroupCreate,
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.replace_group(
        data=data.model_dump(),
        group_id=group_id,
        user_id=user_id,
    )


@router.patch(
    "/{group_id}",
    response_model=GroupResponse,
    summary="Частично обновить группу",
)
async def update(
    group_id: int,
    data: GroupUpdate,
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.update_group(
        data=data.model_dump(exclude_unset=True),
        group_id=group_id,
        user_id=user_id,
    )


@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить группу",
)
async def delete(
    group_id: int,
    service: GroupService = Depends(),
    user_id: int = Depends(auth_required),
):
    await service.delete_group(group_id=group_id, user_id=user_id)