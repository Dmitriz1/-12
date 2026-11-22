from datetime import datetime
from typing import Optional

from fastapi import Depends
from sqlalchemy import select, func
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
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
        type: Optional[str] = None,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
    ) -> tuple[list[Transaction], int]:
        query = select(Transaction).where(Transaction.user_id == user_id)
        query_count = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        if type:
            query = query.where(Transaction.type == type)
            query_count = query_count.where(Transaction.type == type)
        if category:
            query = query.where(Transaction.category == category)
            query_count = query_count.where(Transaction.category == category)    
        if dt_from:
            query = query.where(Transaction.created_at >= dt_from)
            query_count = query_count.where(Transaction.created_at >= dt_from)
        if dt_to:
            query = query.where(Transaction.created_at <= dt_to)
            query_count = query_count.where(Transaction.created_at <= dt_to)

        sort_colums = {
            "id": Transaction.id,
            "title": Transaction.title,
            "category": Transaction.category,
            "amount": Transaction.amount,
            "created_at": Transaction.created_at
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