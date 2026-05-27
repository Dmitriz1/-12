from fastapi import HTTPException, Depends

from app.core.security import create_token, sessions
from app.repositories.userrepo import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository = Depends()):
        self.user_repo = user_repo

    async def register_user(self, username: str, password: str):
        existing = await self.user_repo.get_by_name(username)
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        return await self.user_repo.create(username=username, password=password)

    async def login_user(self, username: str, password: str):
        user = await self.user_repo.get_by_name_and_password(username=username, password=password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return create_token(user.id)

    async def change_password(self, user_id: int, old_password: str, new_password: str):
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.password != old_password:
            raise HTTPException(status_code=401, detail="Invalid current password")
        await self.user_repo.update_password(user_id, new_password)

    async def refresh_token(self, token: str):
        user_id = sessions.get(token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        sessions.pop(token, None)
        return create_token(user_id)