from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserChangePassword,
    UserLogin,
    UserRefreshToken,
    UserRegister,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


# TODO: заглушка — берёт первого пользователя из БД.
# Заменить на проверку Bearer-токена, когда появится реальная авторизация.
async def auth_required(db: AsyncSession = Depends(get_db)) -> int:
    result = await db.execute(select(User))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No users registered",
        )
    return user.id


@router.post("/register", summary="Регистрация")
async def register(data: UserRegister, service: AuthService = Depends()):
    user = await service.register_user(data.username, data.password)
    return {"id": user.id}


@router.post("/login", summary="Вход, возвращает токен")
async def login(data: UserLogin, service: AuthService = Depends()):
    token = await service.login_user(data.username, data.password)
    return {"token": token}


@router.post("/change-password", summary="Смена пароля")
async def change_password(
    data: UserChangePassword,
    service: AuthService = Depends(),
    user_id: int = Depends(auth_required),
):
    await service.change_password(user_id, data.old_password, data.new_password)
    return {"message": "Password updated"}


@router.post("/refresh", summary="Обновление токена")
async def refresh(data: UserRefreshToken, service: AuthService = Depends()):
    token = await service.refresh_token(data.token)
    return {"token": token}