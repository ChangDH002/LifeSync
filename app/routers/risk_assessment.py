from typing import Literal

from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user_id
from app.schemas.risk_assessment import (
    ANUADRIInput,
    ANUADRIResult,
    CogDriskInput,
    CogDriskResult,
    RiskAssessmentHistoryResponse,
)
from app.services.risk_assessment import (
    calculate_anu_adri,
    calculate_cogdrisk,
    list_user_risk_assessments,
    save_risk_assessment,
)

router = APIRouter()

@router.post("/anu-adri/calculate", response_model=ANUADRIResult)
async def calculate_anu_adri_score(
    payload: ANUADRIInput,
    user_id: str = Depends(get_current_user_id),
) -> ANUADRIResult:
    input_data = payload.model_dump()
    result = calculate_anu_adri(input_data)
    response = ANUADRIResult(**result)
    await save_risk_assessment(
        user_id=user_id,
        assessment_type="anu_adri",
        model="anu_adri",
        input_data=input_data,
        result=response.model_dump(),
    )
    return response


@router.post("/cogdrisk/calculate", response_model=CogDriskResult)
async def calculate_cogdrisk_score(
    payload: CogDriskInput,
    model: Literal["any_dementia", "ad"] = Query(default="any_dementia"),
    user_id: str = Depends(get_current_user_id),
) -> CogDriskResult:
    input_data = payload.model_dump()
    result = calculate_cogdrisk(input_data, model=model)
    response = CogDriskResult(**result)
    await save_risk_assessment(
        user_id=user_id,
        assessment_type="cogdrisk",
        model=model,
        input_data=input_data,
        result=response.model_dump(),
    )
    return response


@router.post("/cogdrisk/calculate/both", response_model=dict[str, CogDriskResult])
async def calculate_both_cogdrisk_scores(
    payload: CogDriskInput,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, CogDriskResult]:
    input_data = payload.model_dump()
    response = {
        "any_dementia": CogDriskResult(
            **calculate_cogdrisk(input_data, model="any_dementia")
        ),
        "ad": CogDriskResult(**calculate_cogdrisk(input_data, model="ad")),
    }
    await save_risk_assessment(
        user_id=user_id,
        assessment_type="cogdrisk_both",
        model="both",
        input_data=input_data,
        result={key: value.model_dump() for key, value in response.items()},
    )
    return response


@router.get("/history", response_model=RiskAssessmentHistoryResponse)
async def list_my_risk_assessment_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: str = Depends(get_current_user_id),
) -> RiskAssessmentHistoryResponse:
    records = await list_user_risk_assessments(
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    return RiskAssessmentHistoryResponse(items=records)
