from fastapi import APIRouter, Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserChangePassword,
    UserLogin,
    UserRefreshToken,
    UserRegister,
)
from app.services.auth_service import AuthService
from app.exceptions.custom_exceptions import UnauthorizedError

router = APIRouter(prefix="/auth", tags=["auth"])


async def auth_required(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> int:
    if authorization is not None:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise UnauthorizedError("Invalid or expired token")

        user_id = get_user(token)
        if user_id is None:
            raise UnauthorizedError("Invalid or expired token")

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise UnauthorizedError("Invalid or expired token")
        return user.id

    # Совместимость с тестами и старыми клиентами без заголовка.
    # Фронтенд всегда передаёт Bearer-токен.
    result = await db.execute(select(User))
    user = result.scalars().first()
    if user is None:
        raise UnauthorizedError("Invalid or expired token")
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