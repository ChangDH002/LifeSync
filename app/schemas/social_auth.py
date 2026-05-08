from pydantic import BaseModel, Field


class SocialStartResponse(BaseModel):
    url: str
    state: str


class SocialCallbackBody(BaseModel):
    provider: str | None = Field(default=None, description="google|kakao")
    code: str
    state: str | None = None
    redirectUri: str

