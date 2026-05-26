from datetime import datetime, timezone
from unittest.mock import AsyncMock

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.jwt import create_access_token
from app.routers import survey
from app.schemas.survey import DementiaSurveySubmitResponse


def _app() -> FastAPI:
    app = FastAPI()
    app.include_router(survey.router, prefix="/survey")
    return app


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(subject='user-1')}"}


def _payload() -> dict:
    return {
        "surveyType": "dementia-risk",
        "responses": {
            "age": 70,
            "sex": "female",
            "education_level": "low",
            "has_diabetes": True,
            "physical_activity": "low",
        },
    }


def test_submit_survey_requires_bearer_token():
    client = TestClient(_app())

    response = client.post("/survey/dementia-risk", json=_payload())

    assert response.status_code == 401


def test_submit_survey_returns_server_response(monkeypatch):
    expected = DementiaSurveySubmitResponse(
        surveyId="survey-1",
        surveyType="dementia-risk",
        surveyVersion="dementia-risk-v1",
        scoringVersion="cogdrisk-anuadri-v1",
        totalScore=42.0,
        riskLevel="위험도 보통",
        finalRiskScore=42.0,
        categoryScores={"생활습관": 3.0},
        responseCount=5,
        submittedAt=datetime(2026, 5, 22, tzinfo=timezone.utc),
    )
    save_mock = AsyncMock(return_value=expected)
    monkeypatch.setattr(survey.survey_service, "save_dementia_risk_survey", save_mock)
    client = TestClient(_app())

    response = client.post(
        "/survey/dementia-risk",
        json=_payload(),
        headers=_headers(),
    )

    assert response.status_code == 200
    assert response.json()["surveyId"] == "survey-1"
    save_mock.assert_awaited_once()
    assert save_mock.await_args.kwargs["user_id"] == "user-1"
