from typing import Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.group import Group


class GroupRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def create(self, name: str, user_id: int) -> Group:
        group = Group(name=name, owner_id=user_id)
        self.db.add(group)
        await self.db.commit()
        await self.db.refresh(group)
        return group

    async def get_by_id(
        self, group_id: int, user_id: int
    ) -> Optional[Group]:
        result = await self.db.execute(
            select(Group).where(
                Group.id == group_id,
                Group.owner_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, user_id: int, limit: int = 100, offset: int = 0
    ) -> list[Group]:
        result = await self.db.execute(
            select(Group)
            .where(Group.owner_id == user_id)
            .order_by(Group.id)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update(
        self, data: dict, group_id: int, user_id: int
    ) -> Optional[Group]:
        group = await self.get_by_id(group_id, user_id)
        if group is None:
            return None
        for key, value in data.items():
            setattr(group, key, value)
        await self.db.commit()
        await self.db.refresh(group)
        return group

    async def delete(self, group_id: int, user_id: int) -> bool:
        group = await self.get_by_id(group_id, user_id)
        if group is None:
            return False
        await self.db.delete(group)
        await self.db.commit()
        return True