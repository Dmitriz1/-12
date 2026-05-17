from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends

from app.repositories.transactionrepo import TransactionRepository
from app.core.redis import redis_client
from app.core.cache import cache

class TransactionService:
    def __init__(self, tx_repo: TransactionRepository = Depends()):
        self.tx_repo = tx_repo

    async def create_transaction(self, data: dict, user_id: int):
        tx = await self.tx_repo.create(data, user_id)

        await redis_client.flushdb()
        return tx


    @cache(ttl=120)
    async def get_transactions(self, user_id: int):
        txs = await self.tx_repo.get_all_transactions(user_id)

        return [
            {
                "id": t.id,
                "title": t.title,
                "type": t.type,
                "category": t.category,
                "amount": t.amount,
                "created_at": t.created_at
            }
            for t in txs
        ]


    async def delete_transaction(self, tx_id: int, user_id: int):
        deleted = await self.tx_repo.delete(tx_id, user_id)

        if not deleted:
            raise HTTPException(404, "Transaction not found")

        await redis_client.flushdb()
        return {"message": "deleted"}

    async def update_transaction(self, data: dict, tx_id: int, user_id: int):
        updated = await self.tx_repo.update(data, tx_id, user_id)

        if not updated:
            raise HTTPException(404, "Transaction not found")

        await redis_client.flushdb()
        return updated