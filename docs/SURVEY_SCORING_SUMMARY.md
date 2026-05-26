# 치매 위험도 설문 점수 계산 요약

## 개요

치매 위험도 설문(`dementia-risk`) 점수는 **프론트가 보낸 점수를 저장하지 않고**, 서버가 응답을 표준화한 뒤 **두 가지 위험도 모델**을 각각 계산하고, 그 결과를 합쳐 최종 점수·등급을 만든다.

| 항목 | 값 |
|------|-----|
| 점수 로직 버전 | `cogdrisk-anuadri-v1` (`SCORING_VERSION`) |
| 구현 파일 | `app/services/dementia_risk_scoring.py` |
| 저장 시 호출 | `app/services/survey.py` → `build_dementia_risk_survey_document()` |

## 전체 흐름

```text
설문 제출 (POST /survey/dementia-risk)
        │
        ▼
① 응답 검증 (survey_type, 최소 5개 응답, age·sex 필수)
        │
        ▼
② normalize_responses() — 필드명·값 표준화
        │
        ├─► ③ CogDrisk raw 합산 → 0~100 정규화 (cogdrisk.normalizedScore)
        │
        └─► ④ ANU-ADRI raw 합산 → 0~100 정규화 (anu_adri.normalizedScore)
        │
        ▼
⑤ final_risk_score = (CogDrisk + ANU-ADRI) / 2
        │
        ▼
⑥ risk_level = 위험도 낮음 | 보통 | 높음 (33·66 기준)
        │
        ▼
⑦ category_scores = 영역별 factor 점수 합 (4개 영역)
        │
        ▼
survey_results 저장 + client_submitted 감사 필드
```

## 프론트 점수 vs 서버 점수

| 구분 | 설명 |
|------|------|
| 프론트 | `yesCount`·자체 `categoryScores`·`riskLevel`을 요청에 포함할 수 있음 |
| 서버 | 위 값은 `client_submitted`에만 보관, **저장·표시·루틴 추천에 쓰는 점수는 서버 계산값** |
| 불일치 | `score_mismatch = true` (차이 > 0.1), `score_delta`에 차이 기록 |

## ① 응답 표준화 (`normalize_responses`)

원본 `responses` dict를 점수 계산용 `normalized_responses`로 바꾼다. `None`인 필드는 제외한다.

주요 변환 예:

| 필드 | 표준화 |
|------|--------|
| `age` | `under_45`→44, `45_54`→50, … 또는 숫자 |
| `physical_activity` | `insufficient`→`medium`, `sufficient`→`high` |
| `fish_intake` | `rarely`→`none`, `sometimes`→`weekly` 등 |
| `social_engagement` | 없으면 `loneliness` 역변환 (high→low) |
| 질병·증상 | bool 문자열 `true`/`false` → boolean |

`FACTOR_CATEGORY_MAP`에 없는 키는 `ignored_fields`로 기록된다 (점수 계산 미사용).

## ② CogDrisk 점수

### raw 점수

각 위험·보호 **factor**에 가중치를 더해 `rawScore`를 만든다. (음수 = 보호 요인)

대표 factor (코드에 정의된 전체):

- 인구: `age`, `education_level`, `bmi`(65세 이하만)
- 심혈관·대사: `high_cholesterol`, `has_diabetes`, `has_stroke`, `has_hypertension`, `has_atrial_fib`
- 심리·신경: `depression`, `has_tbi`, `loneliness`, `insomnia`
- 생활습관: `cognitive_activity`, `physical_activity`, `fish_intake`, `smoking_status`

연령·성별: 65세 미만은 연령 점수 0. 일부 항목(콜레스테롤, BMI, 심방세동)은 **연령 구간**에 따라 점수 적용 여부가 달라진다. 성별이 없으면 남·여 가중치 **평균**을 쓴다.

### 정규화 (0~100)

```text
normalizedScore = (rawScore - (-8.25)) / (51.0 - (-8.25)) × 100
→ 0~100으로 clamp, 소수 1자리
```

상수: `COGDRISK_MIN_SCORE = -8.25`, `COGDRISK_MAX_SCORE = 51.0`

## ③ ANU-ADRI 점수

### raw 점수

별도 가중치 테이블로 factor 점수를 합산한다. CogDrisk와 **같은 응답**을 쓰지만 항목·점수가 다르다.

