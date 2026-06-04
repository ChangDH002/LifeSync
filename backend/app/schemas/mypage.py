from pydantic import BaseModel


class MypageUserProfile(BaseModel):
    id: str
    name: str
    email: str
    joinedLabel: str


class MypageSurveyBanner(BaseModel):
    needsUpdate: bool
    bannerTitle: str
    bannerDescription: str


class MypageSummaryMetrics(BaseModel):
    streakDays: int
    todayRoutineCompleted: int
    todayRoutineTotal: int
    weeklyAchievementRate: int
    trainingCompletedCount: int


class MypageActivity(BaseModel):
    title: str
    detail: str
    type: str  # 'routine' | 'training' | 'survey' | 'general'


class MypageTabSection(BaseModel):
    heading: str
    description: str
    bullets: list[str]


class MypageSummaryResponse(BaseModel):
    user: MypageUserProfile
    survey: MypageSurveyBanner
    summary: MypageSummaryMetrics
    recentActivities: list[MypageActivity]
    tabs: dict[str, MypageTabSection]
