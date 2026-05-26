# 설문 저장 API 고도화 변경 요약

## 목적

설문 결과 저장 시 프론트엔드가 계산해서 보낸 점수를 그대로 신뢰하지 않고, 백엔드가 응답 원본을 기준으로 위험도 점수와 영역별 점수를 다시 계산하도록 변경했다.

이제 `POST /survey/dementia-risk`는 다음 원칙으로 동작한다.

- 서버 계산값을 최종 저장 기준으로 사용한다.
- 프론트 제출 점수는 감사/디버그 정보로만 보존한다.
- 설문 버전과 점수 계산 버전을 함께 저장한다.
- 중복 제출은 이력 전체 저장 방식으로 유지한다.
- 재진단/수정은 기존 문서 갱신이 아니라 새 제출 이력 추가로 처리한다.

## 변경 전

기존 `app/services/survey.py`는 일부 위험도는 서버에서 계산했지만, 아래 값은 프론트 요청값을 그대로 저장했다.

- `total_score` ← `req.totalScore`
- `category_scores` ← `req.categoryScores`
- 프론트 점수와 서버 계산값의 차이 기록 없음
- 설문 버전/점수 계산 버전 없음
- 제출 이력 정책이 문서화되지 않음

## 변경 후 저장 흐름

```text
프론트 설문 응답
  ↓
POST /survey/dementia-risk
  ↓
responses 정규화
  ↓
CogDrisk + ANU-ADRI 점수 계산
  ↓
final_risk_score / risk_level / category_scores 서버 계산
  ↓
client_submitted / score_mismatch 감사 정보 생성
  ↓
survey_results에 이력 저장
```

## 백엔드 변경

### `app/schemas/survey.py`

요청 스키마에 버전 필드를 추가했다.

- `surveyVersion`
- `clientVersion`

응답 스키마에 서버 계산 결과 필드를 추가했다.

- `surveyVersion`
- `scoringVersion`
- `categoryScores`
- `responseCount`

### `app/services/survey.py`

설문 저장 로직을 서버 기준 계산으로 변경했다.

- `build_dementia_risk_survey_document()` 추가
- `total_score`는 서버의 `final_risk_score`로 저장
- `risk_level`은 서버 계산값으로 저장
- `category_scores`는 `CogDrisk + ANU-ADRI`의 `matchedFactors`를 카테고리별로 합산
- `client_submitted`에 프론트 제출 점수 보존
- `score_mismatch`, `score_delta`로 프론트 점수와 서버 점수 차이 기록
- `survey_version`, `scoring_version`, `client_version` 저장
- `submission_policy`는 `append_history`로 저장
- 재진단 정책은 `resubmit_creates_new_result`로 정의한다. 즉, 재설문은 기존 문서를 수정하지 않고 새 이력을 추가한다.
- 잘못된 `surveyType`, 부족한 응답, 필수 응답 누락은 `400`으로 거절

## 제출/재진단 정책

| 항목 | 정책 |
|------|------|
| 중복 제출 | 서버는 제출을 차단하지 않고 모두 이력으로 저장한다. |
| 최신 결과 | `submitted_at` 기준 최신 문서를 조회한다. |
| 재진단 | 새 설문 결과 문서를 추가하고, 맞춤 루틴은 최신 설문 기준으로 재배정한다. |
| 수정/삭제 | 별도 API를 제공하지 않는다. 잘못 제출한 경우 다시 제출해 새 이력을 남긴다. |
| 짧은 시간 중복 클릭 | 서버 정책은 이력 저장을 유지한다. UI에서 중복 클릭 방지를 처리하는 것을 권장한다. |

## 인증/비회원 정책

