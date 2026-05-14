from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.transaction_service import TransactionService
from app.routers.auth import auth_required

router = APIRouter(prefix="/transactions")

@router.post("/")
async def create(data: TransactionCreate, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.create_transaction(data.dict(), user_id)

@router.delete("/{tx_id}")
async def delete(tx_id: int, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.delete_transaction(tx_id=tx_id, user_id=user_id)

@router.patch("/{tx_id}")
async def update(tx_id:int, data: TransactionUpdate, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.update_transaction(data=data.model_dump(exclude_unset=True), tx_id=tx_id, user_id=user_id)

@router.get("/")
async def get_all(service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.get_transactions(user_id)