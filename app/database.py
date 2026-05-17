import os

from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@db:5432/app")

engine = create_async_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, class_= AsyncSession, expire_on_commit=False, autoflush=False)

Base = declarative_base()


async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()