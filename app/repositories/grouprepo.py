from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.models.group import Group
from app.database import get_db

class GroupRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db


    async def create(self, name: str, user_id: int) -> Group:
        group = Group(name=name, owner_id=user_id)
        self.db.add(group)
        await self.db.commit()
        await self.db.refresh(group)
        return group


    async def get_all(self, user_id: int) -> list[Group]:
        groups = await self.db.execute(select(Group).where(Group.owner_id == user_id))
        return groups.scalars().all()
    
    async def delete(self, group_id: int, user_id: int) -> bool:
        result = await self.db.execute(select(Group).where(Group.id == group_id, Group.owner_id == user_id))
        group = result.scalar_one_or_none()

        if group:
            await self.db.delete(group)
            await self.db.commit()
            return True
        
        return False

    async def update(self, data: dict, group_id: int, user_id: int) -> bool | Group:
        result = await self.db.execute(select(Group).where(Group.id == group_id, Group.owner_id == user_id))
        group = result.scalar_one_or_none()

        if group:
            for key, value in data.items():
                setattr(group, key, value)

            await self.db.commit()
            await self.db.refresh(group)
            return group

        return False