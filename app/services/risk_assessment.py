from datetime import datetime, timezone
from typing import Any

from pymongo import ReturnDocument

from app.db import get_db


ANU_ADRI_AGE_WEIGHTS = {
    "male": {
        "under_65": 0,
        "65_70": 1,
        "70_75": 12,
        "75_80": 18,
        "80_85": 26,
        "85_90": 33,
        "over_90": 38,
    },
    "female": {
        "under_65": 0,
        "65_70": 5,
        "70_75": 14,
        "75_80": 21,
        "80_85": 29,
        "85_90": 35,
        "over_90": 41,
    },
}

ANU_ADRI_EDUCATION_WEIGHTS = {"high": 0, "medium": 3, "low": 6}
ANU_ADRI_BMI_WEIGHTS = {"normal": 0, "overweight": 2, "obese": 5}
ANU_ADRI_CHOLESTEROL_WEIGHTS = {"normal": 0, "high": 3}
ANU_ADRI_DIABETES_WEIGHTS = {False: 0, True: 3}
ANU_ADRI_DEPRESSION_WEIGHTS = {False: 0, True: 2}
ANU_ADRI_TBI_WEIGHTS = {False: 0, True: 4}
ANU_ADRI_SMOKING_WEIGHTS = {"never": 0, "past": 1, "current": 4}
ANU_ADRI_SOCIAL_ENGAGEMENT_WEIGHTS = {
    "high": 0,
    "medium_high": 1,
    "low_medium": 4,
    "low": 6,
}
ANU_ADRI_PESTICIDE_WEIGHTS = {False: 0, True: 2}
ANU_ADRI_ALCOHOL_WEIGHTS = {"none": 0, "moderate": -3}
ANU_ADRI_PHYSICAL_ACTIVITY_WEIGHTS = {"low": 0, "medium": -2, "high": -3}
ANU_ADRI_COGNITIVE_ACTIVITY_WEIGHTS = {"low": 0, "medium": -7, "high": -6}
ANU_ADRI_FISH_INTAKE_WEIGHTS = {
    "very_low": 0,
    "low": -3,
    "medium": -4,
    "high": -5,
}

COGDRISK_AGE_WEIGHTS = {
    "male": {
        "60_64": 0,
        "65_69": 6,
        "70_74": 8,
        "75_79": 13,
        "80_84": 17,
        "85_89": 20,
        "over_90": 22,
    },
    "female": {
        "60_64": 0,
        "65_69": 4,
        "70_74": 7,
        "75_79": 11,
        "80_84": 15,
        "85_89": 19,
        "over_90": 23,
    },
}

COGDRISK_EDUCATION_WEIGHTS = {"high": 0, "medium": 2, "low": 4}
COGDRISK_BMI_WEIGHTS = {"normal": 0, "underweight": 2, "overweight": 1, "obese": 3}
COGDRISK_CHOLESTEROL_WEIGHTS = {False: 0, True: 3}
COGDRISK_DIABETES_WEIGHTS = {"male": 2, "female": 3}
COGDRISK_STROKE_WEIGHTS = {False: 0, True: 2}
COGDRISK_HYPERTENSION_WEIGHTS = {False: 0, True: 1}
COGDRISK_ATRIAL_FIB_WEIGHTS = {False: 0, True: 2}
COGDRISK_DEPRESSION_WEIGHTS = {False: 0, True: 3}
COGDRISK_TBI_WEIGHTS = {False: 0, True: 2}
COGDRISK_LONELINESS_WEIGHTS = {False: 0, True: 2}
COGDRISK_INSOMNIA_WEIGHTS = {False: 0, True: 2}
COGDRISK_COGNITIVE_ENGAGEMENT_WEIGHTS = {"low": 0, "middle": -5, "highest": -4}
COGDRISK_PHYSICAL_ACTIVITY_WEIGHTS = {"insufficient": 0, "sufficient": -3}
COGDRISK_FISH_INTAKE_WEIGHTS = {False: 0, True: -0.25}
COGDRISK_SMOKING_WEIGHTS = {"never": 0, "past": 0, "current": 1}
COGDRISK_PESTICIDE_WEIGHTS = {False: 0, True: 2}

