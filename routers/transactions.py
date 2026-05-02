from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.transaction import TransactionCreate
from app.services.transaction_service import *
from app.routers.auth import auth_required

router = APIRouter(prefix="/transactions")


@router.post("/")
def create(data: TransactionCreate, db: Session = Depends(get_db), user_id: int = Depends(auth_required)):
    return create_transaction(db, data.dict(), user_id)


@router.get("/")
def get_all(db: Session = Depends(get_db), user_id: int = Depends(auth_required)):
    return get_transactions(db, user_id)