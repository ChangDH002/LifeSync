# Dementia Risk Unified Survey Scoring Spec

## 목적

이 문서는 LifeSync의 `치매 위험도 설문`을 하나의 공통 설문으로 운영하면서,

- `CogDrisk`
- `ANU-ADRI`

두 평가 도구의 점수를 각각 계산할 수 있도록 질문과 필드 매핑을 정리한 기준 문서다.

현재 목표는 다음과 같다.

1. 설문은 한 번만 받는다.
2. 응답은 공통 필드로 저장한다.
3. 백엔드에서 `CogDrisk raw score`와 `ANU-ADRI raw score`를 각각 계산한다.
4. 각 도구 점수를 0~100으로 정규화한 뒤 평균하여 최종 통합 위험 점수를 만든다.

## 현재 코드 상태

- 프론트 설문 페이지는 재구성 중이다.
- 백엔드에는 아직 `CogDrisk` / `ANU-ADRI` 공식 계산 로직이 구현되어 있지 않다.
- 현재 백엔드는 설문 응답과 총점 저장만 수행한다.

## 공식 출처

### ANU-ADRI

- 개발 논문: <https://link.springer.com/article/10.1007/s11121-012-0313-2>
- 검증 논문: <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0086141>
- 후속 점수 매핑 예시 테이블: <https://alzres.biomedcentral.com/articles/10.1186/s13195-024-01427-6/tables/1>

### CogDrisk

- 공식 도구 안내: <https://cogdrisk.neura.edu.au/tool/>
- 공식 사이트: <https://cogdrisk.neura.edu.au/>
- 2025 manual 검색 결과 기준 확인 항목:
  - 연령/성별
  - 교육
  - BMI
  - 콜레스테롤
  - 당뇨
  - TBI
  - 고혈압
  - 뇌졸중
  - 심방세동
  - 불면
  - 우울
  - 신체활동
  - 인지활동
  - 외로움/사회적 고립
  - 생선 섭취
  - 흡연

## 설문 운영 원칙

### 1. 질문은 공통 설문 1개로 운영

두 평가도구에 공통되는 위험요인과 보호요인을 한 번만 묻는다.

### 2. 저장값과 계산값을 분리

- 저장값: 사용자가 실제로 응답한 값
  - 예: `true`, `false`, `low`, `high`, `current`, `never`
- 계산값: 도구별 raw score
  - `cogdrisk_raw_score`
  - `anu_adri_raw_score`

### 3. boolean 문항은 boolean 의미 유지

예:

- `has_diabetes`
- `high_cholesterol`
- `has_stroke`
- `has_hypertension`
- `has_atrial_fib`
- `depression`
- `has_tbi`
- `insomnia`
- `pesticide_exposure`

위 값은 점수 자체로 저장하지 않고 원래 의미대로 저장한다.

### 4. 범주형 문항만 범주값 저장

예:

- `education_level`
- `smoking_status`
- `physical_activity`
- `cognitive_activity`
- `social_engagement`
- `fish_intake`
- `alcohol_intake`

## 공통 설문 필드 제안

아래 필드는 두 도구를 합쳐 운영할 때 추천하는 최소 공통 필드다.

| UI 질문 | 공통 저장 필드 | 타입 | CogDrisk 사용 | ANU-ADRI 사용 |
| --- | --- | --- | --- | --- |
| 나이 | `age` | number | O | O |
| 성별 | `sex` | enum | O | O |
| 최종 학력 | `education_level` | enum | O | O |
| BMI 또는 키/몸무게 | `bmi` | number | O | O |
| 고콜레스테롤 여부 | `high_cholesterol` | boolean | O | O |
| 당뇨 여부 | `has_diabetes` | boolean | O | O |
| 뇌졸중/TIA 여부 | `has_stroke` | boolean | O | O |
| 고혈압 여부 | `has_hypertension` | boolean | O | 제한적 O |
| 심방세동 여부 | `has_atrial_fib` | boolean | O | X |
| 우울 여부 또는 우울 점수 | `depression` | boolean or scaled | O | O |
| 외상성 뇌손상 여부 | `has_tbi` | boolean | O | O |
| 외로움/사회적 고립 | `loneliness` or `social_engagement` | enum | O | O |
| 불면 여부 또는 불면 점수 | `insomnia` | boolean or scaled | O | X |
| 인지활동 수준 | `cognitive_activity` | enum | O | O |
| 신체활동 수준 | `physical_activity` | enum | O | O |
| 생선 섭취 빈도 | `fish_intake` | enum | O | O |
| 흡연 상태 | `smoking_status` | enum | O | O |
| 살충제 노출 | `pesticide_exposure` | boolean | X | O |
| 음주 수준 | `alcohol_intake` | enum | X | O |

## DB 필드 통합안

현재 서로 다른 두 스키마를 다음처럼 합치는 것을 권장한다.