| 항목 | 정책 |
|------|------|
| 설문 저장 API | JWT Bearer 인증 필수. 토큰이 없으면 `401`을 반환한다. |
| 비회원 설문 화면 | 화면 진행은 허용하지만 서버 저장은 하지 않는다. |
| 비회원 임시 저장 | 백엔드 저장소에는 임시 결과를 만들지 않는다. 필요 시 프론트 `localStorage`에 보관한다. |
| 로그인 후 복구 | 별도 복구 API는 만들지 않고, 로그인 후 기존 `POST /survey/dementia-risk`로 재제출한다. |
| 맞춤 루틴 생성 | 인증된 설문 저장이 성공한 경우에만 `user_routines`를 생성/갱신한다. |

## 저장 문서 구조

`survey_results`에 저장되는 핵심 필드는 다음과 같다.

```json
{
  "user_id": "...",
  "survey_type": "dementia-risk",
  "survey_version": "dementia-risk-v1",
  "scoring_version": "cogdrisk-anuadri-v1",
  "client_version": "local-dev",
  "total_score": 42.3,
  "risk_level": "위험도 보통",
  "final_risk_score": 42.3,
  "category_scores": {
    "인구통계": 10.0,
    "심혈관·대사": 8.0,
    "심리·신경": 3.0,
    "생활습관": -2.0
  },
  "responses": {},
  "normalized_responses": {},
  "ignored_fields": [],
  "client_submitted": {
    "total_score": 999,
    "risk_level": "위험도 낮음",
    "category_scores": {}
  },
  "score_mismatch": true,
  "score_delta": 956.7,
  "submission_policy": "append_history",
  "response_count": 8,
  "submitted_at": "...",
  "created_at": "..."
}
```

## 프론트엔드 변경

### `LifeSync-frontend/src/features/survey/types.ts`

백엔드 응답 타입에 서버 계산 필드를 반영했다.

- `surveyVersion`
- `scoringVersion`
- `categoryScores`
- `responseCount`

### `LifeSync-frontend/src/features/survey/ui/DementiaSurvey.tsx`

결과 화면에서 영역별 점수를 프론트 재계산값이 아니라 서버 응답값 기준으로 표시한다.

- 기존: 프론트에서 `matchedFactors`를 다시 합산
- 변경: `serverResult.categoryScores` 사용

설문 저장 요청에는 다음 버전 정보를 포함한다.

- `surveyVersion: "dementia-risk-v1"`
- `clientVersion: import.meta.env.VITE_APP_VERSION || "local-dev"`

## 테스트 추가

### `tests/test_survey_scoring.py`

다음 내용을 검증한다.

- 프론트가 조작한 `totalScore`를 보내도 서버 계산값이 저장된다.
- 프론트 점수는 `client_submitted`에만 보존된다.
- `score_mismatch`가 정상 기록된다.
- `survey_version`, `scoring_version`, `submission_policy`가 저장된다.
- 서버가 카테고리별 점수를 계산한다.
- 잘못된 설문 타입은 `400`으로 거절된다.
- 핵심 응답 누락 시 `400`으로 거절된다.

## 함께 수정된 AI 안전 문구

전체 테스트 실행 중 기존 AI 테스트에서 안전 고지 누락이 발견되어 함께 수정했다.

- `app/services/gemini_service.py`
  - fallback 응답 마지막에 `본 서비스는 의료적 진단을 제공하지 않습니다.`를 항상 추가

- `app/services/prompt_builder.py`
  - 챗봇 프롬프트에 안전 고지를 반드시 포함하라는 지시 추가

## 검증 결과

```powershell
python -m pytest -q
```

결과:

```text
33 passed
```

```powershell
cd LifeSync-frontend
npm run type-check
```

결과:

```text
tsc --noEmit 통과
```

## 남은 TODO

이번 작업으로 `Backend TODO > 1. 설문 저장 API 고도화`의 대부분은 완료됐다.

아직 별도 정책 결정이 필요한 항목은 다음이다.

- 설문 결과 수정 API를 만들지 여부
- 재진단 시 이전 결과와 비교하는 UX/API를 만들지 여부
- `survey_version`별 질문 세트를 서버에서 직접 관리할지 여부
