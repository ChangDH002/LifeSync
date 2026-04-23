from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None

    model_config = {"from_attributes": True}


class UserDB(BaseModel):
    id: str
    name: str | None = None
    email: EmailStr
    password_hash: str

    model_config = {"from_attributes": True}


UserOut = UserProfile

