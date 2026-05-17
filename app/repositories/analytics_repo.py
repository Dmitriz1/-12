from datetime import datetime

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.transaction import Transaction


class AnalyticsRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def aggregate_by_category(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
    ):
        stmt = (
            select(
                Transaction.category,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.created_at >= dt_from,
                Transaction.created_at <= dt_to,
            )
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount).desc())
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def aggregate_timeline(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
        granularity: str,
    ):
        bucket = func.date_trunc(granularity, Transaction.created_at).label("bucket")
        stmt = (
            select(
                bucket,
                Transaction.type,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.created_at >= dt_from,
                Transaction.created_at <= dt_to,
            )
            .group_by(bucket, Transaction.type)
            .order_by(bucket)
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def total_by_type(
        self,
        user_id: int,
        dt_from: datetime,
        dt_to: datetime,
    ):
        stmt = (
            select(
                Transaction.type,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.created_at >= dt_from,
                Transaction.created_at <= dt_to,
            )
            .group_by(Transaction.type)
        )
        result = await self.db.execute(stmt)
        return result.all()
