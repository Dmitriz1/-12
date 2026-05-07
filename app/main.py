from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, transactions, groups

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(groups.router)