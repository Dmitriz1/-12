import csv
import io
from datetime import datetime
from typing import Literal, Optional

import openpyxl
from fastapi import APIRouter, Depends, status, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.routers.auth import auth_required
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
    TransactionResponseMetaData
)
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])

_HEADERS = ["id", "title", "type", "category", "amount", "created_at"]


@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать транзакцию",
)
async def create(
    data: TransactionCreate,
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.create_transaction(data.model_dump(), user_id)


@router.get(
    "/",
    response_model=TransactionResponseMetaData,
    summary="Список транзакций (пагинация + сортировка + фильтры + поиск + метаданные)",
)
async def get_all(
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort_by: str = Query("created_at", description="Поле сортировки"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    category: Optional[str] = None,
    dt_from: Optional[datetime] = None,
    dt_to: Optional[datetime] = None,
    type: Optional[str] = Query(None, pattern="^(income|expense)$"),
    search: Optional[str] = Query(None, min_length=2),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
):
    return await service.get_transactions(
        user_id,
        category=category,
        dt_from=dt_from,
        dt_to=dt_to,
        type=type,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=per_page,
        search=search,
        min_amount=min_amount,
        max_amount=max_amount,
    )


@router.get("/export", summary="Экспорт транзакций (CSV/XLSX)")
async def export(
    format: Literal["csv", "xlsx"] = "csv",
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
    category: Optional[str] = None,
    dt_from: Optional[datetime] = None,
    dt_to: Optional[datetime] = None,
):
    rows = await service.get_transactions_for_export(
        user_id,
        category=category,
        dt_from=dt_from,
        dt_to=dt_to,
    )

    if format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=_HEADERS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions.csv"},
        )

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(_HEADERS)
    for row in rows:
        ws.append([row.get(h) for h in _HEADERS])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=transactions.xlsx"},
    )


@router.get(
    "/{tx_id}",
    response_model=TransactionResponse,
    summary="Получить транзакцию по id",
)
async def get_one(
    tx_id: int,
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.get_transaction(tx_id=tx_id, user_id=user_id)


@router.put(
    "/{tx_id}",
    response_model=TransactionResponse,
    summary="Полностью заменить транзакцию",
)
async def replace(
    tx_id: int,
    data: TransactionCreate,
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.replace_transaction(
        data=data.model_dump(),
        tx_id=tx_id,
        user_id=user_id,
    )


@router.patch(
    "/{tx_id}",
    response_model=TransactionResponse,
    summary="Частично обновить транзакцию",
)
async def update(
    tx_id: int,
    data: TransactionUpdate,
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
):
    return await service.update_transaction(
        data=data.model_dump(exclude_unset=True),
        tx_id=tx_id,
        user_id=user_id,
    )


@router.delete(
    "/{tx_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить транзакцию",
)
async def delete(
    tx_id: int,
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
):
    await service.delete_transaction(tx_id=tx_id, user_id=user_id)