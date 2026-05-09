from datetime import datetime

from pydantic import BaseModel, Field


class SurveyAnswerItem(BaseModel):
    questionId: str
    answer: str


class DementiaSurveySubmitRequest(BaseModel):
    surveyType: str = Field(default="dementia-risk")
    totalScore: int = Field(ge=0)
    riskLevel: str
    categoryScores: dict[str, int]
    responses: list[SurveyAnswerItem] = Field(min_length=1)


class DementiaSurveySubmitResponse(BaseModel):
    surveyId: str
    surveyType: str
    totalScore: int
    riskLevel: str
    submittedAt: datetime
