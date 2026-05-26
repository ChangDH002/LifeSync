from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RoutineCategory = Literal["exercise", "social", "sleep", "cognitive", "nutrition", "lifestyle"]
RoutineFrequency = Literal["daily", "weekly", "custom"]
RoutineSource = Literal["survey", "fallback", "manual"]


class RoutineDefinitionDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    routine_id: str
    title: str
    category: RoutineCategory
    description: str
    recommendation_reason_template: str
    target_factors: list[str] = Field(default_factory=list)
    target_categories: list[str] = Field(default_factory=list)
    frequency: RoutineFrequency = "daily"
    default_priority: int = 100
    active: bool = True
    created_at: datetime
    updated_at: datetime


class UserRoutineDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    routine_id: str
    title: str
    category: RoutineCategory
    description: str
    recommendation_reason: str
    frequency: RoutineFrequency = "daily"
    priority: int = 100
    active: bool = True
    source: RoutineSource
    source_survey_submitted_at: datetime | None = None
    source_survey_version: str | None = None
    source_scoring_version: str | None = None
    risk_level_snapshot: str | None = None
    category_scores_snapshot: dict[str, float] = Field(default_factory=dict)
    assigned_at: datetime
    updated_at: datetime
    deactivated_at: datetime | None = None


class RoutineCompletionDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    routine_id: str
    date: str
    completed_at: datetime
    source_user_routine_id: str | None = None
    routine_title_snapshot: str | None = None
    category_snapshot: RoutineCategory | None = None


class RoutineItem(BaseModel):
    id: str
    title: str
    completed: bool
    category: RoutineCategory | None = None
    description: str | None = None
    recommendationReason: str | None = None
    frequency: RoutineFrequency | None = None
    priority: int | None = None
    active: bool = True


class TodayRoutinesResponse(BaseModel):
    items: list[RoutineItem]


class RoutineCompletionActionResponse(BaseModel):
    routineId: str
    date: str
    completed: bool
    completedAt: datetime | None = None


class RoutineHistoryDay(BaseModel):
    date: str
    completedCount: int
    totalCount: int
    completedRoutineIds: list[str] = Field(default_factory=list)


class RoutineWeeklyHistoryResponse(BaseModel):
    weekStart: str
    weekEnd: str
    days: list[RoutineHistoryDay]
    weeklyCompletionRate: int
    today: TodayRoutinesResponse
