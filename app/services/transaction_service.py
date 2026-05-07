from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.transaction import Transaction
from app.core.redis import redis_client
from app.core.cache import cache


def create_transaction(db: Session, data: dict, user_id: int):
    tx = Transaction(**data, user_id=user_id)

    db.add(tx)
    db.commit()
    db.refresh(tx)

    redis_client.flushdb()
    return tx


@cache(ttl=120)
def get_transactions(db: Session, user_id: int):
    txs = db.query(Transaction).filter(Transaction.user_id == user_id).all()

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


def delete_transaction(db: Session, tx_id: int, user_id: int):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == user_id
    ).first()

    if not tx:
        raise HTTPException(404, "Transaction not found")

    db.delete(tx)
    db.commit()

    redis_client.flushdb()
    return {"message": "deleted"}