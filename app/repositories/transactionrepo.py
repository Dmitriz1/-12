from datetime import datetime
from typing import Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.transaction import Transaction


class TransactionRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def create(self, data: dict, user_id: int) -> Transaction:
        transaction = Transaction(**data, user_id=user_id)
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def get_by_id(
        self, tx_id: int, user_id: int
    ) -> Optional[Transaction]:
        result = await self.db.execute(
            select(Transaction).where(
                Transaction.id == tx_id,
                Transaction.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_all_transactions(
        self,
        user_id: int,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Transaction]:
        query = select(Transaction).where(Transaction.user_id == user_id)
        if category:
            query = query.where(Transaction.category == category)
        if dt_from:
            query = query.where(Transaction.created_at >= dt_from)
        if dt_to:
            query = query.where(Transaction.created_at <= dt_to)
        query = (
            query.order_by(Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(
        self, data: dict, tx_id: int, user_id: int
    ) -> Optional[Transaction]:
        transaction = await self.get_by_id(tx_id, user_id)
        if transaction is None:
            return None
        for key, value in data.items():
            setattr(transaction, key, value)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def delete(self, tx_id: int, user_id: int) -> bool:
        transaction = await self.get_by_id(tx_id, user_id)
        if transaction is None:
            return False
        await self.db.delete(transaction)
        await self.db.commit()
        return True