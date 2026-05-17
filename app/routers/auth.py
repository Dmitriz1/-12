from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserChangePassword, UserRefreshToken
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth")

# TODO: ЗАГЛУШКА! Изменить когда начнем работать с фронт-эндом
async def auth_required(db: Session = Depends(get_db)):
    result = await db.execute(select(User))
    user = result.scalars().first()
    return user.id

@router.post("/register")
async def register(data: UserRegister, service: AuthService = Depends()):
    user = await service.register_user(data.username, data.password)
    return {"id": user.id}


@router.post("/login")
async def login(data: UserLogin, service: AuthService = Depends()):
    token = await service.login_user(data.username, data.password)
    return {"token": token}


@router.post("/change-password")
async def change_password(
    data: UserChangePassword,
    service: AuthService = Depends(),
    user_id: int = Depends(auth_required),
):
    await service.change_password(user_id, data.old_password, data.new_password)
    return {"message": "Password updated"}


@router.post("/refresh")
async def refresh(data: UserRefreshToken, service: AuthService = Depends()):
    token = await service.refresh_token(data.token)
    return {"token": token}