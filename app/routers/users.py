from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.routers.auth import auth_required
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserResponseMetaData,
    UserUpdate,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать пользователя",
)
async def create(
    data: UserCreate,
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.create_user(data=data.model_dump())


@router.get(
    "/",
    response_model=UserResponseMetaData,
    summary="Список пользователей (пагинация + сортировка + поиск)",
)
async def get_all(
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    sort_by: str = Query("id", description="Поле сортировки: id, username"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: Optional[str] = Query(
        None, min_length=1, description="Поиск по имени пользователя или id"
    ),
):
    return await service.get_users(
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
    )


@router.get(
    "/{target_id}",
    response_model=UserResponse,
    summary="Получить пользователя по id",
)
async def get_one(
    target_id: int,
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.get_user(user_id=target_id)


@router.put(
    "/{target_id}",
    response_model=UserResponse,
    summary="Полностью заменить пользователя",
)
async def replace(
    target_id: int,
    data: UserCreate,
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.replace_user(
        data=data.model_dump(), user_id=target_id
    )


@router.patch(
    "/{target_id}",
    response_model=UserResponse,
    summary="Частично обновить пользователя",
)
async def update(
    target_id: int,
    data: UserUpdate,
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.update_user(
        data=data.model_dump(exclude_unset=True, exclude_none=True),
        user_id=target_id,
    )


@router.delete(
    "/{target_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить пользователя (вместе с его транзакциями и группами)",
)
async def delete(
    target_id: int,
    service: UserService = Depends(),
    user_id: int = Depends(auth_required),
):
    await service.delete_user(user_id=target_id)
