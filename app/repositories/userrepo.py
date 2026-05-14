from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends

from app.models.user import User
from app.database import get_db

class UserRepository:

    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def create(self, username: str, password: str) -> User:
        user = User(username=username, password=password)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_by_name(self, user_name: str) -> Optional[User]:
        user = await self.db.execute(select(User).where(User.username == user_name))
        return user.scalar_one_or_none()
    
    async def get_by_name_and_password(self, username: str, password: str) -> Optional[User]:
        user = await self.db.execute(select(User).where(User.username == username, User.password == password))
        return user.scalar_one_or_none()