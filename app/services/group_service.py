from fastapi import Depends, HTTPException, status, Query

from app.models.group import Group
from app.repositories.grouprepo import GroupRepository
from app.schemas.group import GroupResponseMetaData
from app.exceptions.custom_exceptions import NotFoundError, BadRequestError


class GroupService:
    allowed_sort_fields = ["id", "name", "owner_id"]

    def __init__(self, group_repo: GroupRepository = Depends()):
        self.group_repo = group_repo

    async def create_group(self, name: str, user_id: int) -> Group:
        return await self.group_repo.create(name, user_id)
    
    async def get_groups(
        self, 
        user_id: int,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
        search: str | None = None,
    ) -> GroupResponseMetaData:
        
        if sort_by not in self.allowed_sort_fields:
            raise BadRequestError(f"Invalid sort field {sort_by}", "sort_by")
        
        groups, total = await self.group_repo.get_all(
            user_id,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search,
        )
        return{
        "items":
        [
            {
                "id": g.id,
                "name": g.name,
                "owner_id": g.owner_id
            }
            for g in groups
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
        }

    async def get_group(self, group_id: int, user_id: int) -> Group:
        group = await self.group_repo.get_by_id(group_id, user_id)
        if group is None:
            raise NotFoundError("Group", group_id)
        return group

    async def replace_group(
        self, data: dict, group_id: int, user_id: int
    ) -> Group:
        updated = await self.group_repo.update(data, group_id, user_id)
        if updated is None:
            raise NotFoundError("Group", group_id)
        return updated

    async def update_group(
        self, data: dict, group_id: int, user_id: int
    ) -> Group:
        updated = await self.group_repo.update(data, group_id, user_id)
        if updated is None:
            raise NotFoundError("Group", group_id)
        return updated

    async def delete_group(self, group_id: int, user_id: int) -> None:
        deleted = await self.group_repo.delete(group_id, user_id)
        if not deleted:
            raise NotFoundError("Group", group_id)