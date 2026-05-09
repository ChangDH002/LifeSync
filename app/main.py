from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import close_db, connect_db
from app.routers import ai
from app.routers import auth
from app.routers import avatar
from app.routers import chatbot
from app.routers import mypage
from app.routers import routines
from app.routers import social_auth
from app.routers import survey
from app.routers import training


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="Backend API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(social_auth.router, prefix="/auth/social", tags=["social_auth"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
app.include_router(training.router, prefix="/training", tags=["training"])
app.include_router(survey.router, prefix="/survey", tags=["survey"])
app.include_router(avatar.router, prefix="/avatar", tags=["avatar"])
app.include_router(mypage.router, prefix="/mypage", tags=["mypage"])
app.include_router(routines.router, prefix="/routines", tags=["routines"])


@app.get("/health")
async def health():
    return {"ok": True}
