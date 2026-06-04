from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "dementia_app"
    require_db_on_startup: bool = False
    secret_key: str = "change-me-in-production"
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expires_minutes: int = 60
    refresh_token_expires_days: int = 14

    # Social login (OAuth)
    google_client_id: str | None = None
    google_client_secret: str | None = None
    kakao_rest_api_key: str | None = None
    kakao_client_secret: str | None = None

    ai_chatbot_url: str = "http://localhost:8001"

    # Gemini AI
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    sbert_model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    sbert_dataset_path: str = "app/data/dementia_question_dataset_7000.csv"

    social_state_secret: str = "change-me-in-production"
    social_state_expires_minutes: int = 10
    social_redirect_allowlist: str = ""
    enable_dev_seed_user: bool = False
    dev_seed_email: str | None = None
    dev_seed_password: str | None = None
    dev_seed_name: str = "개발용 테스트 사용자"

    @property
    def social_redirect_allowlist_list(self) -> list[str]:
        if self.social_redirect_allowlist.strip():
            return [
                o.strip()
                for o in self.social_redirect_allowlist.split(",")
                if o.strip()
            ]
        # Fallback: use CORS origins as allowlist
        return self.cors_origins_list

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
