from datetime import datetime, timedelta, timezone
from typing import Any

from bson import ObjectId

from app.db import get_db
from app.schemas.mypage import (
    MypageActivity,
    MypageSummaryMetrics,
    MypageSummaryResponse,
    MypageSurveyBanner,
    MypageTabSection,
    MypageUserProfile,
)


def _today_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _date_str(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def _build_joined_label(created_at: datetime | None) -> str:
    if created_at is None:
        return "가입일 정보 없음"
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    delta = now - created_at
    days = delta.days
    if days == 0:
        return "가입 1일 미만"
    if days < 7:
        return f"가입 {days}일"
    if days < 30:
        weeks = days // 7
        return f"가입 {weeks}주"
    if days < 365:
        months = days // 30
        return f"가입 {months}개월"
    years = days // 365
    return f"가입 {years}년"


def _build_user_profile(user_doc: dict[str, Any]) -> MypageUserProfile:
    return MypageUserProfile(
        id=str(user_doc["_id"]),
        name=user_doc.get("name") or "사용자",
        email=user_doc.get("email", ""),
        joinedLabel=_build_joined_label(user_doc.get("created_at")),
    )


async def _calc_streak(user_id: str, today: datetime) -> int:
    db = get_db()
    streak = 0
    cursor_date = today
    for _ in range(365):
        date_str = _date_str(cursor_date)
        doc = await db.attendance_logs.find_one({"user_id": user_id, "date": date_str})
        if doc is None:
            break
        streak += 1
        cursor_date -= timedelta(days=1)
    return streak


async def _calc_weekly_stats(user_id: str, week_start: datetime) -> tuple[int, int]:
    """(weekly_achievement_rate, training_completed_count) 반환"""
    db = get_db()
    week_end = week_start + timedelta(days=7)

    # 이번 주 출석 일수
    attendance_count = await db.attendance_logs.count_documents(
        {
            "user_id": user_id,
            "date": {
                "$gte": _date_str(week_start),
                "$lt": _date_str(week_end),
            },
        }
    )
    weekly_achievement_rate = min(int(attendance_count / 7 * 100), 100)

    # 이번 주 훈련 이벤트 건수
    training_count = await db.training_events.count_documents(
        {
            "user_id": user_id,
            "occurred_at": {"$gte": week_start, "$lt": week_end},
        }
    )

    return weekly_achievement_rate, training_count


async def _get_recent_activities(user_id: str, limit: int = 5) -> list[MypageActivity]:
    db = get_db()
    cursor = (
        db.training_events.find({"user_id": user_id})
        .sort("occurred_at", -1)
        .limit(limit)
    )
    activities: list[MypageActivity] = []
    async for doc in cursor:
        occurred_at: datetime = doc.get("occurred_at", datetime.now(timezone.utc))
        if occurred_at.tzinfo is None:
            occurred_at = occurred_at.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        delta = now - occurred_at
        if delta.days == 0:
            detail = f"오늘 {occurred_at.astimezone(timezone.utc).strftime('%H:%M')}"
        elif delta.days == 1:
            detail = f"어제 {occurred_at.astimezone(timezone.utc).strftime('%H:%M')}"
        else:
            detail = f"{delta.days}일 전"

        activities.append(
            MypageActivity(
                title=f"{doc.get('game_name', '인지훈련')} 플레이",
                detail=detail,
                type="training",
            )
        )
    return activities


def _build_tabs(
    streak_days: int,
    weekly_achievement_rate: int,
    training_count: int,
    recent_activities: list[MypageActivity],
) -> dict[str, MypageTabSection]:
    training_bullets: list[str] = []
    game_counts: dict[str, int] = {}
    for act in recent_activities:
        game_counts[act.title] = game_counts.get(act.title, 0) + 1
    for title, count in list(game_counts.items())[:3]:
        training_bullets.append(f"{title} {count}회")
    if not training_bullets:
        training_bullets = ["아직 훈련 기록이 없습니다."]

    return {
        "survey": MypageTabSection(
            heading="생활습관 설문 요약",
            description="설문을 완료하면 현재 상태에 맞는 맞춤형 루틴을 추천받을 수 있습니다.",
            bullets=["설문을 아직 작성하지 않았습니다."],
        ),
        "routine": MypageTabSection(
            heading="이번 주 루틴 진행 현황",
            description=f"이번 주 출석 달성률은 {weekly_achievement_rate}%입니다.",
            bullets=[
                f"이번 주 출석 달성률 {weekly_achievement_rate}%",
                f"연속 출석 {streak_days}일 유지 중",
            ],
        ),
        "training": MypageTabSection(
            heading="인지훈련 요약",
            description=f"이번 주 총 {training_count}회 훈련을 완료했습니다.",
            bullets=training_bullets,
        ),
    }


async def get_mypage_summary(user_id: str, user_doc: dict[str, Any]) -> MypageSummaryResponse:
    today = _today_utc()
    week_start = today - timedelta(days=today.weekday())

    user_profile = _build_user_profile(user_doc)
    streak_days = await _calc_streak(user_id, today)
    weekly_achievement_rate, training_count = await _calc_weekly_stats(user_id, week_start)
    recent_activities = await _get_recent_activities(user_id)

    summary_metrics = MypageSummaryMetrics(
        streakDays=streak_days,
        todayRoutineCompleted=0,
        todayRoutineTotal=0,
        weeklyAchievementRate=weekly_achievement_rate,
        trainingCompletedCount=training_count,
    )

    survey_banner = MypageSurveyBanner(
        needsUpdate=True,
        bannerTitle="생활습관 설문을 작성해주세요",
        bannerDescription="설문을 통해 현재 상태를 파악하고 맞춤형 루틴 추천을 받아보세요.",
    )

    tabs = _build_tabs(streak_days, weekly_achievement_rate, training_count, recent_activities)

    return MypageSummaryResponse(
        user=user_profile,
        survey=survey_banner,
        summary=summary_metrics,
        recentActivities=recent_activities,
        tabs=tabs,
    )
