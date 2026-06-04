from pydantic import BaseModel


class AvatarSchema(BaseModel):
    id: str
    name: str
    level: int
    experience: int
    maxExperience: int
    waterCount: int
    stage: int
    maxStage: int
    treeType: str
    dailyWateringChanceAvailable: bool


class WaterTreeResponse(BaseModel):
    used: bool
    wateringChanceRemaining: int
    expGained: int
    avatar: AvatarSchema
