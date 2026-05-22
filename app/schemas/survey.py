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
    totalScore: float | None = Field(default=None, ge=0)
    riskLevel: str | None = None
    categoryScores: dict[str, float] | None = None
    responses: DementiaRiskSurveyResponses | list[SurveyAnswerItem]

    def response_count(self) -> int:
        if isinstance(self.responses, list):
            return len(self.responses)
        return self.responses.answered_count()

    def raw_responses(self) -> Any:
        if isinstance(self.responses, list):
            return [item.model_dump(exclude_none=True) for item in self.responses]
        return self.responses.model_dump(exclude_none=True)

    def normalized_responses(self) -> dict[str, Any]:
        if isinstance(self.responses, list):
            return {item.questionId: item.answer for item in self.responses}
        return self.responses.model_dump(exclude_none=True)


class ToolScoreBreakdown(BaseModel):
    rawScore: float
    normalizedScore: float
    matchedFactors: dict[str, float]


class DementiaSurveySubmitResponse(BaseModel):
    surveyId: str
    surveyType: str
    totalScore: float | None = None
    riskLevel: str | None = None
    finalRiskScore: float | None = None
    cogdrisk: ToolScoreBreakdown | None = None
    anuAdri: ToolScoreBreakdown | None = None
    submittedAt: datetime
