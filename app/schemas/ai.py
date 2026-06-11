from pydantic import BaseModel, Field


class ActionableRecommendation(BaseModel):
    title: str
    description: str
    action_link: str = Field(..., alias="actionLink")
    category: str


class AIHealthResponse(BaseModel):
    geminiConfigured: bool
    geminiModel: str
    sbertAvailable: bool
    fallbackMode: bool
    datasetLoaded: bool
    datasetRows: int


class PersonaRequest(BaseModel):
    riskLevel: str
    riskScore: float = 0.0
    mainRiskFactors: list[str] = []
    surveySummary: str = ""


class PersonaResponse(BaseModel):
    persona: str
    personaDescription: str
    mainRiskFactors: list[str]
    secondaryRiskFactors: list[str]
    actionableRecommendations: list[ActionableRecommendation]
    safetyNotice: str
