from datetime import datetime
from typing import AsyncIterator, Awaitable, Callable

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models.transaction import Transaction
from app.models.user import User


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _create_tables() -> AsyncIterator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest_asyncio.fixture(autouse=True)
async def _clean_db() -> AsyncIterator[None]:
    async with SessionLocal() as session:
        await session.execute(
            text("TRUNCATE transactions, users, groups RESTART IDENTITY CASCADE")
        )
        await session.commit()
    yield


@pytest_asyncio.fixture
async def db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def user(db: AsyncSession) -> User:
    instance = User(username="test", password="test")
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance


@pytest_asyncio.fixture
async def make_tx(
    db: AsyncSession, user: User,
) -> Callable[..., Awaitable[Transaction]]:
    async def _make(
        title: str,
        type_: str,
        category: str,
        amount: float,
        created_at: datetime,
    ) -> Transaction:
        tx = Transaction(
            title=title,
            type=type_,
            category=category,
            amount=amount,
            user_id=user.id,
            created_at=created_at,
        )
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        return tx

    return _make


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
