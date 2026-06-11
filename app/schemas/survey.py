from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class SurveyAnswerItem(BaseModel):
    questionId: str
    answer: str
    score: float | None = None


class DementiaRiskSurveyResponses(BaseModel):
    model_config = ConfigDict(extra="forbid")

    age: int | None = Field(default=None, ge=0, le=120)
    sex: Literal["male", "female"] | None = None
    education_level: Literal["high", "medium", "low"] | None = None
    bmi: float | None = None
    high_cholesterol: bool | None = None
    has_diabetes: bool | None = None
    has_stroke: bool | None = None
    has_hypertension: bool | None = None
    has_atrial_fib: bool | None = None
    depression: bool | None = None
    has_tbi: bool | None = None
    loneliness: Literal["low", "medium", "high"] | None = None
    social_engagement: Literal["low", "medium", "high"] | None = None
    insomnia: bool | None = None
    cognitive_activity: Literal["low", "medium", "high"] | None = None
    physical_activity: Literal["low", "medium", "high", "sufficient", "insufficient"] | None = None
    fish_intake: Literal["none", "weekly", "frequent", "daily", "weekly_or_more", "sometimes", "rarely"] | None = None
    smoking_status: Literal["never", "former", "current"] | None = None
    pesticide_exposure: bool | None = None
    alcohol_intake: Literal["none", "light_to_moderate", "high"] | None = None

    def answered_count(self) -> int:
        return len(self.model_dump(exclude_none=True))


class DementiaSurveySubmitRequest(BaseModel):
    surveyType: str = Field(default="dementia-risk")
    surveyVersion: str | None = None
    clientVersion: str | None = None
    totalScore: float | None = Field(default=None, ge=0)
    riskLevel: str | None = None
    categoryScores: dict[str, float] | None = None
    responses: DementiaRiskSurveyResponses | list[SurveyAnswerItem] | dict[str, Any]

    def response_count(self) -> int:
        if isinstance(self.responses, list):
            return len(self.responses)
        if isinstance(self.responses, DementiaRiskSurveyResponses):
            return self.responses.answered_count()
        return len(self.responses)

    def raw_responses(self) -> Any:
        if isinstance(self.responses, list):
            return [item.model_dump(exclude_none=True) for item in self.responses]
        if isinstance(self.responses, DementiaRiskSurveyResponses):
            return self.responses.model_dump(exclude_none=True)
        return self.responses

    def normalized_responses(self) -> dict[str, Any]:
        if isinstance(self.responses, list):
            return {item.questionId: item.answer for item in self.responses}
        if isinstance(self.responses, DementiaRiskSurveyResponses):
            return self.responses.model_dump(exclude_none=True)
        return self.responses


class ToolScoreBreakdown(BaseModel):
    rawScore: float
    normalizedScore: float
    matchedFactors: dict[str, float]


class SurveyScoreToolDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    raw_score: float
    normalized_score: float
    matched_factors: dict[str, float]


class ClientSubmittedSurveyScore(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_score: float | None = None
    risk_level: str | None = None
    category_scores: dict[str, float] | None = None


class DementiaSurveyResultDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    survey_type: str
    survey_version: str
    scoring_version: str
    client_version: str | None = None
    total_score: float
    risk_level: str
    final_risk_score: float
    category_scores: dict[str, float]
    responses: Any
    normalized_responses: dict[str, Any]
    ignored_fields: list[str] = Field(default_factory=list)
    client_submitted: ClientSubmittedSurveyScore
    score_mismatch: bool
    score_delta: float | None = None
    submission_policy: str
    cogdrisk: SurveyScoreToolDocument
    anu_adri: SurveyScoreToolDocument
    response_count: int
    submitted_at: datetime
    created_at: datetime


class DementiaSurveySubmitResponse(BaseModel):
    surveyId: str
    surveyType: str
    surveyVersion: str
    scoringVersion: str
    totalScore: float | None = None
    riskLevel: str | None = None
    finalRiskScore: float | None = None
    categoryScores: dict[str, float] = Field(default_factory=dict)
    responseCount: int
    cogdrisk: ToolScoreBreakdown | None = None
    anuAdri: ToolScoreBreakdown | None = None
    submittedAt: datetime


class DementiaSurveyScoreResponse(BaseModel):
    surveyType: str
    surveyVersion: str
    scoringVersion: str
    totalScore: float
    riskLevel: str
    finalRiskScore: float
    categoryScores: dict[str, float] = Field(default_factory=dict)
    responseCount: int
    cogdrisk: ToolScoreBreakdown
    anuAdri: ToolScoreBreakdown
