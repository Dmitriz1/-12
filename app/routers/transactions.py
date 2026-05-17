import csv
import io
from datetime import datetime
from typing import Literal, Optional

import openpyxl
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.transaction_service import TransactionService
from app.routers.auth import auth_required

router = APIRouter(prefix="/transactions")

_HEADERS = ["id", "title", "type", "category", "amount", "created_at"]


@router.post("/")
async def create(data: TransactionCreate, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.create_transaction(data.model_dump(), user_id)


@router.get("/")
async def get_all(
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
    category: Optional[str] = None,
    dt_from: Optional[datetime] = None,
    dt_to: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
):
    return await service.get_transactions(
        user_id, category=category, dt_from=dt_from, dt_to=dt_to,
        limit=limit, offset=offset,
    )


@router.get("/export")
async def export(
    format: Literal["csv", "xlsx"] = "csv",
    service: TransactionService = Depends(),
    user_id: int = Depends(auth_required),
    category: Optional[str] = None,
    dt_from: Optional[datetime] = None,
    dt_to: Optional[datetime] = None,
):
    rows = await service.get_transactions(user_id, category=category, dt_from=dt_from, dt_to=dt_to)

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


@router.delete("/{tx_id}")
async def delete(tx_id: int, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.delete_transaction(tx_id=tx_id, user_id=user_id)


@router.patch("/{tx_id}")
async def update(tx_id: int, data: TransactionUpdate, service: TransactionService = Depends(), user_id: int = Depends(auth_required)):
    return await service.update_transaction(data=data.model_dump(exclude_unset=True), tx_id=tx_id, user_id=user_id)
