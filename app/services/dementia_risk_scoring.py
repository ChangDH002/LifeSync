from __future__ import annotations

from typing import Any, Literal

from app.schemas.survey import ToolScoreBreakdown

Sex = Literal["male", "female"]
EducationLevel = Literal["high", "medium", "low"]
Level3 = Literal["low", "medium", "high"]
PhysicalActivity = Literal["low", "medium", "high"]
FishIntake = Literal["none", "weekly", "frequent", "daily"]
SmokingStatus = Literal["never", "former", "current"]
AlcoholIntake = Literal["none", "light_to_moderate", "high"]


COGDRISK_MIN_SCORE = -8.25
COGDRISK_MAX_SCORE = 51.0
ANU_ADRI_MIN_SCORE = -11.0
ANU_ADRI_MAX_SCORE = 70.0


def _coerce_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "1"}:
            return True
        if lowered in {"false", "no", "0"}:
            return False
    return None


def _coerce_float(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def _coerce_int(value: Any) -> int | None:
    number = _coerce_float(value)
    if number is None:
        return None
    return int(number)


def _normalize_age(value: Any) -> int | None:
    if isinstance(value, str):
        mapping = {
            "under_45": 44,
            "45_54": 50,
            "55_64": 60,
            "65_74": 70,
            "75_plus": 80,
        }
        if value in mapping:
            return mapping[value]
    return _coerce_int(value)


def _normalize_physical_activity(value: Any) -> PhysicalActivity | None:
    if not isinstance(value, str):
        return None
    mapping: dict[str, PhysicalActivity] = {
        "low": "low",
        "insufficient": "medium",
        "medium": "medium",
        "high": "high",
        "sufficient": "high",
    }
    return mapping.get(value)


def _normalize_cognitive_activity(value: Any) -> Level3 | None:
    if not isinstance(value, str):
        return None
    mapping: dict[str, Level3] = {
        "low": "low",
        "middle": "medium",
        "medium": "medium",
        "high": "high",
    }
    return mapping.get(value)


def _normalize_fish_intake(value: Any) -> FishIntake | None:
    if isinstance(value, (int, float)):
        weekly = float(value)
        if weekly <= 0:
            return "none"
        if weekly < 2:
            return "weekly"
        if weekly < 7:
            return "frequent"
        return "daily"
    if not isinstance(value, str):
        return None
    mapping: dict[str, FishIntake] = {
        "none": "none",
        "rarely": "none",
        "sometimes": "weekly",
        "weekly": "weekly",
        "weekly_or_more": "weekly",
        "frequent": "frequent",
        "daily": "daily",
    }
    return mapping.get(value)


def _normalize_social_engagement(
    loneliness: Any, social_engagement: Any
) -> Level3 | None:
    if isinstance(social_engagement, str) and social_engagement in {"low", "medium", "high"}:
        return social_engagement  # type: ignore[return-value]
    if isinstance(loneliness, str):
        # 외로움이 높을수록 사회적 참여가 낮다고 역변환
        mapping: dict[str, Level3] = {
            "high": "low",
            "medium": "medium",
            "low": "high",
        }
        return mapping.get(loneliness)
    return None


def _normalize_smoking_status(value: Any) -> SmokingStatus | None:
    if isinstance(value, str) and value in {"never", "former", "current"}:
        return value  # type: ignore[return-value]
    return None


def _normalize_alcohol_intake(value: Any) -> AlcoholIntake | None:
    if isinstance(value, str) and value in {"none", "light_to_moderate", "high"}:
        return value  # type: ignore[return-value]
    return None


def normalize_responses(raw: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "age": _normalize_age(raw.get("age")),
        "sex": raw.get("sex") if raw.get("sex") in {"male", "female"} else None,
        "education_level": raw.get("education_level")
        if raw.get("education_level") in {"high", "medium", "low"}
        else None,
        "bmi": _coerce_float(raw.get("bmi")),
        "high_cholesterol": _coerce_bool(
            raw.get("high_cholesterol", raw.get("cholesterol"))
        ),
        "has_diabetes": _coerce_bool(raw.get("has_diabetes", raw.get("diabetes"))),
        "has_stroke": _coerce_bool(raw.get("has_stroke", raw.get("stroke"))),
        "has_hypertension": _coerce_bool(
            raw.get("has_hypertension", raw.get("hypertension"))
        ),
        "has_atrial_fib": _coerce_bool(raw.get("has_atrial_fib")),
        "depression": _coerce_bool(raw.get("depression")),
        "has_tbi": _coerce_bool(raw.get("has_tbi", raw.get("tbi"))),
        "loneliness": raw.get("loneliness") if raw.get("loneliness") in {"low", "medium", "high"} else None,
        "social_engagement": _normalize_social_engagement(
            raw.get("loneliness"), raw.get("social_engagement")
        ),
        "insomnia": _coerce_bool(raw.get("insomnia")),
        "cognitive_activity": _normalize_cognitive_activity(
            raw.get("cognitive_activity", raw.get("cognitive_engagement"))
        ),
        "physical_activity": _normalize_physical_activity(raw.get("physical_activity")),
        "fish_intake": _normalize_fish_intake(
            raw.get("fish_intake", raw.get("fish_per_week", raw.get("fish_weekly")))
        ),
        "smoking_status": _normalize_smoking_status(raw.get("smoking_status")),
        "pesticide_exposure": _coerce_bool(raw.get("pesticide_exposure")),
        "alcohol_intake": _normalize_alcohol_intake(raw.get("alcohol_intake")),
    }
    return {key: value for key, value in normalized.items() if value is not None}


def _average_by_sex(
    sex: str | None, male_value: float, female_value: float
) -> float:
    if sex == "male":
        return male_value
    if sex == "female":
        return female_value
    return round((male_value + female_value) / 2, 2)


def score_anu_age(age: int | None, sex: str | None) -> float:
    if age is None or age < 65:
        return 0.0
    if age < 70:
        return _average_by_sex(sex, 1, 5)
    if age < 75:
        return _average_by_sex(sex, 12, 14)
    if age < 80:
        return _average_by_sex(sex, 18, 21)
    if age < 85:
        return _average_by_sex(sex, 26, 29)
    if age < 90:
        return _average_by_sex(sex, 33, 35)
    return _average_by_sex(sex, 38, 41)


def score_anu_education(level: str | None) -> float:
    return {"high": 0.0, "medium": 3.0, "low": 6.0}.get(level or "", 0.0)


def score_anu_bmi(age: int | None, bmi: float | None) -> float:
    if age is None or age >= 60 or bmi is None:
        return 0.0
    if bmi < 25:
        return 0.0
    if bmi < 30:
        return 2.0
    return 5.0


def score_anu_cholesterol(age: int | None, high_cholesterol: bool | None) -> float:
    if age is None or age >= 60:
        return 0.0
    return 3.0 if high_cholesterol else 0.0


def score_anu_diabetes(has_diabetes: bool | None) -> float:
    return 3.0 if has_diabetes else 0.0


def score_anu_depression(depression: bool | None) -> float:
    return 2.0 if depression else 0.0


def score_anu_tbi(has_tbi: bool | None) -> float:
    return 4.0 if has_tbi else 0.0


def score_anu_smoking(status: str | None) -> float:
    return {"never": 0.0, "former": 1.0, "current": 4.0}.get(status or "", 0.0)


def score_anu_alcohol(level: str | None) -> float:
    return {"none": 0.0, "light_to_moderate": -3.0, "high": 0.0}.get(level or "", 0.0)


def score_anu_physical_activity(level: str | None) -> float:
    return {"low": 0.0, "medium": -2.0, "high": -3.0}.get(level or "", 0.0)


def score_anu_cognitive_activity(level: str | None) -> float:
    return {"low": 0.0, "medium": -1.0, "high": -3.0}.get(level or "", 0.0)


def score_anu_social_engagement(level: str | None) -> float:
    return {"low": 0.0, "medium": -1.0, "high": -2.0}.get(level or "", 0.0)


def score_anu_fish_intake(level: str | None) -> float:
    return {"none": 0.0, "weekly": -3.0, "frequent": -4.0, "daily": -5.0}.get(
        level or "", 0.0
    )


def score_anu_pesticide_exposure(exposed: bool | None) -> float:
    return 2.0 if exposed else 0.0


def calculate_anu_adri_raw(responses: dict[str, Any]) -> ToolScoreBreakdown:
    matched_factors = {
        "age": score_anu_age(responses.get("age"), responses.get("sex")),
        "education_level": score_anu_education(responses.get("education_level")),
        "bmi": score_anu_bmi(responses.get("age"), responses.get("bmi")),
        "high_cholesterol": score_anu_cholesterol(
            responses.get("age"), responses.get("high_cholesterol")
        ),
        "has_diabetes": score_anu_diabetes(responses.get("has_diabetes")),
        "depression": score_anu_depression(responses.get("depression")),
        "has_tbi": score_anu_tbi(responses.get("has_tbi")),
        "smoking_status": score_anu_smoking(responses.get("smoking_status")),
        "alcohol_intake": score_anu_alcohol(responses.get("alcohol_intake")),
        "physical_activity": score_anu_physical_activity(
            responses.get("physical_activity")
        ),
        "cognitive_activity": score_anu_cognitive_activity(
            responses.get("cognitive_activity")
        ),
        "social_engagement": score_anu_social_engagement(
            responses.get("social_engagement")
        ),
        "fish_intake": score_anu_fish_intake(responses.get("fish_intake")),
        "pesticide_exposure": score_anu_pesticide_exposure(
            responses.get("pesticide_exposure")
        ),
    }
    raw_score = round(sum(matched_factors.values()), 2)
    return ToolScoreBreakdown(
        rawScore=raw_score,
        normalizedScore=normalize_score(raw_score, ANU_ADRI_MIN_SCORE, ANU_ADRI_MAX_SCORE),
        matchedFactors=matched_factors,
    )


def score_cogdrisk_age(age: int | None, sex: str | None) -> float:
    if age is None or age < 65:
        return 0.0
    if age < 70:
        return _average_by_sex(sex, 4, 5)
    if age < 75:
        return _average_by_sex(sex, 8, 9)
    if age < 80:
        return _average_by_sex(sex, 14, 15)
    if age < 85:
        return _average_by_sex(sex, 20, 21)
    return _average_by_sex(sex, 22, 23)


def score_cogdrisk_education(level: str | None) -> float:
    return {"high": 0.0, "medium": 2.0, "low": 4.0}.get(level or "", 0.0)


def score_cogdrisk_bmi(age: int | None, bmi: float | None) -> float:
    if age is None or age > 65 or bmi is None:
        return 0.0
    if bmi < 18.5:
        return 2.0
    if bmi < 25:
        return 0.0
    if bmi < 30:
        return 1.0
    return 3.0


def score_cogdrisk_cholesterol(age: int | None, high_cholesterol: bool | None) -> float:
    if age is None or age > 65:
        return 0.0
    return 3.0 if high_cholesterol else 0.0


def score_cogdrisk_diabetes(has_diabetes: bool | None, sex: str | None) -> float:
    if not has_diabetes:
        return 0.0
    return _average_by_sex(sex, 2.0, 3.0)


def score_cogdrisk_stroke(has_stroke: bool | None) -> float:
    return 2.0 if has_stroke else 0.0


def score_cogdrisk_hypertension(has_hypertension: bool | None) -> float:
    return 1.0 if has_hypertension else 0.0


def score_cogdrisk_atrial_fib(age: int | None, has_atrial_fib: bool | None) -> float:
    if age is None or age <= 65:
        return 0.0
    return 2.0 if has_atrial_fib else 0.0


def score_cogdrisk_depression(depression: bool | None) -> float:
    return 3.0 if depression else 0.0


def score_cogdrisk_tbi(has_tbi: bool | None) -> float:
    return 2.0 if has_tbi else 0.0


def score_cogdrisk_loneliness(level: str | None) -> float:
    return {"low": 0.0, "medium": 1.0, "high": 2.0}.get(level or "", 0.0)


def score_cogdrisk_insomnia(insomnia: bool | None) -> float:
    return 2.0 if insomnia else 0.0


def score_cogdrisk_cognitive_activity(level: str | None) -> float:
    return {"low": 0.0, "medium": -4.0, "high": -5.0}.get(level or "", 0.0)


def score_cogdrisk_physical_activity(level: str | None) -> float:
    return {"low": 0.0, "medium": -1.0, "high": -3.0}.get(level or "", 0.0)


def score_cogdrisk_fish_intake(level: str | None) -> float:
    return {"none": 0.0, "weekly": -0.25, "frequent": -0.25, "daily": -0.25}.get(
        level or "", 0.0
    )


def score_cogdrisk_smoking(status: str | None) -> float:
    return {"never": 0.0, "former": 0.0, "current": 1.0}.get(status or "", 0.0)


def calculate_cogdrisk_raw(responses: dict[str, Any]) -> ToolScoreBreakdown:
    matched_factors = {
        "age": score_cogdrisk_age(responses.get("age"), responses.get("sex")),
        "education_level": score_cogdrisk_education(responses.get("education_level")),
        "bmi": score_cogdrisk_bmi(responses.get("age"), responses.get("bmi")),
        "high_cholesterol": score_cogdrisk_cholesterol(
            responses.get("age"), responses.get("high_cholesterol")
        ),
        "has_diabetes": score_cogdrisk_diabetes(
            responses.get("has_diabetes"), responses.get("sex")
        ),
        "has_stroke": score_cogdrisk_stroke(responses.get("has_stroke")),
        "has_hypertension": score_cogdrisk_hypertension(
            responses.get("has_hypertension")
        ),
        "has_atrial_fib": score_cogdrisk_atrial_fib(
            responses.get("age"), responses.get("has_atrial_fib")
        ),
        "depression": score_cogdrisk_depression(responses.get("depression")),
        "has_tbi": score_cogdrisk_tbi(responses.get("has_tbi")),
        "loneliness": score_cogdrisk_loneliness(responses.get("loneliness")),
        "insomnia": score_cogdrisk_insomnia(responses.get("insomnia")),
        "cognitive_activity": score_cogdrisk_cognitive_activity(
            responses.get("cognitive_activity")
        ),
        "physical_activity": score_cogdrisk_physical_activity(
            responses.get("physical_activity")
        ),
        "fish_intake": score_cogdrisk_fish_intake(responses.get("fish_intake")),
        "smoking_status": score_cogdrisk_smoking(responses.get("smoking_status")),
    }
    raw_score = round(sum(matched_factors.values()), 2)
    return ToolScoreBreakdown(
        rawScore=raw_score,
        normalizedScore=normalize_score(raw_score, COGDRISK_MIN_SCORE, COGDRISK_MAX_SCORE),
        matchedFactors=matched_factors,
    )


def normalize_score(raw: float, min_score: float, max_score: float) -> float:
    if max_score <= min_score:
        return 0.0
    normalized = ((raw - min_score) / (max_score - min_score)) * 100
    normalized = max(0.0, min(100.0, normalized))
    return round(normalized, 1)


def calculate_risk_level(score: float) -> str:
    if score < 33:
        return "위험도 낮음"
    if score < 66:
        return "위험도 보통"
    return "위험도 높음"


def calculate_final_risk_score(cogdrisk_score: float, anu_adri_score: float) -> float:
    return round((cogdrisk_score + anu_adri_score) / 2, 1)

