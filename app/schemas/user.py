from pydantic import BaseModel


class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str


class UserRefreshToken(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True