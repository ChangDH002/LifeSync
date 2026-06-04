from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserProfile


class RegisterBody(BaseModel):
    name: str = Field(min_length=1, max_length=50, description="이름")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    email: EmailStr = Field(
        description="이메일 로그인",
    )
    password: str = Field(min_length=8, max_length=128)


class AuthSessionResponse(BaseModel):
    accessToken: str
    refreshToken: str | None = None
    user: UserProfile | None = None


class RefreshBody(BaseModel):
    refreshToken: str


