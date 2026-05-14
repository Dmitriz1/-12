from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
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