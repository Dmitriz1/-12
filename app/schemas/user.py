from pydantic import BaseModel, ConfigDict, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=128)


class UserRefreshToken(BaseModel):
    token: str


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    password: str | None = Field(default=None, min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True)


class UserResponseMetaData(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
