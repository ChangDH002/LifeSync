from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

class ToolScoreBreakdown(BaseModel):
    raw_score: float = Field(..., alias="rawScore")
    normalized_score: float = Field(..., alias="normalizedScore")
    matched_factors: dict[str, float] = Field(..., alias="matchedFactors")

class CogDriskScoreDetail(ToolScoreBreakdown):
    pass

class AnuAdriScoreDetail(ToolScoreBreakdown):
    pass


class DementiaSurveySubmitRequest(BaseModel):
    surveyType: str
    surveyVersion: str | None = None
    clientVersion: str | None = None
    totalScore: float | None = None
    riskLevel: str | None = None
    categoryScores: dict[str, float] | None = None
    responses: dict[str, Any]

    def raw_responses(self) -> dict[str, Any]:
        return self.responses

    def normalized_responses(self) -> dict[str, Any]:
        # 클라이언트에서 이미 정규화된 응답을 보낼 수도 있으므로,
        # 여기서는 단순히 `responses`를 반환하거나, 필요시 추가 정규화 로직을 구현
        return self.responses


class DementiaSurveySubmitResponse(BaseModel):
    surveyId: str
    surveyType: str
    surveyVersion: str
    scoringVersion: str
    totalScore: float
    riskLevel: str
    finalRiskScore: float
    categoryScores: dict[str, float]
    mainRiskFactors: list[str] = Field(default_factory=list)
    responseCount: int
    cogdrisk: CogDriskScoreDetail
    anuAdri: AnuAdriScoreDetail
    submittedAt: datetime


class DementiaSurveyResultDocument(BaseModel):
    user_id: str
    survey_type: str
    survey_version: str
    scoring_version: str
    client_version: str | None = None
    total_score: float
    risk_level: str
    final_risk_score: float
    category_scores: dict[str, float]
    responses: dict[str, Any]
    normalized_responses: dict[str, Any]
    ignored_fields: list[str]
    client_submitted: dict[str, Any]
    score_mismatch: bool
    score_delta: float | None
    submission_policy: str
    cogdrisk: CogDriskScoreDetail
    anu_adri: AnuAdriScoreDetail
    persona: str | None = None  # Add persona
    main_risk_factors: list[str] = []  # Add main risk factors
    response_count: int
    submitted_at: datetime
    created_at: datetime


class LatestSurveySummary(BaseModel):
    surveyId: str
    totalScore: float
    riskLevel: str
    categoryScores: dict[str, float]
    submittedAt: datetime
    persona: str | None = None  # Include persona
    mainRiskFactors: list[str] = []  # Include main risk factors


class MypageSummaryResponse(BaseModel):
    userEmail: str
    latestSurvey: LatestSurveySummary | None = None
    # ... other fields ...


class RoutineRecommendation(BaseModel):
    routineId: str
    title: str
    description: str
    category: str
    recommendationReason: str
    frequency: str
    priority: int
    active: bool