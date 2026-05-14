from pydantic import BaseModel


class GroupCreate(BaseModel):
    name: str

class GroupUpdate(BaseModel):
    name: str | None = None

class GroupResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True