COGDRISK_K_CONSTANT = {
    "any_dementia_late": 4.25,
    "any_dementia_mid": 8.25,
    "ad_late": 3.4,
    "ad_mid": 8.4,
}


def _get_anu_adri_age_band(age: int) -> str:
    if age < 65:
        return "under_65"
    if age < 70:
        return "65_70"
    if age < 75:
        return "70_75"
    if age < 80:
        return "75_80"
    if age < 85:
        return "80_85"
    if age < 90:
        return "85_90"
    return "over_90"


def _get_anu_adri_bmi_category(bmi: float) -> str:
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "overweight"
    return "obese"


def _get_anu_adri_fish_category(times_per_week: float) -> str:
    if times_per_week < 0.25:
        return "very_low"
    if times_per_week < 2:
        return "low"
    if times_per_week < 4:
        return "medium"
    return "high"


def _classify_anu_adri_risk(score: int) -> str:
    # 연구/제품 기준이 확정되면 이 임계값은 별도 검증이 필요합니다.
    if score <= 5:
        return "low"
    if score <= 12:
        return "moderate"
    return "high"


def calculate_anu_adri(data: dict) -> dict:
    score = 0
    breakdown = {}
    notes = []

    age = data["age"]
    sex = data["sex"]

    age_score = ANU_ADRI_AGE_WEIGHTS[sex][_get_anu_adri_age_band(age)]
    score += age_score
    breakdown["age_sex"] = age_score

    education_score = ANU_ADRI_EDUCATION_WEIGHTS[data["education_level"]]
    score += education_score
    breakdown["education"] = education_score

    if age < 60:
        bmi_score = ANU_ADRI_BMI_WEIGHTS[_get_anu_adri_bmi_category(data["bmi"])]
        score += bmi_score
        breakdown["bmi"] = bmi_score
    else:
        breakdown["bmi"] = None
        notes.append("BMI는 60세 미만에서만 위험 점수에 포함됩니다.")

    if age < 60:
        cholesterol_key = "high" if data["high_cholesterol"] else "normal"
        cholesterol_score = ANU_ADRI_CHOLESTEROL_WEIGHTS[cholesterol_key]
        score += cholesterol_score
        breakdown["cholesterol"] = cholesterol_score
    else:
        breakdown["cholesterol"] = None
        notes.append("콜레스테롤은 60세 미만에서만 위험 점수에 포함됩니다.")

    diabetes_score = ANU_ADRI_DIABETES_WEIGHTS[data["has_diabetes"]]
    score += diabetes_score
    breakdown["diabetes"] = diabetes_score

    depression_score = ANU_ADRI_DEPRESSION_WEIGHTS[data["active_depression"]]
    score += depression_score
    breakdown["depression"] = depression_score

    tbi_score = ANU_ADRI_TBI_WEIGHTS[data["has_tbi"]]
    score += tbi_score
    breakdown["tbi"] = tbi_score

    smoking_score = ANU_ADRI_SMOKING_WEIGHTS[data["smoking_status"]]
    score += smoking_score
    breakdown["smoking"] = smoking_score

    social_score = ANU_ADRI_SOCIAL_ENGAGEMENT_WEIGHTS[data["social_engagement"]]
    score += social_score
    breakdown["social_engagement"] = social_score

    pesticide_score = ANU_ADRI_PESTICIDE_WEIGHTS[data["pesticide_exposure"]]
    score += pesticide_score
    breakdown["pesticide"] = pesticide_score

    alcohol_score = ANU_ADRI_ALCOHOL_WEIGHTS[data["alcohol_intake"]]
    score += alcohol_score
    breakdown["alcohol"] = alcohol_score

    physical_score = ANU_ADRI_PHYSICAL_ACTIVITY_WEIGHTS[data["physical_activity"]]
    score += physical_score
    breakdown["physical_activity"] = physical_score

    cognitive_score = ANU_ADRI_COGNITIVE_ACTIVITY_WEIGHTS[data["cognitive_activity"]]
    score += cognitive_score
    breakdown["cognitive_activity"] = cognitive_score

    fish_score = ANU_ADRI_FISH_INTAKE_WEIGHTS[
        _get_anu_adri_fish_category(data["fish_per_week"])
    ]
    score += fish_score
    breakdown["fish_intake"] = fish_score

    return {
        "total_score": score,
        "risk_level": _classify_anu_adri_risk(score),
        "breakdown": breakdown,
        "notes": notes,
    }


