from pydantic import BaseModel
from datetime import datetime


class TransactionCreate(BaseModel):
    title: str
    type: str  # income / expense
    category: str
    amount: float

class TransactionUpdate(BaseModel):
    title: str | None = None
    type: str | None = None
    category: str | None = None
    amount: float | None = None

class TransactionResponse(BaseModel):
    id: int
    title: str
    type: str
    category: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True