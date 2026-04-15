from pydantic import BaseModel, EmailStr


class UserPublic(BaseModel):
    id: str
    username: str
    email: EmailStr

    model_config = {"from_attributes": True}


class UserDB(BaseModel):
    id: str
    username: str
    email: EmailStr
    password_hash: str

    model_config = {"from_attributes": True}


UserOut = UserPublic
