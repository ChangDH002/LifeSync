from datetime import datetime, timedelta, timezone
from typing import Any

from app.db import get_db
from app.schemas.mypage import (
    MypageActivity,
    MypageSummaryMetrics,
    MypageSummaryResponse,
    MypageSurveyBanner,
    MypageTabSection,
    MypageUserProfile,
)
from app.services import routines as routines_service
from app.services import survey as survey_service


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
    """(routine_weekly_completion_rate, training_completed_count) 반환"""
    db = get_db()
    week_end = week_start + timedelta(days=7)

    weekly_history = await routines_service.get_weekly_routine_history(user_id)
    weekly_achievement_rate = weekly_history.weeklyCompletionRate

    # 이번 주 훈련 이벤트 건수
    training_count = await db.training_events.count_documents(
        {
            "user_id": user_id,
            "occurred_at": {"$gte": week_start, "$lt": week_end},
        }
    )

    return weekly_achievement_rate, training_count


def _format_activity_detail(occurred_at: datetime) -> str:
    if occurred_at.tzinfo is None:
        occurred_at = occurred_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    delta = now - occurred_at
    if delta.days == 0:
        return f"오늘 {occurred_at.astimezone(timezone.utc).strftime('%H:%M')}"
    if delta.days == 1:
        return f"어제 {occurred_at.astimezone(timezone.utc).strftime('%H:%M')}"
    return f"{delta.days}일 전"


async def _get_recent_activities(
    user_id: str,
    *,
    latest_survey=None,
    limit: int = 5,
) -> list[MypageActivity]:
    db = get_db()
    events: list[tuple[datetime, MypageActivity]] = []

    training_cursor = (
        db.training_events.find({"user_id": user_id})
        .sort("occurred_at", -1)
        .limit(limit)
    )
    async for doc in training_cursor:
        occurred_at: datetime = doc.get("occurred_at", datetime.now(timezone.utc))
        if occurred_at.tzinfo is None:
            occurred_at = occurred_at.replace(tzinfo=timezone.utc)
        events.append(
            (
                occurred_at,
                MypageActivity(
                    title=f"{doc.get('game_name', '인지훈련')} 플레이",
                    detail=_format_activity_detail(occurred_at),
                    type="training",
                ),
            )
        )

    routine_cursor = (
        db.routine_completions.find({"user_id": user_id})
        .sort("completed_at", -1)
        .limit(limit)
    )
    async for doc in routine_cursor:
        completed_at: datetime = doc.get("completed_at", datetime.now(timezone.utc))
        if completed_at.tzinfo is None:
            completed_at = completed_at.replace(tzinfo=timezone.utc)
        title = doc.get("routine_title_snapshot") or doc.get("routine_id", "루틴")
        events.append(
            (
                completed_at,
                MypageActivity(
                    title=f"{title} 완료",
                    detail=_format_activity_detail(completed_at),
                    type="routine",
                ),
            )
        )

    if latest_survey is not None:
        submitted_at = latest_survey.submitted_at
        if submitted_at.tzinfo is None:
            submitted_at = submitted_at.replace(tzinfo=timezone.utc)
        events.append(
            (
                submitted_at,
                MypageActivity(
                    title="치매 위험도 설문 저장",
                    detail=_format_activity_detail(submitted_at),
                    type="survey",
                ),
            )
        )

    events.sort(key=lambda item: item[0], reverse=True)
    return [activity for _, activity in events[:limit]]


