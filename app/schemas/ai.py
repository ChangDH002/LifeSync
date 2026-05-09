from pydantic import BaseModel


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
    dailyRoutines: list[str]
    cognitiveTrainings: list[str]
    lifestyleTips: list[str]
    safetyNotice: str
