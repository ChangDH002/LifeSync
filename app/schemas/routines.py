from pydantic import BaseModel


class RoutineItem(BaseModel):
    id: str
    title: str
    completed: bool


class TodayRoutinesResponse(BaseModel):
    items: list[RoutineItem]
