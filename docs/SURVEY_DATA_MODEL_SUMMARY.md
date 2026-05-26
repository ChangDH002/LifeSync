# 설문 데이터 모델 구현 요약

## 목적

`survey_results` 컬렉션에 저장되는 설문 결과 문서 구조를 코드에서 명확히 검증할 수 있도록 DB 저장 전용 Pydantic 모델을 추가했다.

이제 설문 결과는 단순 `dict`가 아니라 `DementiaSurveyResultDocument` 모델을 통과한 뒤 MongoDB에 저장된다.

## 변경 전

기존 구조는 다음과 같았다.

- `app/services/survey.py`에서 저장 문서를 `dict`로 직접 구성
- DB 저장 문서 전용 스키마 없음
- 최신 설문 조회 헬퍼 반환 타입이 `dict[str, Any] | None`
- 마이페이지에서 최신 설문 결과를 `latest_survey.get(...)` 방식으로 읽음
- MongoDB `_id` 처리 정책이 명확하지 않음

## 변경 후

저장 문서 구조가 `app/schemas/survey.py`에 명시됐다.

### 추가된 모델

| 모델 | 역할 |
|------|------|
| `SurveyScoreToolDocument` | `cogdrisk`, `anu_adri` 점수 상세 저장 구조 |
| `ClientSubmittedSurveyScore` | 프론트가 제출한 점수 원본 저장 구조 |
| `DementiaSurveyResultDocument` | `survey_results`에 저장되는 최종 DB 문서 구조 |

## `DementiaSurveyResultDocument` 구조

```python
class DementiaSurveyResultDocument(BaseModel):
    user_id: str
    survey_type: str
    survey_version: str
    scoring_version: str
    client_version: str | None = None

    total_score: float
    risk_level: str
    final_risk_score: float
    category_scores: dict[str, float]

    responses: Any
    normalized_responses: dict[str, Any]
    ignored_fields: list[str]
    response_count: int

    client_submitted: ClientSubmittedSurveyScore
    score_mismatch: bool
    score_delta: float | None = None

    submission_policy: str
    cogdrisk: SurveyScoreToolDocument
    anu_adri: SurveyScoreToolDocument
    submitted_at: datetime
    created_at: datetime
```

## 필드 책임 분리

| 필드 | 의미 |
|------|------|
| `responses` | 프론트에서 온 원본 응답 |
| `normalized_responses` | 서버 점수 계산에 사용한 표준화 응답 |
| `ignored_fields` | 요청에는 있었지만 점수 계산에 사용되지 않은 필드 |
| `response_count` | `normalized_responses` 기준 응답 개수 |
| `total_score` | 서버 계산 최종 점수 |
| `final_risk_score` | 서버 계산 최종 위험도 점수 |
| `risk_level` | 서버 계산 위험도 등급 |
| `category_scores` | 서버 계산 영역별 점수 |
| `client_submitted` | 프론트가 제출한 점수 원본 |
| `score_mismatch` | 프론트 점수와 서버 점수가 다른지 여부 |
| `score_delta` | 프론트 점수와 서버 점수 차이 |
| `survey_version` | 설문 질문 세트 버전 |
| `scoring_version` | 점수 계산 로직 버전 |
| `client_version` | 프론트 앱 버전 |

## 저장 흐름

```text
POST /survey/dementia-risk
  ↓
DementiaSurveySubmitRequest 검증
  ↓
responses 정규화
  ↓
CogDrisk / ANU-ADRI 계산
  ↓
DementiaSurveyResultDocument 생성 및 검증
  ↓
doc.model_dump()
  ↓
MongoDB survey_results 저장
```

핵심 변경점은 `build_dementia_risk_survey_document()`가 이제 `dict`가 아니라 `DementiaSurveyResultDocument`를 반환한다는 점이다.

```python
def build_dementia_risk_survey_document(...) -> DementiaSurveyResultDocument:
    ...
    return DementiaSurveyResultDocument(...)
```

MongoDB 저장 시에는 다음처럼 변환한다.

```python
result = await db.survey_results.insert_one(doc.model_dump())
```

## 최신 설문 조회

`get_latest_dementia_risk_survey()`의 반환 타입이 명확해졌다.

```python
async def get_latest_dementia_risk_survey(
    user_id: str,
) -> DementiaSurveyResultDocument | None:
```

MongoDB에서 조회한 문서에는 `_id`가 포함되지만, `_id`는 도메인 문서 모델에 포함하지 않는다.

따라서 내부 helper에서 `_id`를 제외하고 모델로 변환한다.

```python
def _survey_document_from_mongo(raw: dict[str, Any]) -> DementiaSurveyResultDocument:
    raw_without_id = {key: value for key, value in raw.items() if key != "_id"}
    return DementiaSurveyResultDocument.model_validate(raw_without_id)
```

## 마이페이지 영향

`app/services/mypage.py`는 최신 설문 결과를 더 이상 `dict.get(...)`으로 읽지 않는다.

변경 전:

```python
latest_survey.get("risk_level", "결과 없음")
```

변경 후:

```python
latest_survey.risk_level
latest_survey.total_score
latest_survey.category_scores
```

이로 인해 마이페이지가 사용하는 최신 설문 결과도 모델 검증을 통과한 구조임이 보장된다.

## 테스트 보강

`tests/test_survey_scoring.py`에 다음 검증을 추가했다.

- `build_dementia_risk_survey_document()`가 `DementiaSurveyResultDocument`를 반환하는지 확인
- DB 문서 모델이 필수 필드 누락을 거절하는지 확인
- `response_count`가 `normalized_responses` 기준으로 계산되는지 확인
- `ignored_fields`가 알 수 없는 요청 필드를 기록하는지 확인
- `survey_version`, `scoring_version`, `client_version` 메타데이터 검증
- MongoDB `_id`가 모델 변환 시 제외되는지 확인

## 현재 검증 결과

```powershell
python -m pytest -q
```

결과:

```text
36 passed
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

이번 구현으로 `docs/ROUTINE_SURVEY_FEATURE_TODO.md`의 `2. 설문 데이터 모델` 항목은 다음 기준을 충족한다.

- `survey_results` 문서 구조가 코드 모델로 명시됨
- 설문 원본 응답, 계산용 응답, 무시 필드가 분리됨
- 총점, 위험도, 영역별 점수가 서버 계산 필드로 표준화됨
- 설문 버전, 점수 계산 버전, 클라이언트 버전이 저장됨
- 사용자별 최신 설문 조회 helper가 문서 모델을 반환함
