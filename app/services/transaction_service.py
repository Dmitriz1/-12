from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status

from app.core.cache import cache
from app.core.redis import redis_client
from app.models.transaction import Transaction
from app.repositories.transactionrepo import TransactionRepository


class TransactionService:
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
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict]:
        txs = await self.tx_repo.get_all_transactions(
            user_id,
            category=category,
            dt_from=dt_from,
            dt_to=dt_to,
            limit=limit,
            offset=offset,
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
            for t in txs
        ]

    async def get_transaction(self, tx_id: int, user_id: int) -> Transaction:
        tx = await self.tx_repo.get_by_id(tx_id, user_id)
        if tx is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        return tx

    async def replace_transaction(
        self, data: dict, tx_id: int, user_id: int
    ) -> Transaction:
        updated = await self.tx_repo.update(data, tx_id, user_id)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        await redis_client.flushdb()
        return updated

    async def update_transaction(
        self, data: dict, tx_id: int, user_id: int
    ) -> Transaction:
        updated = await self.tx_repo.update(data, tx_id, user_id)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        await redis_client.flushdb()
        return updated

    async def delete_transaction(self, tx_id: int, user_id: int) -> None:
        deleted = await self.tx_repo.delete(tx_id, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        await redis_client.flushdb()