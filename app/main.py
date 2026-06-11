from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import close_db, connect_db, get_db_status, is_db_connected
from app.routers import ai
from app.routers import auth
from app.routers import avatar
from app.routers import chatbot
from app.routers import mypage
from app.routers import risk_assessment
from app.routers import routines
from app.routers import social_auth
from app.routers import survey
from app.routers import training

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Connecting to database...")
    await connect_db()
    if not is_db_connected():
        logger.critical("=" * 80)
        logger.critical("!!! 데이터베이스 연결 실패 !!!")
        logger.critical("MongoDB 서버가 실행 중인지, .env 파일의 MONGODB_URL이 올바른지 확인해주세요.")
        logger.critical(f"설정된 MONGODB_URL: {settings.mongodb_url}")
        logger.critical("=" * 80)
    else:
        logger.info("Database connection successful.")
        from app.services.users import seed_dev_user

        await seed_dev_user()
    yield
    logger.info("Closing database connection...")
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
app.include_router(
    risk_assessment.router,
    prefix="/risk-assessment",
    tags=["risk_assessment"],
)


@app.get("/health")
async def health():
    return {"ok": True, "database": get_db_status()}
