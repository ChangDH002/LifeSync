# 설문 기반 루틴 추천 서비스 구현 요약

## 목적

치매 위험도 설문(`dementia-risk`) 저장 직후, 서버가 계산한 설문 결과를 바탕으로 사용자별 맞춤 루틴을 **`user_routines` 컬렉션에 배정**한다.

이전에는 모든 사용자에게 동일한 정적 루틴 3개만 `GET /routines/today`로 내려갔다.  
이제는 **설문을 제출한 사용자**는 설문 응답·영역 점수·위험도에 맞춰 선정된 루틴 3개를 받는다.

## 관련 파일

| 파일 | 역할 |
|------|------|
| `app/services/routine_recommendation.py` | 추천 점수, 선정, `user_routines` 배정 |
| `app/services/survey.py` | 설문 저장 후 추천 서비스 호출 |
| `app/services/routines.py` | 루틴 카탈로그(`ROUTINE_DEFINITION_CATALOG`), 오늘 루틴 조회 |
| `app/schemas/routines.py` | `RoutineDefinitionDocument`, `UserRoutineDocument` |
| `app/schemas/survey.py` | `DementiaSurveyResultDocument` (추천 입력) |
| `tests/test_routine_recommendation.py` | 추천·배정 단위 테스트 |

## 전체 흐름

```text
POST /survey/dementia-risk  (로그인 필수)
        │
        ▼
build_dementia_risk_survey_document()
  · 서버 점수 재계산 (CogDrisk + ANU-ADRI)
  · category_scores, risk_level, normalized_responses 생성
        │
        ▼
survey_results.insert_one()
        │
        ▼
assign_user_routines_from_survey(user_id, survey_doc)
  1) routine_definitions 조회 (없으면 코드 카탈로그)
  2) 관련도 점수로 루틴 3개 선정
  3) 기존 source=survey 활성 루틴 비활성화
  4) user_routines 3건 insert
        │
        ▼
GET /routines/today
  · user_routines(active) 우선 → 완료 여부 routine_completions 결합
  · user_routines 없으면 FALLBACK_ROUTINE_DEFINITIONS 3개
```

## 진입점

설문 저장 서비스에서 **동기적으로** 추천 배정이 이어진다.

```python
# app/services/survey.py — save_dementia_risk_survey()
result = await db.survey_results.insert_one(doc.model_dump())
await routine_recommendation_service.assign_user_routines_from_survey(user_id, doc)
```

별도의 `POST /routines/recommend` API는 없다. 설문 제출이 곧 루틴 재배정 트리거이다.

## 추천 입력 데이터

`DementiaSurveyResultDocument`에서 아래 필드를 사용한다.

| 필드 | 추천에서의 용도 |
|------|----------------|
| `category_scores` | 루틴 `target_categories`와 매칭 (영역별 점수가 높을수록 해당 루틴 가중) |
| `normalized_responses` | 루틴 `target_factors`와 매칭 (응답 상태가 “개선 필요”일수록 가중) |
| `risk_level` | 전체 위험도 보너스 (`위험도 높음` > `위험도 보통` > `위험도 낮음`) |
| `submitted_at`, `survey_version`, `scoring_version` | `UserRoutineDocument` 스냅샷 메타 |
| `risk_level`, `category_scores` | `risk_level_snapshot`, `category_scores_snapshot` 저장 |

설문 원본(`responses`)은 추천 점수에 직접 쓰지 않고, 서버가 표준화한 `normalized_responses`만 사용한다.

## 루틴 카탈로그

### 후보 로딩 순서

1. MongoDB `routine_definitions` 컬렉션에서 `active: true` 문서 조회
2. **비어 있으면** `app/services/routines.py`의 `ROUTINE_DEFINITION_CATALOG` 사용

앱 시작 시 `seed_routine_definitions()`가 코드 카탈로그 6개를 `routine_definitions`에 upsert한다. DB 조회가 실패하거나 컬렉션이 비어 있는 경우에만 코드 상수 fallback을 사용한다.

### 코드 카탈로그 (6개)

| routine_id | 제목 요약 | category | target_factors | target_categories |
|------------|-----------|----------|----------------|-------------------|
| `routine-walk` | 식사 후 10분 걷기 | exercise | physical_activity | 생활습관 |
| `routine-talk` | 가족·지인과 대화 | social | social_engagement, loneliness | 심리·신경 |
| `routine-sleep` | 취침 전 화면 줄이기 | sleep | insomnia | 심리·신경, 생활습관 |
| `routine-brain` | 인지 자극 10분 | cognitive | cognitive_activity | 생활습관 |
| `routine-fish` | 생선·견과류 섭취 | nutrition | fish_intake | 생활습관, 심혈관·대사 |
| `routine-mood` | 호흡·스트레칭 | lifestyle | depression, insomnia | 심리·신경 |

`FALLBACK_ROUTINE_DEFINITIONS`는 위 카탈로그 **앞 3개**(walk, talk, sleep)만 사용한다.  
설문을 한 번도 하지 않은 사용자는 여전히 이 3개를 본다.

## 관련도 점수 (`score_routine_definition`)

각 후보 루틴에 대해 다음을 **합산**한다.

```text
관련도 = factor 점수 합 + category 점수 + risk_level 보너스
```

### 1) Factor 점수 (`_factor_relevance_score`)

`normalized_responses`에 해당 factor가 있고, 값이 “개선 필요” 상태일 때 가산한다.

| factor | 높은 가중 (예) | 중간 가중 (예) |
|--------|----------------|----------------|
| `physical_activity` | low, insufficient → 18 | medium → 10 |
| `cognitive_activity`, `social_engagement` | low → 18 | medium → 10 |
| `loneliness` | high → 18 | medium → 10 |
| `fish_intake` | none, rarely → 14 | sometimes, weekly → 8 |
| `smoking_status` | current → 10 | — |
| `insomnia`, `depression`, `has_diabetes`, `has_hypertension` | true → 14 | — |