def _get_cogdrisk_age_band(age: int) -> str:
    # 현재 입력 스키마는 40세 이상을 허용하며, 40~64세는 기준군(60_64)으로 처리합니다.
    if age < 65:
        return "60_64"
    if age < 70:
        return "65_69"
    if age < 75:
        return "70_74"
    if age < 80:
        return "75_79"
    if age < 85:
        return "80_84"
    if age < 90:
        return "85_89"
    return "over_90"


def _get_cogdrisk_bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "underweight"
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "overweight"
    return "obese"


def _classify_cogdrisk_risk(score: float, model_type: str) -> str:
    max_scores = {
        "any_dementia_late": 49.25,
        "any_dementia_mid": 36.52,
        "ad_late": 46.4,
        "ad_mid": 34.4,
    }
    percentage = (score / max_scores.get(model_type, 49.25)) * 100

    if percentage < 33:
        return "low"
    if percentage < 66:
        return "moderate"
    return "high"


def calculate_cogdrisk(data: dict, model: str = "any_dementia") -> dict:
    if model not in ("any_dementia", "ad"):
        raise ValueError("model must be 'any_dementia' or 'ad'")

    score = 0.0
    breakdown = {}
    notes = []

    age = data["age"]
    sex = data["sex"]
    is_midlife = age <= 65

    age_score = COGDRISK_AGE_WEIGHTS[sex][_get_cogdrisk_age_band(age)]
    score += age_score
    breakdown["age_sex"] = age_score

    education_score = COGDRISK_EDUCATION_WEIGHTS[data["education_level"]]
    score += education_score
    breakdown["education"] = education_score

    if is_midlife:
        bmi_score = COGDRISK_BMI_WEIGHTS[_get_cogdrisk_bmi_category(data["bmi"])]
        score += bmi_score
        breakdown["bmi"] = bmi_score
    else:
        breakdown["bmi"] = None
        notes.append("BMI는 65세 이하(중년기)에만 위험 점수에 포함됩니다.")

    if is_midlife:
        cholesterol_score = COGDRISK_CHOLESTEROL_WEIGHTS[data["high_cholesterol"]]
        score += cholesterol_score
        breakdown["cholesterol"] = cholesterol_score
    else:
        breakdown["cholesterol"] = None
        notes.append("콜레스테롤은 65세 이하(중년기)에만 위험 점수에 포함됩니다.")

    diabetes_score = COGDRISK_DIABETES_WEIGHTS[sex] if data["has_diabetes"] else 0
    score += diabetes_score
    breakdown["diabetes"] = diabetes_score

    stroke_score = COGDRISK_STROKE_WEIGHTS[data["has_stroke"]]
    score += stroke_score
    breakdown["stroke"] = stroke_score

    if not is_midlife:
        hypertension_score = COGDRISK_HYPERTENSION_WEIGHTS[data["has_hypertension"]]
        score += hypertension_score
        breakdown["hypertension"] = hypertension_score
    else:
        breakdown["hypertension"] = None
        notes.append("고혈압은 65세 초과(노년기)에만 위험 점수에 포함됩니다.")

    if model == "any_dementia":
        if not is_midlife:
            atrial_fib_score = COGDRISK_ATRIAL_FIB_WEIGHTS[data["has_atrial_fib"]]
            score += atrial_fib_score
            breakdown["atrial_fibrillation"] = atrial_fib_score
        else:
            breakdown["atrial_fibrillation"] = None
            notes.append("심방세동은 65세 초과(노년기)에만 위험 점수에 포함됩니다.")
    else:
        breakdown["atrial_fibrillation"] = None
        notes.append("CogDrisk-AD 모델에서는 심방세동이 제외됩니다.")

    depression_score = COGDRISK_DEPRESSION_WEIGHTS[data["depression"]]
    score += depression_score
    breakdown["depression"] = depression_score

    tbi_score = COGDRISK_TBI_WEIGHTS[data["has_tbi"]]
    score += tbi_score
    breakdown["tbi"] = tbi_score

    loneliness_score = COGDRISK_LONELINESS_WEIGHTS[data["loneliness"]]
    score += loneliness_score
    breakdown["loneliness"] = loneliness_score

    if model == "any_dementia":
        insomnia_score = COGDRISK_INSOMNIA_WEIGHTS[data["insomnia"]]
        score += insomnia_score
        breakdown["insomnia"] = insomnia_score
    else:
        breakdown["insomnia"] = None
        notes.append("CogDrisk-AD 모델에서는 불면증이 제외됩니다.")

    cognitive_score = COGDRISK_COGNITIVE_ENGAGEMENT_WEIGHTS[
        data["cognitive_engagement"]
    ]
    score += cognitive_score
    breakdown["cognitive_engagement"] = cognitive_score

    physical_score = COGDRISK_PHYSICAL_ACTIVITY_WEIGHTS[data["physical_activity"]]
    score += physical_score
    breakdown["physical_activity"] = physical_score

    fish_score = COGDRISK_FISH_INTAKE_WEIGHTS[data["fish_weekly"]]
    score += fish_score
    breakdown["fish_intake"] = fish_score

    smoking_score = COGDRISK_SMOKING_WEIGHTS[data["smoking_status"]]
    score += smoking_score
    breakdown["smoking"] = smoking_score

    if model == "ad":
        pesticide_score = COGDRISK_PESTICIDE_WEIGHTS[data["pesticide_exposure"]]
        score += pesticide_score
        breakdown["pesticide"] = pesticide_score
    else:
        breakdown["pesticide"] = None
        notes.append("살충제 노출은 CogDrisk-AD 모델에만 적용됩니다.")

    if model == "any_dementia":
        k_key = "any_dementia_mid" if is_midlife else "any_dementia_late"
    else:
        k_key = "ad_mid" if is_midlife else "ad_late"

    raw_score = round(score, 2)
    total_score = round(score + COGDRISK_K_CONSTANT[k_key], 2)

    return {
        "model": model,
        "life_stage": "midlife" if is_midlife else "late_life",
        "raw_score": raw_score,
        "total_score": total_score,
        "risk_level": _classify_cogdrisk_risk(total_score, k_key),
        "breakdown": breakdown,
        "notes": notes,
    }


