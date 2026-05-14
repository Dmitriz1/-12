from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.transaction import TransactionCreate
from app.services.transaction_service import TransactionService
from app.routers.auth import auth_required

router = APIRouter(prefix="/transactions")

@router.post("/")
async def create(data: TransactionCreate, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.create_transaction(data.dict(), user_id)


@router.get("/")
async def get_all(service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.get_transactions(user_id)