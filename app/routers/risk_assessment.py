from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import decode_access_token
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
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        return decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        ) from None


@router.post(
    "/anu-adri/calculate",
    response_model=ANUADRIResult,
    summary="ANU-ADRI 치매 위험 점수 계산",
    description=(
        "ANU-ADRI 위험/보호 인자를 입력받아 총점과 위험 등급을 반환합니다. "
        "BMI와 콜레스테롤은 60세 미만에서만 점수에 반영됩니다."
    ),
)
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


@router.post(
    "/cogdrisk/calculate",
    response_model=CogDriskResult,
    summary="CogDrisk 치매 위험 점수 계산",
    description=(
        "CogDrisk 알고리즘을 기반으로 범발성 치매 또는 알츠하이머병 위험도를 계산합니다. "
        "BMI/콜레스테롤은 65세 이하, 고혈압/심방세동은 65세 초과에서 조건부 반영됩니다."
    ),
)
async def calculate_cogdrisk_score(
    payload: CogDriskInput,
    model: Literal["any_dementia", "ad"] = Query(
        default="any_dementia",
        description="평가 모델: any_dementia(범발성 치매) 또는 ad(알츠하이머)",
    ),
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


@router.post(
    "/cogdrisk/calculate/both",
    response_model=dict[str, CogDriskResult],
    summary="CogDrisk 범발성 치매와 AD 점수 동시 계산",
    description="동일한 입력으로 CogDrisk 범발성 치매 모델과 AD 모델의 점수를 동시에 산출합니다.",
)
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


@router.get(
    "/history",
    response_model=RiskAssessmentHistoryResponse,
    summary="내 치매 위험도 평가 기록 조회",
    description="로그인한 사용자의 치매 위험도 평가 기록을 최신순으로 조회합니다.",
)
async def list_my_risk_assessment_history(
    limit: int = Query(default=20, ge=1, le=100, description="조회 개수"),
    offset: int = Query(default=0, ge=0, description="건너뛸 기록 수"),
    user_id: str = Depends(get_current_user_id),
) -> RiskAssessmentHistoryResponse:
    records = await list_user_risk_assessments(
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    return RiskAssessmentHistoryResponse(items=records)