def _serialize_risk_assessment_record(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "user_id": document["user_id"],
        "assessment_type": document["assessment_type"],
        "model": document["model"],
        "input": document["input"],
        "result": document["result"],
        "created_at": document["created_at"],
        "updated_at": document.get("updated_at"),
    }


async def save_risk_assessment(
    *,
    user_id: str,
    assessment_type: str,
    model: str,
    input_data: dict[str, Any],
    result: dict[str, Any],
) -> dict[str, Any]:
    db = get_db()
    now = datetime.now(timezone.utc)
    document = await db.risk_assessments.find_one_and_update(
        {
            "user_id": user_id,
            "assessment_type": assessment_type,
            "model": model,
        },
        {
            "$set": {
                "input": input_data,
                "result": result,
                "updated_at": now,
            }
        },
        sort=[("created_at", -1)],
        return_document=ReturnDocument.AFTER,
    )
    if document is not None:
        return _serialize_risk_assessment_record(document)

    document = {
        "user_id": user_id,
        "assessment_type": assessment_type,
        "model": model,
        "input": input_data,
        "result": result,
        "created_at": now,
        "updated_at": None,
    }

    insert_result = await db.risk_assessments.insert_one(document)
    document["_id"] = insert_result.inserted_id
    return _serialize_risk_assessment_record(document)


async def list_user_risk_assessments(
    *,
    user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    db = get_db()
    cursor = (
        db.risk_assessments.find({"user_id": user_id})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    documents = await cursor.to_list(length=limit)
    return [_serialize_risk_assessment_record(document) for document in documents]
