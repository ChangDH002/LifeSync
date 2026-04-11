from fastapi import APIRouter, HTTPException, Request, status
from pymongo.errors import DuplicateKeyError

from app.schemas.user import LoginBody, RegisterBody, UserOut
from app.services import users as users_service

router = APIRouter()


def _user_to_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        username=doc.get("username", ""),
        email=doc["email"],
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody) -> UserOut:
    if await users_service.get_user_by_email(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    if await users_service.get_user_by_username(body.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    try:
        doc = await users_service.create_user(
            body.username, body.email, body.password
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered",
        ) from None
    return _user_to_out(doc)


@router.post("/login", response_model=UserOut)
async def login(request: Request, body: LoginBody) -> UserOut:
    doc = await users_service.get_user_by_username(body.username)
    if doc is None or not users_service.verify_password(
        body.password, doc["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    request.session["user_id"] = str(doc["_id"])
    return _user_to_out(doc)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request) -> None:
    request.session.clear()


@router.get("/me", response_model=UserOut)
async def me(request: Request) -> UserOut:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    doc = await users_service.get_user_by_id(user_id)
    if doc is None:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return _user_to_out(doc)
