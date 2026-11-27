from typing import Optional

from fastapi import Depends
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.group import Group
from app.models.transaction import Transaction
from app.models.user import User


def _like_pattern(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    )
    return f"%{escaped}%"


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
        result = await self.db.execute(
            select(User).where(User.username == user_name)
        )
        return result.scalar_one_or_none()

    async def get_by_name_and_password(
        self, username: str, password: str
    ) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(
                User.username == username,
                User.password == password,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
        search: Optional[str] = None,
    ) -> tuple[list[User], int]:
        query = select(User)
        query_count = select(func.count(User.id))

        if search:
            pattern = _like_pattern(search)
            condition = User.username.ilike(pattern, escape="\\")
            if search.isdigit():
                condition = or_(condition, User.id == int(search))
            query = query.where(condition)
            query_count = query_count.where(condition)

        sort_columns = {
            "id": User.id,
            "username": User.username,
        }
        column = sort_columns[sort_by]
        query = query.order_by(
            column.desc() if sort_order == "desc" else column.asc()
        )

        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        total = await self.db.execute(query_count)
        return list(result.scalars().all()), total.scalar_one()

    async def update(
        self, data: dict, user_id: int
    ) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if user is None:
            return None
        for key, value in data.items():
            setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if user is None:
            return False
        await self.db.execute(
            delete(Transaction).where(Transaction.user_id == user_id)
        )
        await self.db.execute(delete(Group).where(Group.owner_id == user_id))
        await self.db.delete(user)
        await self.db.commit()
        return True

    async def update_password(
        self, user_id: int, new_password: str
    ) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if user is None:
            return None
        user.password = new_password
        await self.db.commit()
        await self.db.refresh(user)
        return user
