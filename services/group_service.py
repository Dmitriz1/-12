from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.group import Group


def create_group(db: Session, name: str, user_id: int):
    group = Group(name=name, owner_id=user_id)

    db.add(group)
    db.commit()
    db.refresh(group)

    return group


def get_groups(db: Session, user_id: int):
    return db.query(Group).filter(Group.owner_id == user_id).all()


def delete_group(db: Session, group_id: int, user_id: int):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.owner_id == user_id
    ).first()

    if not group:
        raise HTTPException(404, "Group not found")

    db.delete(group)
    db.commit()

    return {"message": "deleted"}