한 루틴에 `target_factors`가 여러 개면 **각 factor 점수를 합산**한다.

### 2) Category 점수 (`_category_relevance_score`)

루틴의 `target_categories` 중 **가장 높은** `category_scores` 값을 사용한다.

예: `target_categories = ["심리·신경", "생활습관"]`이면  
`max(category_scores["심리·신경"], category_scores["생활습관"])`.

### 3) 위험도 보너스 (`_risk_level_bonus`)

| risk_level | 보너스 |
|------------|--------|
| 위험도 높음 | +6 |
| 위험도 보통 | +3 |
| 위험도 낮음 | +0 |

## 루틴 선정 (`select_routine_definitions_for_survey`)

1. 카탈로그의 모든 `active` 루틴에 관련도 계산
2. 관련도 > 0 인 루틴만 후보로 포함
3. 정렬: **관련도 내림차순** → `default_priority` 오름차순 → `routine_id`
4. 상위 **3개** 선택 (`MAX_ASSIGNED_ROUTINES = 3`)
5. 후보가 하나도 없으면 `default_priority` 기준 카탈로그 상위 3개를 기본 선택

### 배정 priority

```text
priority = max(1, default_priority - int(관련도))
```

관련도가 높을수록 `priority` 숫자가 **작아져** `GET /routines/today` 정렬 시 더 앞에 온다.

### 추천 근거 문구 (`build_recommendation_reason`)

우선순위:

1. **Factor 매칭** (factor 관련도 ≥ 10):  
   `"설문에서 {신체 활동|인지 활동|…} 개선이 필요해 보여 {template}"`
2. **Category 매칭** (영역 점수 > 0):  
   `"{영역} 영역 점수(N점)를 바탕으로 {template}"`
3. 그 외: `recommendation_reason_template` 그대로

## 사용자 루틴 저장 (`assign_user_routines_from_survey`)

### 갱신 정책

재설문 시 **이전 설문 기반 루틴만** 교체한다.

```text
update_many:
  user_id = 해당 사용자
  active = true
  source = "survey"
→ active=false, deactivated_at=now

insert_many:
  새 UserRoutineDocument 3건 (source="survey")
```

`source`가 `manual` 등인 루틴(향후 추가 시)은 건드리지 않는다.

### 저장되는 `UserRoutineDocument` 주요 필드

| 필드 | 값 |
|------|-----|
| `routine_id`, `title`, `category`, `description` | 선정된 정의에서 복사 |
| `recommendation_reason` | `build_recommendation_reason` 결과 |
| `priority` | 선정 시 계산값 |
| `source` | `"survey"` |
| `source_survey_submitted_at` | 설문 `submitted_at` |
| `source_survey_version`, `source_scoring_version` | 설문 메타 |
| `risk_level_snapshot`, `category_scores_snapshot` | 추천 당시 설문 스냅샷 |

## 오늘 루틴 조회와의 관계

`app/services/routines.py` — `get_today_routines()`:

1. `user_routines`에서 `active: true` 조회, `priority` 오름차순
2. **있으면** 맞춤 루틴 반환 (`recommendation_reason` 포함)
3. **없으면** `FALLBACK_ROUTINE_DEFINITIONS` 3개
4. `routine_completions`로 오늘 날짜 `completed` 플래그 설정

마이페이지 `todayRoutineCompleted` / `todayRoutineTotal`도 동일한 `get_today_routines()` 결과를 사용한다. 주간 달성률은 `GET /routines/weekly`의 `weeklyCompletionRate`를 기준으로 한다.

## 테스트

`tests/test_routine_recommendation.py`:

- low activity 설문에서 `routine-walk`, `routine-brain` 선정
- 추천 근거에 factor 라벨 포함
- `UserRoutineDocument`에 설문 스냅샷 필드 반영
- 재배정 시 이전 `source=survey` 루틴 비활성화
- `save_dementia_risk_survey`가 `assign_user_routines_from_survey` 호출

실행:

```powershell
python -m pytest tests/test_routine_recommendation.py -q
```

## 루틴 완료·주간 이력 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/routines/{routine_id}/complete` | 오늘 루틴 완료 기록 (이미 완료 시 idempotent) |
| `DELETE` | `/routines/{routine_id}/complete` | 오늘 완료 취소 |
| `GET` | `/routines/weekly` | 이번 주(월~오늘) 일별 완료 수·주간 달성률 + 오늘 루틴 목록 |

완료/취소는 **오늘 날짜·오늘의 루틴 목록에 있는 `routine_id`만** 허용한다.

## 현재 한계와 다음 단계

| 항목 | 상태 |
|------|------|
| `routine_definitions` 관리 API | 미구현 (초기 시드는 앱 시작 시 upsert) |
| 추천 규칙 ML/외부 추천 엔진 | 미사용 (규칙 기반 점수만) |
| 비회원 설문 임시 저장·로그인 후 복구 | 미구현 |
| HTTP 통합/E2E 테스트 | 보강 필요 |

## 관련 문서

- [PERSONALIZED_ROUTINE_MODEL_SUMMARY.md](./PERSONALIZED_ROUTINE_MODEL_SUMMARY.md) — 루틴 3컬렉션 데이터 모델
- [SURVEY_DATA_MODEL_SUMMARY.md](./SURVEY_DATA_MODEL_SUMMARY.md) — 설문 결과 문서 구조
- [ROUTINE_SURVEY_FEATURE_TODO.md](./ROUTINE_SURVEY_FEATURE_TODO.md) — 남은 기능 TODO
