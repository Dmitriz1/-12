from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth")

# TODO: ЗАГЛУШКА! Изменить когда начнем работать с фронт-эндом
def auth_required(db: Session = Depends(get_db)):
    user_id = db.query(User).first().id
    return user_id

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, data.username, data.password)
    return {"id": user.id}


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, data.username, data.password)
    return {"token": token}