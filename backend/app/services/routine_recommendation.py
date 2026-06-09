from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.db import get_db
from app.schemas.routines import RoutineDefinitionDocument, UserRoutineDocument
from app.schemas.survey import DementiaSurveyResultDocument
from app.services.routines import ROUTINE_DEFINITION_CATALOG

MAX_ASSIGNED_ROUTINES = 3
SURVEY_ROUTINE_SOURCE = "survey"


def _factor_relevance_score(factor: str, normalized_responses: dict[str, Any]) -> float:
    if factor not in normalized_responses:
        return 0.0

    value = normalized_responses[factor]

    if factor == "physical_activity":
        if value in {"low", "insufficient"}:
            return 18.0
        if value == "medium":
            return 10.0
        return 0.0

    if factor in {"cognitive_activity", "social_engagement"}:
        if value == "low":
            return 18.0
        if value == "medium":
            return 10.0
        return 0.0

    if factor == "loneliness":
        if value == "high":
            return 18.0
        if value == "medium":
            return 10.0
        return 0.0

    if factor == "fish_intake":
        if value in {"none", "rarely"}:
            return 14.0
        if value in {"sometimes", "weekly"}:
            return 8.0
        return 0.0

    if factor == "smoking_status" and value == "current":
        return 10.0

    if factor in {"insomnia", "depression", "has_diabetes", "has_hypertension"}:
        if value is True:
            return 14.0
        return 0.0

    return 0.0


def _category_relevance_score(
    definition: RoutineDefinitionDocument,
    category_scores: dict[str, float],
) -> float:
    if not definition.target_categories:
        return 0.0
    return max(category_scores.get(category, 0.0) for category in definition.target_categories)


def _risk_level_bonus(risk_level: str) -> float:
    if risk_level == "위험도 높음":
        return 6.0
    if risk_level == "위험도 보통":
        return 3.0
    return 0.0


def score_routine_definition(
    definition: RoutineDefinitionDocument,
    *,
    category_scores: dict[str, float],
    normalized_responses: dict[str, Any],
    risk_level: str,
) -> float:
    factor_score = sum(
        _factor_relevance_score(factor, normalized_responses)
        for factor in definition.target_factors
    )
    category_score = _category_relevance_score(definition, category_scores)
    return factor_score + category_score + _risk_level_bonus(risk_level)


def build_recommendation_reason(
    definition: RoutineDefinitionDocument,
    *,
    category_scores: dict[str, float],
    normalized_responses: dict[str, Any],
    relevance_score: float,
) -> str:
    if relevance_score <= 0:
        return definition.recommendation_reason_template

    matched_factors = [
        factor
        for factor in definition.target_factors
        if _factor_relevance_score(factor, normalized_responses) >= 10.0
    ]
    if matched_factors:
        factor_labels = {
            "physical_activity": "신체 활동",
            "cognitive_activity": "인지 활동",
            "social_engagement": "사회적 교류",
            "loneliness": "외로움",
            "insomnia": "수면",
            "depression": "기분",
            "fish_intake": "식습관",
            "smoking_status": "흡연",
            "has_diabetes": "혈당 관리",
            "has_hypertension": "혈압 관리",
        }
        label = factor_labels.get(matched_factors[0], "생활습관")
        return (
            f"설문에서 {label} 개선이 필요해 보여 "
            f"{definition.recommendation_reason_template}"
        )

    if definition.target_categories:
        top_category = max(
            definition.target_categories,
            key=lambda category: category_scores.get(category, 0.0),
        )
        top_score = category_scores.get(top_category, 0.0)
        if top_score > 0:
            return (
                f"{top_category} 영역 점수({top_score}점)를 바탕으로 "
                f"{definition.recommendation_reason_template}"
            )

    return definition.recommendation_reason_template


def select_routine_definitions_for_survey(
    survey: DementiaSurveyResultDocument,
    *,
    definitions: list[RoutineDefinitionDocument] | None = None,
    limit: int = MAX_ASSIGNED_ROUTINES,
) -> list[tuple[RoutineDefinitionDocument, int, str]]:
    catalog = definitions or [item for item in ROUTINE_DEFINITION_CATALOG if item.active]
    scored: list[tuple[float, RoutineDefinitionDocument]] = []

    for definition in catalog:
        relevance = score_routine_definition(
            definition,
            category_scores=survey.category_scores,
            normalized_responses=survey.normalized_responses,
            risk_level=survey.risk_level,
        )
        if relevance > 0:
            scored.append((relevance, definition))

    scored.sort(
        key=lambda item: (-item[0], item[1].default_priority, item[1].routine_id),
    )

    if not scored:
        scored = [
            (0.0, definition)
            for definition in sorted(catalog, key=lambda item: item.default_priority)[:limit]
        ]

    selected: list[tuple[RoutineDefinitionDocument, int, str]] = []
    for relevance, definition in scored[:limit]:
        priority = max(1, definition.default_priority - int(relevance))
        reason = build_recommendation_reason(
            definition,
            category_scores=survey.category_scores,
            normalized_responses=survey.normalized_responses,
            relevance_score=relevance,
        )
        selected.append((definition, priority, reason))

    selected.sort(key=lambda item: item[1])
    return selected


def build_user_routine_documents(
    user_id: str,
    survey: DementiaSurveyResultDocument,
    *,
    selections: list[tuple[RoutineDefinitionDocument, int, str]] | None = None,
    assigned_at: datetime | None = None,
) -> list[UserRoutineDocument]:
    now = assigned_at or datetime.now(timezone.utc)
    chosen = selections or select_routine_definitions_for_survey(survey)
    documents: list[UserRoutineDocument] = []

    for definition, priority, reason in chosen:
        documents.append(
            UserRoutineDocument(
                user_id=user_id,
                routine_id=definition.routine_id,
                title=definition.title,
                category=definition.category,
                description=definition.description,
                recommendation_reason=reason,
                frequency=definition.frequency,
                priority=priority,
                active=True,
                source=SURVEY_ROUTINE_SOURCE,
                source_survey_submitted_at=survey.submitted_at,
                source_survey_version=survey.survey_version,
                source_scoring_version=survey.scoring_version,
                risk_level_snapshot=survey.risk_level,
                category_scores_snapshot=survey.category_scores,
                assigned_at=now,
                updated_at=now,
                deactivated_at=None,
            )
        )

    return documents


async def _load_routine_definitions(db) -> list[RoutineDefinitionDocument]:
    cursor = db.routine_definitions.find({"active": True})
    definitions: list[RoutineDefinitionDocument] = []
    async for raw in cursor:
        raw_without_id = {key: value for key, value in raw.items() if key != "_id"}
        definitions.append(RoutineDefinitionDocument.model_validate(raw_without_id))

    if definitions:
        return definitions
    return [item for item in ROUTINE_DEFINITION_CATALOG if item.active]


async def assign_user_routines_from_survey(
    user_id: str,
    survey: DementiaSurveyResultDocument,
) -> list[UserRoutineDocument]:
    db = get_db()
    now = datetime.now(timezone.utc)
    definitions = await _load_routine_definitions(db)
    selections = select_routine_definitions_for_survey(survey, definitions=definitions)
    documents = build_user_routine_documents(
        user_id,
        survey,
        selections=selections,
        assigned_at=now,
    )

    await db.user_routines.update_many(
        {"user_id": user_id, "active": True, "source": SURVEY_ROUTINE_SOURCE},
        {"$set": {"active": False, "deactivated_at": now, "updated_at": now}},
    )

    if documents:
        await db.user_routines.insert_many([doc.model_dump() for doc in documents])

    return documents
