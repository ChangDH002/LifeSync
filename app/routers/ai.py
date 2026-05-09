from fastapi import APIRouter

from app.schemas.ai import AIHealthResponse, PersonaRequest, PersonaResponse
from app.services import gemini_service, sbert_retriever
from app.services.persona_service import (
    determine_persona,
    get_persona_description,
    get_secondary_risk_factors,
)
from app.services.recommendation_service import (
    get_cognitive_trainings,
    get_daily_routines,
    get_lifestyle_tips,
)
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
    daily_routines = get_daily_routines(persona)
    cognitive_trainings = get_cognitive_trainings(persona)
    lifestyle_tips = get_lifestyle_tips(persona)

    return PersonaResponse(
        persona=persona,
        personaDescription=persona_description,
        mainRiskFactors=body.mainRiskFactors,
        secondaryRiskFactors=secondary,
        dailyRoutines=daily_routines,
        cognitiveTrainings=cognitive_trainings,
        lifestyleTips=lifestyle_tips,
        safetyNotice=SAFETY_NOTICE,
    )
