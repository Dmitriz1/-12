from sqlalchemy import select
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.database import get_db

class TransactionRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def create(self, data: dict, user_id: int) -> Transaction:
        transaction = Transaction(**data, user_id = user_id)
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def get_all_transactions(self, user_id: int) -> list[Transaction]:
        transactions = await self.db.execute(select(Transaction).where(Transaction.user_id == user_id))
        return transactions.scalars().all()
    
    async def delete(self, tx_id: int, user_id: int) -> bool:
        result = await self.db.execute(select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == user_id))
        transaction = result.scalar_one_or_none()

        if transaction:
            await self.db.delete(transaction)
            await self.db.commit()
            return True
        
        return False

    async def update(self, data: dict, tx_id: int, user_id: int) -> bool | Transaction:
        result = await self.db.execute(select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == user_id))
        transaction = result.scalar_one_or_none()

        if transaction:
            for key, value in data.items():
                setattr(transaction, key, value)

            await self.db.commit()
            await self.db.refresh(transaction)
            return transaction

        return False