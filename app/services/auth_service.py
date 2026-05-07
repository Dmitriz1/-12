from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.core.security import create_token


def register_user(db: Session, username: str, password: str):
    existing = db.query(User).filter(User.username == username).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(username=username, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(db: Session, username: str, password: str):
    user = db.query(User).filter(
        User.username == username,
        User.password == password
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user.id)
    return token