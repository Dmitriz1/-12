from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends

from app.repositories.grouprepo import GroupRepository
from app.models.group import Group

class GroupService:
    def __init__(self, group_repo: GroupRepository = Depends()):
        self.group_repo = group_repo


    async def create_group(self, name: str, user_id: int):
        return await self.group_repo.create(name, user_id)


    async def get_groups(self, user_id: int):
        return await self.group_repo.get_all(user_id)


    async def delete_group(self, group_id: int, user_id: int):
        deleted = await self.group_repo.delete(group_id, user_id)

        if not deleted:
            raise HTTPException(404, "Group not found")

        return {"message": "deleted"}