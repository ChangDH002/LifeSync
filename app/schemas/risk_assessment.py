from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ANUADRIInput(BaseModel):
    age: int = Field(..., ge=40, le=120, description="나이 (40세 이상)")
    sex: Literal["male", "female"] = Field(..., description="성별")
    education_level: Literal["high", "medium", "low"] = Field(
        ..., description="교육 수준: high(>11년), medium(8~11년), low(<8년)"
    )
    bmi: float = Field(..., ge=10.0, le=70.0, description="체질량지수 (kg/m²)")
    high_cholesterol: bool = Field(
        ..., description="고콜레스테롤혈증 여부 (≥240 mg/dl 또는 진단 병력)"
    )
    has_diabetes: bool = Field(..., description="당뇨병 진단 여부")
    active_depression: bool = Field(
        ..., description="현재 활성 우울 증상 여부 (CES-D ≥ 16 수준)"
    )
    has_tbi: bool = Field(..., description="외상성 뇌손상(TBI) 병력 여부")
    smoking_status: Literal["never", "past", "current"] = Field(
        ..., description="흡연 상태: never(비흡연), past(과거), current(현재)"
    )
    social_engagement: Literal["high", "medium_high", "low_medium", "low"] = Field(
        ...,
        description="사회적 참여 수준: high(최고), medium_high(중간~높음), low_medium(낮음~중간), low(최저)",
    )
    pesticide_exposure: bool = Field(..., description="직업적 살충제 장기 노출 병력 여부")
    alcohol_intake: Literal["none", "moderate"] = Field(
        ..., description="음주 패턴: none(완전 비음주), moderate(가벼운~중등도)"
    )
    physical_activity: Literal["low", "medium", "high"] = Field(
        ..., description="신체 활동 수준: low(최저), medium(중간), high(높음)"
    )
    cognitive_activity: Literal["low", "medium", "high"] = Field(
        ..., description="인지 활동 수준: low(최저), medium(중간), high(최고)"
    )
    fish_per_week: float = Field(..., ge=0.0, description="주당 생선 섭취 횟수")


class ANUADRIBreakdown(BaseModel):
    age_sex: int
    education: int
    bmi: int | None
    cholesterol: int | None
    diabetes: int
    depression: int
    tbi: int
    smoking: int
    social_engagement: int
    pesticide: int
    alcohol: int
    physical_activity: int
    cognitive_activity: int
    fish_intake: int


class ANUADRIResult(BaseModel):
    total_score: int = Field(..., description="ANU-ADRI 총점")
    risk_level: Literal["low", "moderate", "high"] = Field(..., description="위험도 분류")
    breakdown: ANUADRIBreakdown = Field(..., description="항목별 점수 내역")
    notes: list[str] = Field(default_factory=list, description="조건부 적용 안내")


class CogDriskInput(BaseModel):
    age: int = Field(..., ge=40, le=120, description="나이 (40세 이상)")
    sex: Literal["male", "female"] = Field(..., description="성별")
    education_level: Literal["high", "medium", "low"] = Field(
        ..., description="교육 수준: high(>11년), medium(8-11년), low(<8년)"
    )
    bmi: float = Field(..., ge=10.0, le=70.0, description="체질량지수 (kg/m²)")
    high_cholesterol: bool = Field(..., description="고콜레스테롤혈증 여부 (>6.5 mmol/L)")
    has_diabetes: bool = Field(..., description="당뇨병 진단 여부")
    has_stroke: bool = Field(..., description="뇌졸중 병력 여부")
    has_hypertension: bool = Field(..., description="고혈압 진단 여부")
    has_atrial_fib: bool = Field(..., description="심방세동 여부")
    depression: bool = Field(..., description="임상적 우울증 여부 (CES-D > 20 수준)")
    has_tbi: bool = Field(..., description="외상성 뇌손상 병력 여부")
    loneliness: bool = Field(..., description="고립감 / 사회적 관여 결핍 여부")
    insomnia: bool = Field(..., description="임상적 불면증 진단 여부")
    cognitive_engagement: Literal["low", "middle", "highest"] = Field(
        ..., description="인지 활동 수준: low(낮음), middle(중위), highest(최상위)"
    )
    physical_activity: Literal["insufficient", "sufficient"] = Field(
        ..., description="신체 활동 수준: insufficient(부족), sufficient(주 150분 이상 중강도)"
    )
    fish_weekly: bool = Field(..., description="주 1회 이상 생선 섭취 여부")
    smoking_status: Literal["never", "past", "current"] = Field(
        ..., description="흡연 상태: never(비흡연), past(과거), current(현재)"
    )
    pesticide_exposure: bool = Field(
        default=False, description="살충제 장기 노출 병력 (AD 모델에서만 점수 반영)"
    )


class CogDriskBreakdown(BaseModel):
    age_sex: int
    education: int
    bmi: int | None
    cholesterol: int | None
    diabetes: int
    stroke: int
    hypertension: int | None
    atrial_fibrillation: int | None
    depression: int
    tbi: int
    loneliness: int
    insomnia: int | None
    cognitive_engagement: int
    physical_activity: int
    fish_intake: float
    smoking: int
    pesticide: int | None


class CogDriskResult(BaseModel):
    model: Literal["any_dementia", "ad"] = Field(
        ..., description="평가 모델: any_dementia(범발성 치매) 또는 ad(알츠하이머)"
    )
    life_stage: Literal["midlife", "late_life"] = Field(
        ..., description="생애 단계: midlife(≤65세) 또는 late_life(>65세)"
    )
    raw_score: float = Field(..., description="K 적용 전 원점수 (음수 가능)")
    total_score: float = Field(..., description="K 보정 후 최종 점수 (0 이상)")
    risk_level: Literal["low", "moderate", "high"] = Field(..., description="위험도 분류")
    breakdown: CogDriskBreakdown = Field(..., description="항목별 점수 내역")
    notes: list[str] = Field(default_factory=list, description="조건부 적용 안내")


class RiskAssessmentRecord(BaseModel):
    id: str = Field(..., description="위험도 평가 기록 ID")
    user_id: str = Field(..., description="사용자 ID")
    assessment_type: Literal["anu_adri", "cogdrisk", "cogdrisk_both"] = Field(
        ..., description="평가 유형"
    )
    model: str = Field(..., description="세부 모델명")
    input: dict[str, Any] = Field(..., description="계산 요청 입력값")
    result: dict[str, Any] = Field(..., description="계산 결과")
    created_at: datetime = Field(..., description="저장 시각")
    updated_at: datetime | None = Field(default=None, description="마지막 수정 시각")


class RiskAssessmentHistoryResponse(BaseModel):
    items: list[RiskAssessmentRecord]
