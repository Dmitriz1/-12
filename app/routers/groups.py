from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.group import GroupCreate
from app.services.group_service import *
from app.routers.auth import auth_required

router = APIRouter(prefix="/groups")


@router.post("/")
def create(data: GroupCreate, db: Session = Depends(get_db), user_id: int = Depends(auth_required)):
    return create_group(db, data.name, user_id)


@router.get("/")
def get_all(db: Session = Depends(get_db), user_id: int = Depends(auth_required)):
    return get_groups(db, user_id)