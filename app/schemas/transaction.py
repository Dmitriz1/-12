from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TransactionType = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    type: TransactionType
    category: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    type: TransactionType | None = None
    category: str | None = Field(default=None, min_length=1, max_length=100)
    amount: float | None = Field(default=None, gt=0)


class TransactionResponse(BaseModel):
    id: int
    title: str
    type: TransactionType
    category: str
    amount: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)