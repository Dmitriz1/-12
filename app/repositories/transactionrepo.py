from datetime import datetime
from typing import Optional

from fastapi import Depends
from sqlalchemy import select, func, or_
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

    def _filters(
        self,
        user_id: int,
        type: Optional[str] = None,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
        search: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> list:
        filters = [Transaction.user_id == user_id]
        if type:
            filters.append(Transaction.type == type)
        if category:
            filters.append(Transaction.category == category)
        if dt_from:
            filters.append(Transaction.created_at >= dt_from)
        if dt_to:
            filters.append(Transaction.created_at <= dt_to)
        if min_amount is not None:
            filters.append(Transaction.amount >= min_amount)
        if max_amount is not None:
            filters.append(Transaction.amount <= max_amount)
        if search:
            escaped = (
                search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            )
            pattern = f"%{escaped}%"
            filters.append(
                or_(
                    Transaction.title.ilike(pattern, escape="\\"),
                    Transaction.category.ilike(pattern, escape="\\"),
                )
            )
        return filters

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
        search: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> tuple[list[Transaction], int]:
        filters = self._filters(
            user_id,
            type=type,
            category=category,
            dt_from=dt_from,
            dt_to=dt_to,
            search=search,
            min_amount=min_amount,
            max_amount=max_amount,
        )

        sort_colums = {
            "id": Transaction.id,
            "title": Transaction.title,
            "category": Transaction.category,
            "amount": Transaction.amount,
            "created_at": Transaction.created_at
        }
        column = sort_colums[sort_by]

        total = await self.db.execute(
            select(func.count(Transaction.id)).where(*filters)
        )
        query = (
            select(Transaction)
            .where(*filters)
            .order_by(column.desc() if sort_order == "desc" else column.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all()), total.scalar_one()

    async def get_for_export(
        self,
        user_id: int,
        category: Optional[str] = None,
        dt_from: Optional[datetime] = None,
        dt_to: Optional[datetime] = None,
    ) -> list[Transaction]:
        filters = self._filters(
            user_id, category=category, dt_from=dt_from, dt_to=dt_to
        )
        result = await self.db.execute(
            select(Transaction)
            .where(*filters)
            .order_by(Transaction.created_at.desc())
        )
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