def _format_survey_date(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%d")


def _build_survey_bullets(category_scores: dict[str, float]) -> list[str]:
    if not category_scores:
        return ["영역별 설문 결과가 없습니다."]

    sorted_scores = sorted(category_scores.items(), key=lambda item: (-item[1], item[0]))
    bullets = []
    for category, score in sorted_scores:
        tone = "주의" if score >= 3 else "양호"
        bullets.append(f"{category}: {score}점 ({tone})")
    return bullets


def _survey_banner_description(risk_level: str, submitted_at: datetime) -> str:
    submitted_label = _format_survey_date(submitted_at)
    if risk_level == "위험도 높음":
        return f"{submitted_label} 기준 고위험 요인이 확인되어 루틴 실천과 전문가 상담을 함께 권장합니다."
    if risk_level == "위험도 보통":
        return f"{submitted_label} 기준 관리가 필요한 영역이 있어 맞춤 루틴 실천을 권장합니다."
    return f"{submitted_label} 기준 보호 요인을 유지하기 위한 맞춤 루틴이 준비되어 있습니다."


def _build_tabs(
    streak_days: int,
    weekly_achievement_rate: int,
    training_count: int,
    recent_activities: list[MypageActivity],
) -> dict[str, MypageTabSection]:
    training_bullets: list[str] = []
    game_counts: dict[str, int] = {}
    for act in recent_activities:
        if act.type != "training":
            continue
        game_counts[act.title] = game_counts.get(act.title, 0) + 1
    for title, count in list(game_counts.items())[:3]:
        training_bullets.append(f"{title} {count}회")
    if not training_bullets:
        training_bullets = ["아직 훈련 기록이 없습니다."]

    routine_bullets = [
        activity.title for activity in recent_activities if activity.type == "routine"
    ][:3]
    if not routine_bullets:
        routine_bullets = ["아직 이번 주 루틴 완료 기록이 없습니다."]

    return {
        "survey": MypageTabSection(
            heading="생활습관 설문 요약",
            description="설문을 완료하면 현재 상태에 맞는 맞춤형 루틴을 추천받을 수 있습니다.",
            bullets=["설문을 아직 작성하지 않았습니다."],
        ),
        "routine": MypageTabSection(
            heading="이번 주 루틴 진행 현황",
            description=f"이번 주 루틴 달성률은 {weekly_achievement_rate}%입니다.",
            bullets=[
                f"이번 주 루틴 달성률 {weekly_achievement_rate}%",
                *routine_bullets,
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
    latest_survey = await survey_service.get_latest_dementia_risk_survey(user_id)
    recent_activities = await _get_recent_activities(user_id, latest_survey=latest_survey)
    today_routines = await routines_service.get_today_routines(user_id)
    today_routine_total = len(today_routines.items)
    today_routine_completed = sum(1 for item in today_routines.items if item.completed)

    summary_metrics = MypageSummaryMetrics(
        streakDays=streak_days,
        todayRoutineCompleted=today_routine_completed,
        todayRoutineTotal=today_routine_total,
        weeklyAchievementRate=weekly_achievement_rate,
        trainingCompletedCount=training_count,
    )

    if latest_survey is not None:
        submitted_at = latest_survey.submitted_at
        survey_banner = MypageSurveyBanner(
            needsUpdate=False,
            bannerTitle=f"최근 치매 위험도: {latest_survey.risk_level}",
            bannerDescription=_survey_banner_description(
                latest_survey.risk_level,
                submitted_at,
            ),
        )
    else:
        survey_banner = MypageSurveyBanner(
            needsUpdate=True,
            bannerTitle="생활습관 설문을 작성해주세요",
            bannerDescription="설문을 통해 현재 상태를 파악하고 맞춤형 루틴 추천을 받아보세요.",
        )

    tabs = _build_tabs(streak_days, weekly_achievement_rate, training_count, recent_activities)
    if latest_survey is not None:
        tabs["survey"] = MypageTabSection(
            heading="최근 치매 위험도 설문 결과",
            description=(
                f"총 {latest_survey.total_score}점으로 "
                f"{latest_survey.risk_level} 단계입니다."
            ),
            bullets=_build_survey_bullets(latest_survey.category_scores),
        )

    return MypageSummaryResponse(
        user=user_profile,
        survey=survey_banner,
        summary=summary_metrics,
        recentActivities=recent_activities,
        tabs=tabs,
    )
