# 사용자별 맞춤 루틴 데이터 모델 구현 요약

## 목적

설문 결과를 기반으로 사용자별 맞춤 루틴을 추천하고 저장할 수 있도록 루틴 데이터 구조를 확장했다.

기존에는 백엔드가 정적 루틴 3개를 바로 반환했다. 이제는 다음 구조를 기준으로 동작한다.

- 전체 루틴 후보: `routine_definitions`
- 사용자별 추천/배정 루틴: `user_routines`
- 날짜별 완료 기록: `routine_completions`

## 변경 전

기존 루틴 구조는 단순했다.

- `app/services/routines.py`의 `STATIC_ROUTINES` 3개만 사용
- 응답 필드: `id`, `title`, `completed`
- 사용자별 추천 루틴 저장 컬렉션 없음
- 설문 결과와 루틴을 연결하는 메타데이터 없음
- `routine_completions`는 조회에만 사용

## 변경 후 구조

오늘 루틴 조회는 다음 순서로 동작한다.

```text
GET /routines/today
  ↓
user_routines에서 사용자 active 루틴 조회
  ↓
있으면 user_routines 사용
  ↓
없으면 fallback 루틴 3개 사용
  ↓
routine_completions로 오늘 완료 여부 결합
  ↓
TodayRoutinesResponse 반환
```

## 추가된 루틴 문서 모델

파일: `app/schemas/routines.py`

### `RoutineDefinitionDocument`

전체 루틴 후보 카탈로그 문서다.

주요 필드:

- `routine_id`
- `title`
- `category`
- `description`
- `recommendation_reason_template`
- `target_factors`
- `target_categories`
- `frequency`
- `default_priority`
- `active`
- `created_at`
- `updated_at`

### `UserRoutineDocument`

사용자별로 실제 추천/배정된 루틴 문서다.

주요 필드:

- `user_id`
- `routine_id`
- `title`
- `category`
- `description`
- `recommendation_reason`
- `frequency`
- `priority`
- `active`
- `source`
- `source_survey_submitted_at`
- `source_survey_version`
- `source_scoring_version`
- `risk_level_snapshot`
- `category_scores_snapshot`
- `assigned_at`
- `updated_at`
- `deactivated_at`

### `RoutineCompletionDocument`

날짜별 루틴 완료 기록 문서다.

주요 필드:

- `user_id`
- `routine_id`
- `date`
- `completed_at`
- `source_user_routine_id`
- `routine_title_snapshot`
- `category_snapshot`

## 응답 모델 확장

기존 `RoutineItem`은 호환성을 유지하면서 필드를 확장했다.

기존 필드:

- `id`
- `title`
- `completed`

추가 필드:

- `category`
- `description`
- `recommendationReason`
- `frequency`
- `priority`
- `active`

프론트 타입도 `LifeSync-frontend/src/features/routine/types.ts`에서 같은 형태로 확장했다.

## DB 인덱스 추가

파일: `app/db.py`

추가된 인덱스:

- `routine_definitions.routine_id` unique
- `routine_definitions.active`
- `user_routines (user_id, active, priority)`
- `user_routines (user_id, routine_id, active)`
- `user_routines (user_id, source_survey_submitted_at)`

기존 완료 기록 인덱스는 유지한다.

- `routine_completions (user_id, routine_id, date)` unique

앱 시작 시 `seed_routine_definitions()`가 `ROUTINE_DEFINITION_CATALOG` 6개를 `routine_definitions`에 upsert한다.

## Fallback 루틴

파일: `app/services/routines.py`

기존 `STATIC_ROUTINES`는 `RoutineDefinitionDocument` 기반의 `FALLBACK_ROUTINE_DEFINITIONS`로 바뀌었다.

현재 fallback 루틴:

- `routine-walk`: 식사 후 10분 가벼운 걷기
- `routine-talk`: 하루 한 번 가족 또는 지인과 대화하기
- `routine-sleep`: 취침 전 밝은 화면 줄이고 수면 준비하기

사용자에게 `user_routines`가 아직 없으면 이 fallback 루틴을 반환한다.

## 설문 결과와 연결 가능한 메타데이터

`UserRoutineDocument`에는 설문 결과 기반 추천을 위한 snapshot 필드가 들어갔다.

- `source_survey_submitted_at`
- `source_survey_version`
- `source_scoring_version`
- `risk_level_snapshot`
- `category_scores_snapshot`

아직 실제 추천 규칙은 구현하지 않았지만, 다음 단계에서 설문 결과를 기반으로 `user_routines`를 생성할 수 있는 구조가 준비됐다.

## 테스트 추가

파일: `tests/test_routine_models.py`

검증 내용:

- `RoutineDefinitionDocument` 필수 필드 검증
- `UserRoutineDocument`가 알 수 없는 필드를 거절하는지 확인
- 사용자 루틴이 없을 때 fallback 루틴 반환
- 사용자 루틴이 있으면 fallback 대신 `user_routines` 우선 반환
- `routine_completions`에 따라 `completed` 값 반영
- 우선순위(`priority`) 정렬 확인

## 현재 검증 결과

```powershell
python -m pytest -q
```

결과:

```text
52 passed (이전 기록 기준, 최신 실행 결과는 테스트 로그 참고)
```

```powershell
cd LifeSync-frontend
npm run type-check
```

결과:

```text
tsc --noEmit 통과
```

## 구현 완료 기준

이번 구현으로 다음 기준을 충족한다.

- 사용자별 추천 루틴을 저장할 `user_routines` 문서 모델이 있다.
- 전체 루틴 후보를 관리할 `routine_definitions` 문서 모델이 있다.
- 기존 `/routines/today` 응답 호환성이 유지된다.
- 오늘 루틴 조회가 `user_routines` 우선, fallback 보조 구조로 바뀌었다.
- 설문 결과와 루틴 배정 결과를 연결할 메타데이터가 포함됐다.

## 다음 단계

설문 기반 루틴 추천 서비스, 루틴 완료/취소 API, 프론트 완료 UI, 마이페이지 루틴 집계는 구현 완료됐다. 상세는 [SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md](./SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md)를 참고한다.

남은 작업 예시:

- `routine_definitions` 관리 API
- 설문 제출/비회원 정책 정리
- HTTP 통합/E2E 테스트 보강
