from fastapi import Depends

from app.models.user import User
from app.repositories.userrepo import UserRepository
from app.schemas.user import UserResponseMetaData
from app.exceptions.custom_exceptions import (
    BadRequestError,
    ConflictError,
    NotFoundError,
)


class UserService:
    allowed_sort_fields = ["id", "username"]

    def __init__(self, user_repo: UserRepository = Depends()):
        self.user_repo = user_repo

    async def create_user(self, data: dict) -> User:
        existing = await self.user_repo.get_by_name(data["username"])
        if existing is not None:
            raise ConflictError("User already exists", "username")
        return await self.user_repo.create(
            username=data["username"], password=data["password"]
        )

    async def get_users(
        self,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
        search: str | None = None,
    ) -> UserResponseMetaData:
        if sort_by not in self.allowed_sort_fields:
            raise BadRequestError(f"Invalid sort field {sort_by}", "sort_by")

        users, total = await self.user_repo.get_all(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search,
        )
        return {
            "items": [
                {"id": u.id, "username": u.username}
                for u in users
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page,
        }

    async def get_user(self, user_id: int) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User", user_id)
        return user

    async def replace_user(self, data: dict, user_id: int) -> User:
        await self._check_username_is_free(data["username"], user_id)
        updated = await self.user_repo.update(data, user_id)
        if updated is None:
            raise NotFoundError("User", user_id)
        return updated

    async def update_user(self, data: dict, user_id: int) -> User:
        if "username" in data:
            await self._check_username_is_free(data["username"], user_id)
        updated = await self.user_repo.update(data, user_id)
        if updated is None:
            raise NotFoundError("User", user_id)
        return updated

    async def delete_user(self, user_id: int) -> None:
        deleted = await self.user_repo.delete(user_id)
        if not deleted:
            raise NotFoundError("User", user_id)

    async def _check_username_is_free(
        self, username: str, user_id: int
    ) -> None:
        existing = await self.user_repo.get_by_name(username)
        if existing is not None and existing.id != user_id:
            raise ConflictError("User already exists", "username")
