from fastapi import Depends, HTTPException, status

from app.models.group import Group
from app.repositories.grouprepo import GroupRepository


class GroupService:
    def __init__(self, group_repo: GroupRepository = Depends()):
        self.group_repo = group_repo

    async def create_group(self, name: str, user_id: int) -> Group:
        return await self.group_repo.create(name, user_id)

    async def get_groups(
        self, user_id: int, limit: int = 100, offset: int = 0
    ) -> list[Group]:
        return await self.group_repo.get_all(
            user_id, limit=limit, offset=offset
        )

    async def get_group(self, group_id: int, user_id: int) -> Group:
        group = await self.group_repo.get_by_id(group_id, user_id)
        if group is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found",
            )
        return group

    async def replace_group(
        self, data: dict, group_id: int, user_id: int
    ) -> Group:
        updated = await self.group_repo.update(data, group_id, user_id)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found",
            )
        return updated

    async def update_group(
        self, data: dict, group_id: int, user_id: int
    ) -> Group:
        updated = await self.group_repo.update(data, group_id, user_id)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found",
            )
        return updated

    async def delete_group(self, group_id: int, user_id: int) -> None:
        deleted = await self.group_repo.delete(group_id, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found",
            )