추가/차이 factor 예:

- `alcohol_intake` (가벼운 음주는 **음수** 보호 점수)
- `pesticide_exposure`
- `social_engagement` (직접 입력, loneliness 역변환 가능)

### 정규화 (0~100)

```text
normalizedScore = (rawScore - (-11.0)) / (70.0 - (-11.0)) × 100
```

상수: `ANU_ADRI_MIN_SCORE = -11.0`, `ANU_ADRI_MAX_SCORE = 70.0`

## ④ 최종 점수·위험도 등급

```text
final_risk_score = round((cogdrisk.normalizedScore + anu_adri.normalizedScore) / 2, 1)
total_score = final_risk_score  (동일 값 저장)
```

| final_risk_score | risk_level |
|------------------|------------|
| 0 ≤ score < 33 | 위험도 낮음 |
| 33 ≤ score < 66 | 위험도 보통 |
| 66 ≤ score ≤ 100 | 위험도 높음 |

## ⑤ 영역별 점수 (`category_scores`)

CogDrisk·ANU-ADRI **factor 점수를 factor별로 합산**한 뒤, 4개 영역에 더한다.

| 영역 | 포함 factor 예 |
|------|----------------|
| 인구통계 | age, sex, education_level |
| 심혈관·대사 | bmi, high_cholesterol, has_diabetes, has_stroke, has_hypertension, has_atrial_fib |
| 심리·신경 | depression, has_tbi, loneliness, social_engagement, insomnia |
| 생활습관 | cognitive_activity, physical_activity, fish_intake, smoking_status, pesticide_exposure, alcohol_intake |

```text
각 factor 점수 = cogdrisk[ factor ] + anu_adri[ factor ]
영역 점수 = 해당 영역 factor 점수 합 (소수 1자리)
```

**주의:** 영역별 점수는 **0~100 정규화 점수가 아니라**, 두 모델의 **raw factor 가중치 합**이다. 프론트 설문 화면의 `categoryScores`(선택지 score 누적)와 **다른 체계**이다.

## 저장·응답 필드

| 필드 | 의미 |
|------|------|
| `total_score`, `final_risk_score` | 최종 0~100 점수 |
| `risk_level` | 위험도 등급 문자열 |
| `category_scores` | 4개 영역 합산 점수 |
| `cogdrisk` / `anu_adri` | raw, normalized, matched_factors |
| `normalized_responses` | 점수 계산에 사용한 응답 |
| `responses` | 제출 원본 |
| `client_submitted` | 프론트가 보낸 점수·등급 원본 |

API 응답(`DementiaSurveySubmitResponse`)에도 서버 계산 `totalScore`, `finalRiskScore`, `riskLevel`, `categoryScores`, `cogdrisk`, `anuAdri`가 내려간다.

## 프론트 설문 화면과의 차이

| | 프론트 (`DementiaSurvey.tsx`) | 서버 |
|--|-------------------------------|------|
| 총점 | 문항 `score` 누적 (`yesCount`) | CogDrisk·ANU-ADRI 정규화 평균 |
| 영역 점수 | 질문 `category`별 score 합 | factor 가중치 합 → 4영역 |
| 결과 등급 | yesCount 구간 또는 서버 응답 후 서버 `riskLevel` 표시 | 항상 서버 `calculate_risk_level` |

로그인 후 저장이 성공하면 결과 화면은 **서버 `finalRiskScore`·`riskLevel`·`categoryScores`**를 우선 표시한다.

## 루틴 추천과의 관계

맞춤 루틴 추천(`routine_recommendation.py`)은 저장된 설문 문서에서 다음을 사용한다.

- `normalized_responses` — factor별 “개선 필요” 가중
- `category_scores` — 영역별 점수
- `risk_level` — 전체 위험도 보너스

최종 설문 점수(`final_risk_score`) 숫자 자체보다 **응답·영역·등급**이 추천에 더 직접 쓰인다.

## 관련 문서

- [SURVEY_DATA_MODEL_SUMMARY.md](./SURVEY_DATA_MODEL_SUMMARY.md) — 저장 문서 구조
- [SURVEY_API_HARDENING_SUMMARY.md](./SURVEY_API_HARDENING_SUMMARY.md) — API 검증·감사
- [SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md](./SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md) — 점수 결과 → 루틴 배정
