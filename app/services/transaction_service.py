from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status

from app.core.cache import cache
from app.core.redis import redis_client
from app.models.transaction import Transaction
from app.repositories.transactionrepo import TransactionRepository
from app.schemas.transaction import TransactionResponseMetaData
from app.exceptions.custom_exceptions import NotFoundError, BadRequestError

class TransactionService:
    allowed_sort_fields = ["id", "title", "category", "amount", "created_at"]

    def __init__(self, tx_repo: TransactionRepository = Depends()):
        self.tx_repo = tx_repo

    async def create_transaction(self, data: dict, user_id: int) -> Transaction:
        tx = await self.tx_repo.create(data, user_id)
        await redis_client.flushdb()
        return tx

    @cache(ttl=120)
    async def get_transactions(
        self,
        user_id: int,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
        type: Optional[str] = None,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
        search: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> TransactionResponseMetaData:
        if sort_by not in self.allowed_sort_fields:
            raise BadRequestError(f"invalid sort field {sort_by}", "sort_by")
        if min_amount is not None and max_amount is not None and min_amount > max_amount:
            raise BadRequestError("min_amount must be less than or equal to max_amount", "min_amount")

        transactions, total = await self.tx_repo.get_all_transactions(
            user_id,
            category=category,
            dt_from=dt_from,
            dt_to=dt_to,
            type=type,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search,
            min_amount=min_amount,
            max_amount=max_amount,
        )
        return {
        "items":
        [
            {
                "id": t.id,
                "title": t.title,
                "type": t.type,
                "category": t.category,
                "amount": t.amount,
                "created_at": t.created_at,
            }
            for t in transactions
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
        }

    async def get_transactions_for_export(
        self,
        user_id: int,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
    ) -> list[dict]:
        transactions = await self.tx_repo.get_for_export(
            user_id, category=category, dt_from=dt_from, dt_to=dt_to
        )
        return [
            {
                "id": t.id,
                "title": t.title,
                "type": t.type,
                "category": t.category,
                "amount": t.amount,
                "created_at": t.created_at,
            }
            for t in transactions
        ]

    async def get_transaction(self, tx_id: int, user_id: int) -> Transaction:
        tx = await self.tx_repo.get_by_id(tx_id, user_id)
        if tx is None:
            raise NotFoundError("Transaction", tx_id)
        return tx

    async def replace_transaction(
        self, data: dict, tx_id: int, user_id: int
    ) -> Transaction:
        updated = await self.tx_repo.update(data, tx_id, user_id)
        if updated is None:
            raise NotFoundError("Transaction", tx_id)
        await redis_client.flushdb()
        return updated

    async def update_transaction(
        self, data: dict, tx_id: int, user_id: int
    ) -> Transaction:
        updated = await self.tx_repo.update(data, tx_id, user_id)
        if updated is None:
            raise NotFoundError("Transaction", tx_id)
        await redis_client.flushdb()
        return updated

    async def delete_transaction(self, tx_id: int, user_id: int) -> None:
        deleted = await self.tx_repo.delete(tx_id, user_id)
        if not deleted:
            raise NotFoundError("Transaction", tx_id)
        await redis_client.flushdb()