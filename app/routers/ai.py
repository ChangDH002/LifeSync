from fastapi import APIRouter, Depends
from pydantic import BaseModel # New import for InitialChatResponse

from app.schemas.ai import AIHealthResponse, PersonaRequest, PersonaResponse, ActionableRecommendation # ActionableRecommendation new
from app.services import actionable_recommendation, gemini_service, sbert_retriever
from app.services.persona_service import (
    determine_persona,
    get_persona_description,
    get_secondary_risk_factors,
)
from app.core.dependencies import get_current_user_id
from app.services.survey import get_latest_dementia_risk_survey # New import
from app.services.gemini_service import SAFETY_NOTICE

router = APIRouter()

@router.get("/health", response_model=AIHealthResponse)
async def ai_health() -> AIHealthResponse:
    from app.core.config import settings

    gemini_ok = gemini_service.is_gemini_available()
    sbert_ok = sbert_retriever.is_sbert_available()
    row_count = sbert_retriever.get_dataset_row_count()

    return AIHealthResponse(
        geminiConfigured=gemini_ok,
        geminiModel=settings.gemini_model,
        sbertAvailable=sbert_ok,
        fallbackMode=not gemini_ok,
        datasetLoaded=row_count > 0,
        datasetRows=row_count,
    )

@router.post("/persona", response_model=PersonaResponse)
async def generate_persona(body: PersonaRequest) -> PersonaResponse:
    persona = determine_persona(
        main_risk_factors=body.mainRiskFactors,
        survey_summary=body.surveySummary,
    )

    persona_description = get_persona_description(persona)
    secondary = get_secondary_risk_factors(persona, body.mainRiskFactors)

    # 새로운 맞춤형 실천 과제 추천 로직 사용
    recommendations = actionable_recommendation.get_recommendations_for_factors(
        main_risk_factors=body.mainRiskFactors, limit=3
    )

    return PersonaResponse(
        persona=persona,
        personaDescription=persona_description,
        mainRiskFactors=body.mainRiskFactors,
        secondaryRiskFactors=secondary,
        actionableRecommendations=recommendations,
        safetyNotice=SAFETY_NOTICE,
    )


# New schema for the initial chat response
class InitialChatResponse(BaseModel):
    initialMessage: str


@router.get("/chat/initiate", response_model=InitialChatResponse)
async def initiate_chat(
    user_id: str = Depends(get_current_user_id),
) -> InitialChatResponse:
    """
    사용자의 최근 설문 결과를 바탕으로 AI 챗봇의 초기 대화 메시지를 생성합니다.
    """
    latest_survey = await get_latest_dementia_risk_survey(user_id)

    if latest_survey and latest_survey.persona and latest_survey.main_risk_factors:
        # Extract relevant info from survey
        persona = latest_survey.persona
        risk_level = latest_survey.risk_level
        main_risk_factors = latest_survey.main_risk_factors
        
        # Get actionable recommendations based on the survey's main risk factors
        actionable_recs_data = actionable_recommendation.get_recommendations_for_factors(
            main_risk_factors=main_risk_factors, limit=2
        )
        
        initial_message = build_initial_chat_message(
            persona=persona,
            risk_level=risk_level,
            main_risk_factors=main_risk_factors,
            actionable_recommendations=actionable_recs_data,
        )
    else:
        initial_message = "안녕하세요! LifeSync AI 코치입니다. 아직 설문을 완료하지 않으셨네요. 설문을 완료하시면 더 맞춤화된 도움을 드릴 수 있습니다. 무엇을 도와드릴까요? " + SAFETY_NOTICE

    return InitialChatResponse(initialMessage=initial_message)
