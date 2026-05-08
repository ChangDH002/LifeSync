from datetime import datetime

from pydantic import BaseModel


class TrainingMetadata(BaseModel):
    model_config = {"extra": "allow"}


class TrainingParticipationRequest(BaseModel):
    gameCategory: str
    gameName: str
    eventType: str
    occurredAt: datetime
    attendanceCandidate: bool = False
    wateringChanceCandidate: bool = False
    metadata: TrainingMetadata | None = None


class TrainingParticipationResponse(BaseModel):
    attendanceMarked: bool
    wateringChanceGranted: bool
    dailyWateringChanceAvailable: bool