| 기존 CogDrisk 필드 | 기존 ANU-ADRI 필드 | 통합 권장 필드 |
| --- | --- | --- |
| `high_cholesterol` | `high_cholesterol` | `high_cholesterol` |
| `has_diabetes` | `has_diabetes` | `has_diabetes` |
| `has_stroke` | 없음 또는 별도 미사용 | `has_stroke` |
| `has_hypertension` | 없음 또는 제한적 | `has_hypertension` |
| `has_atrial_fib` | 없음 | `has_atrial_fib` |
| `depression` | `active_depression` | `depression` |
| `has_tbi` | `has_tbi` | `has_tbi` |
| `loneliness` | `social_engagement` | 둘 다 보존 가능, 최소 `social_engagement` 또는 `loneliness` 하나 필요 |
| `insomnia` | 없음 | `insomnia` |
| `cognitive_engagement` | `cognitive_activity` | `cognitive_activity` |
| `physical_activity` | `physical_activity` | `physical_activity` |
| `fish_weekly` | `fish_per_week` | `fish_intake` 또는 `fish_per_week` |
| `smoking_status` | `smoking_status` | `smoking_status` |
| `pesticide_exposure` | `pesticide_exposure` | `pesticide_exposure` |
| 없음 | `alcohol_intake` | `alcohol_intake` |

## 도구별 계산 규칙

아래는 현재 확인된 공식 규칙과 프로젝트 적용안이다.

## CogDrisk 계산 규칙

### 공식 성격

- Any dementia 점수와 AD 점수가 분리된다.
- 나이/성별, 일부 조건부 연령 규칙, 보호 인자 음수 점수가 포함된다.
- 일부 항목은 단순 `Yes/No`가 아니라 설문 하위척도 총합으로 계산한다.

### 현재 확인된 핵심 규칙

| 항목 | 규칙 |
| --- | --- |
| 연령/성별 | 65세 미만은 0점, 65세 이상은 연령/성별 알고리즘 사용 |
| 교육 | 교육 연수/학력 구간으로 점수화 |
| BMI | 65세 이하에서만 적용 |
| 콜레스테롤 | 60세 미만에서만 적용, 고콜레스테롤이면 위험점수 |
| 당뇨 | 남녀 점수 다름 |
| TBI | 있음이면 위험점수 |
| 고혈압 | 65세 이하 또는 발병연령 기준 적용 |
| 뇌졸중 | 있음이면 위험점수 |
| 심방세동 | 65세 초과에서만 적용, AD 점수에는 미사용 |
| 불면 | ISI 7문항 합산, 15점 이상이면 위험점수 |
| 우울 | CES-D 합산 점수 기준 적용 |
| 신체활동 | IPAQ-SF 총 MET-min/week가 500 초과면 보호점수 |
| 인지활동 | 여러 문항 평균, low/moderate/high에 따라 0/-4/-5 |
| 사회적 고립 | 3-item loneliness 기반, 고립이면 위험점수 |
| 흡연 | 현재 흡연이 위험점수 |
| 생선 섭취 | 보호점수 |

### 현재 확인된 수치

다음 수치는 공식 manual 검색 결과와 기존 정리 내용을 우선 반영한 값이다.

| 항목 | Any dementia | AD |
| --- | --- | --- |
| 당뇨 남성 | 2 | 2 |
| 당뇨 여성 | 3 | 2 |
| TBI 있음 | 3 | 4 |
| 고혈압 있음 | 1 | 1 |
| 뇌졸중 있음 | 2 | 2 |
| 심방세동 있음 | 2 | 미사용 |
| 불면 점수 15 이상 | 2 | 미사용 |
| 신체활동 500 MET-min/week 초과 | -3 | -3 |
| 인지활동 중간 | -4 | -4 |
| 인지활동 높음 | -5 | -5 |

### 프로젝트용 입력 단순화 제안

CogDrisk 원문은 다음처럼 길다.

- 우울: CES-D 10문항
- 불면: ISI 7문항
- 신체활동: IPAQ-SF 시간 계산
- 인지활동: 여러 문항 평균

하지만 LifeSync 설문은 단일 설문 UX를 유지해야 하므로, 구현 1차에서는 다음처럼 단순화하는 것을 권장한다.

| 공식 입력 | LifeSync 1차 단순화 |
| --- | --- |
| CES-D 총점 | `depression: true/false` 또는 3단계 빈도 응답 |
| ISI 총점 | `insomnia: true/false` 또는 3단계 응답 |
| IPAQ-SF | `physical_activity: low / sufficient` |
| 인지활동 평균 | `cognitive_activity: low / medium / high` |
| 3-item loneliness | `loneliness: low / medium / high` |

주의:

- 이 단순화는 `공식 full instrument`와 완전히 동일하지 않다.
- 다만 앱형 설문에서는 현실적인 축약형으로 사용 가능하다.

## ANU-ADRI 계산 규칙

### 공식 성격

- AD 위험도 중심 점수다.
- 문항별 점수를 단순 합산한다.
- 일부 항목은 보호요인이라 음수 점수다.
- BMI, 콜레스테롤은 연령 조건부다.

