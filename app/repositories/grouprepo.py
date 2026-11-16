from typing import Optional

from fastapi import Depends
from sqlalchemy import select, func
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
        self, 
        user_id: int,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[Group], int]:
        query=select(Group).where(Group.owner_id == user_id)
        query_count=select(func.count(Group.id)).where(Group.owner_id == user_id)

        sort_colums = {
            "id": Group.id,
            "name": Group.name,
            "owner_id": Group.owner_id,
            "owner": Group.owner
        }
        column = sort_colums[sort_by]
        if sort_order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        total = await self.db.execute(query_count)
        return list(result.scalars().all()), total.scalar_one()

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