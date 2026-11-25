from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import group, transaction, user
from app.routers import ai, analytics, auth, groups, transactions
from app.handlers import exceptions
from app.exceptions import custom_exceptions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(groups.router)
app.include_router(analytics.router)
app.include_router(ai.router)

app.add_exception_handler(custom_exceptions.NotFoundError, exceptions.not_found_handler)
app.add_exception_handler(RequestValidationError, exceptions.validation_error_handler)
app.add_exception_handler(custom_exceptions.BadRequestError, exceptions.bad_request_error_handler)
app.add_exception_handler(custom_exceptions.UnauthorizedError, exceptions.unauthorized_error_handler)
app.add_exception_handler(custom_exceptions.ConflictError, exceptions.conflict_error_handler)
