from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends

from app.core.security import create_token
from app.repositories.userrepo import UserRepository

class AuthService:
    def __init__(self, user_repo: UserRepository = Depends()):
        self.user_repo = user_repo

    async def register_user(self, username: str, password: str):
        existing = await self.user_repo.get_by_name(username)

        if existing:
            raise HTTPException(status_code=400, detail="User already exists")

        # СОЗДАЕМ И ВОЗВРАЩАЕМ ПОЛЬЗОВАТЕЛЯ
        user = await self.user_repo.create(username=username, password=password)
        return user  # <-- ЭТО СТРОКА БЫЛА ПРОПУЩЕНА

    async def login_user(self, username: str, password: str):
        user = await self.user_repo.get_by_name_and_password(username=username, password=password)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(user.id)
        return token