### 확인된 점수 매핑 예시

후속 논문에 공개된 매핑 기준:

| 항목 | 점수 |
| --- | --- |
| 연령 남성 65세 | 0 |
| 연령 남성 65~70 | 1 |
| 연령 남성 70~75 | 12 |
| 연령 남성 75~80 | 18 |
| 연령 남성 80~85 | 26 |
| 연령 남성 85~90 | 33 |
| 연령 남성 90+ | 38 |
| 연령 여성 65세 | 0 |
| 연령 여성 65~70 | 5 |
| 연령 여성 70~75 | 14 |
| 연령 여성 75~80 | 21 |
| 연령 여성 80~85 | 29 |
| 연령 여성 85~90 | 35 |
| 연령 여성 90+ | 41 |
| 교육 >11년 | 0 |
| 교육 8~11년 | 3 |
| 교육 <8년 | 6 |
| BMI <25, 60세 미만 | 0 |
| BMI 25~<30, 60세 미만 | 2 |
| BMI >=30, 60세 미만 | 5 |
| 당뇨 있음 | 3 |
| 우울 증상 있음 | 2 |
| 총콜레스테롤 >=6.2 mmol/L | 3 |
| TBI 있음 | 4 |
| 흡연 경험 있음 | 1 |
| 현재 흡연 | 4 |
| 음주자 | -3 |
| 신체활동 중간 | -2 |
| 신체활동 높음 | -3 |
| 생선 일부 섭취 | -3 |
| 생선 자주 섭취 | -4 |
| 생선 매일 | -5 |

### ANU-ADRI에 포함되지만 현재 프로젝트에서 축약이 필요한 항목

- 사회적 참여
- 인지활동
- 음주
- 생선 섭취

이 항목들은 공통 설문에서 범주형 보기로 받으면 충분히 계산 가능하다.

## 공통 설문 보기 형식 권장안

### 교육수준

```text
high: 대졸 이상 또는 교육연수 12년 초과
medium: 중고등학교 또는 교육연수 8~11년
low: 초등 이하 또는 교육연수 8년 미만
```

### 신체활동

```text
low: 거의 안 함
medium: 주 1~수회
high/sufficient: 주 150분 이상 또는 거의 매일
```

### 인지활동

```text
low: 거의 안 함
medium: 가끔 함
high: 자주 함
```

### 사회활동 / 외로움

프로젝트에서는 둘 중 하나를 메인 필드로 통합해야 한다.

권장:

```text
social_engagement: low / medium / high
```

내부 변환:

- `social_engagement = low` -> CogDrisk loneliness high risk
- `social_engagement = high` -> ANU-ADRI social engagement protective

### 생선 섭취

```text
none: 거의 안 먹음
weekly: 주 1회 정도
frequent: 주 2회 이상
daily: 거의 매일
```

### 흡연

```text
never
former
current
```

### 음주

```text
none
light_to_moderate
high
```

## 최종 점수 통합 방식

두 도구의 raw score 범위가 다르므로 raw score를 직접 평균내면 안 된다.

권장 방식:

```text
cogdrisk_percent = ((cogdrisk_raw - cogdrisk_min) / (cogdrisk_max - cogdrisk_min)) * 100
anu_adri_percent = ((anu_adri_raw - anu_adri_min) / (anu_adri_max - anu_adri_min)) * 100
final_risk_score = (cogdrisk_percent + anu_adri_percent) / 2
```

주의:

- 보호점수 때문에 일부 도구는 raw score가 음수가 될 수 있다.
- 따라서 단순 `raw / max * 100`은 부정확하다.
- 반드시 `min~max` 정규화가 필요하다.

## 구현 권장 순서

1. 백엔드 공통 입력 스키마 확정
2. `responses`를 공통 필드 기반 객체로 저장
3. `calculate_cogdrisk_score()`
4. `calculate_anu_adri_score()`
5. 두 점수 정규화
6. `final_risk_score` 계산
7. 프론트 결과 화면에
   - 통합 점수
   - CogDrisk 점수
   - ANU-ADRI 점수
   - 주요 위험요인
   표시

## 다음 단계

다음 작업은 백엔드 구현 전 기준으로 아래를 확정하는 것이다.

1. 공통 필드 최종 이름
2. 각 공통 필드의 보기 enum
3. CogDrisk 단순화 규칙
4. ANU-ADRI 단순화 규칙
5. 정규화용 min/max 정의

## 현재 반영된 백엔드 스키마 방향

오늘 기준 백엔드 스키마는 아래 방향으로 개편됐다.

- 기존 `responses: list[{ questionId, answer }]` 형식 유지
- 새 `responses: { age, sex, education_level, ... }` 공통 객체 형식도 수용
- 저장 시
  - `responses`: 원본 입력 그대로 저장
  - `normalized_responses`: 계산용 공통 key-value 형태로 정규화 저장

이 구조를 기준으로 다음 단계에서 계산 서비스만 추가하면 된다.
