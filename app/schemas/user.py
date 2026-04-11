from pydantic import BaseModel, EmailStr, Field


class RegisterBody(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="로그인용 아이디",
    )
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="로그인 아이디",
    )
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr

    model_config = {"from_attributes": True}
