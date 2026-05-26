# Routine & Survey Feature TODO

현재 코드 기준으로 설문, 맞춤 루틴, 루틴 완료, 마이페이지 연동의 핵심 흐름은 연결된 상태다.
이 문서는 기능 관점에서 프론트엔드와 백엔드의 남은 작업을 나눈 TODO 목록이다.

## 현재 상태 요약

- 치매 위험도 설문 페이지는 존재한다.
- 설문 결과는 백엔드에 저장되며, 서버 점수 재계산·검증이 적용된다.
- 설문 저장 시 `user_routines` 맞춤 루틴 3개가 자동 배정된다. (상세: [SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md](./SURVEY_ROUTINE_RECOMMENDATION_SUMMARY.md))
- 루틴 페이지는 `GET /routines/today`, 완료/취소 API와 연결되어 오늘 루틴 완료 상태를 저장한다.
- 마이페이지에는 최신 설문, 오늘 루틴 완료/전체 수, 루틴 기준 주간 달성률, 설문·루틴·훈련 최근 활동이 반영된다.
- 설문을 하지 않은 사용자는 여전히 fallback 정적 루틴 3개를 본다.

## Frontend TODO

### 1. 설문 UX

- 설문 시작 버튼 진입 경로를 전체 화면에서 점검하고 누락된 CTA를 모두 연결
- 설문 진행 중 이전 질문으로 이동하는 UX 정리
- 설문 중도 이탈 시 임시 저장 여부 결정
- 설문 완료 후 저장 성공, 실패, 로그인 필요 상태를 더 명확하게 표시
- 설문 결과 화면에 추천 이유와 다음 행동을 더 구체적으로 노출

### 2. 설문 결과 활용

- 설문 결과 화면에서 위험도와 영역별 점수 설명을 더 구조화
- 위험도별 추천 행동 문구를 기획안에 맞게 정리
- 설문 완료 후 루틴 페이지로 이동할 때 실제 추천 루틴 컨텍스트를 유지
- 재설문 시 이전 결과와 비교 표시 여부 결정

### 3. 맞춤 루틴 화면

- [x] 오늘의 루틴 목록에 완료 버튼 추가
- [x] 루틴 완료/취소 시 즉시 UI 반영
- [x] 루틴별 추천 이유 표시
- 루틴 카테고리, 빈도, 우선순위 표시
- 오늘 루틴, 주간 루틴, 완료 기록 탭 분리 검토
- 추천 루틴이 정적 예시인지 실제 추천인지 더 명확히 표시

### 4. 마이페이지 연동

- 설문 결과 요약과 루틴 추천 결과를 더 자연스럽게 연결
- [x] 오늘 루틴 완료 수와 주간 달성률을 실제 완료 데이터와 연동
- [x] 최근 활동에 설문 저장, 루틴 완료, 훈련 이벤트를 함께 표시
- 설문 결과에 따라 배너 문구와 CTA를 다르게 노출

### 5. 예외 처리

- 비로그인 사용자가 설문을 완료했을 때 저장 유도 UX 정리
- 설문 저장 실패 시 재시도 버튼 제공
- 루틴 API 실패 시 fallback 표시를 더 사용자 친화적으로 개선
- 빈 데이터 상태와 최초 사용자 상태를 구분

### 6. QA

- 설문 시작부터 완료까지 실제 브라우저 플로우 점검
- 설문 저장 후 마이페이지 반영 확인
- 설문 결과 후 루틴 페이지 이동 플로우 점검
- 모바일 화면에서 설문/루틴 UI 점검

## Backend TODO

구현 상태: `[x]` 완료 · `[~]` 부분 · `[ ]` 미구현

### 1. 설문 저장 API 고도화

- [x] 프론트가 보낸 점수를 그대로 저장하지 말고 서버에서 재계산/검증 (`build_dementia_risk_survey_document`, `client_submitted`, `score_mismatch`)
- [x] 설문 질문 세트 버전 관리 추가 (`survey_version`, `scoring_version`, `client_version`)
- [x] 중복 제출 정책 정의 — 서버는 `submission_policy=append_history`로 모든 제출을 이력 저장
- [x] 최신 결과만 유지할지 이력 전체를 저장할지 정책 확정 — 이력 전체 저장 + 최신 조회 헬퍼
- [x] 설문 결과 수정 또는 재진단 정책 정의 — 재진단은 새 문서 추가, 수정/삭제 API는 제공하지 않음

### 2. 설문 데이터 모델

- [x] `survey_results` 문서 구조 확정 (`DementiaSurveyResultDocument`)
- [x] 설문 원본 응답, 총점, 위험도, 영역별 점수 필드 표준화
- [x] 제출 시각 외에 설문 버전, 클라이언트 버전 등 메타데이터 (`survey_version`, `scoring_version`, `client_version`)
- [x] 사용자별 최신 설문 결과 조회 헬퍼 정리 (`get_latest_dementia_risk_survey`)

### 3. 맞춤 루틴 추천 로직

- [~] 정적 루틴 3개를 사용자별 추천 구조로 전환 — **설문 저장 사용자**는 `user_routines`, 미설문 사용자는 fallback 3개
- [x] 설문 결과 기반 추천 규칙 정의 (`routine_recommendation.py`, factor·category·위험도 점수)
- [x] 위험도와 영역별 점수에 따른 추천 우선순위 규칙 정의
- [x] 추천 근거 텍스트 생성 방식 정의 (`build_recommendation_reason`)
- [x] 기본 루틴 fallback 정책 정의 (`user_routines` 없으면 `FALLBACK_ROUTINE_DEFINITIONS`)
- [x] `routine_definitions` DB 카탈로그 시드 — 앱 시작 시 코드 카탈로그 6개 upsert (`seed_routine_definitions`)

### 4. 루틴 데이터 모델

- [x] 루틴 정의와 사용자 배정 루틴을 분리 (`routine_definitions` / `user_routines`)
- [x] 루틴 필드 정의 (`RoutineDefinitionDocument`, `UserRoutineDocument`)
- [x] 필수 후보 필드 반영:
  - [x] `routine_id`
  - [x] `title`
  - [x] `category`
  - [x] `description`
  - [x] `recommendation_reason` (정의: `recommendation_reason_template` / 사용자: `recommendation_reason`)
  - [x] `frequency`
  - [x] `priority`
  - [x] `active`
- [x] 완료 기록 컬렉션과 추천 루틴 컬렉션 책임 분리 (`routine_completions` / `user_routines`)

### 5. 루틴 API 확장

- [~] 사용자 루틴 생성 — **내부 서비스** `assign_user_routines_from_survey`만 있음. 공개 `POST` API 없음
- [x] `GET /routines/today` 오늘의 루틴 조회
- [x] 루틴 완료 처리 API 추가 (`POST /routines/{routine_id}/complete`)
- [x] 루틴 완료 취소 API 추가 (`DELETE /routines/{routine_id}/complete`)
- [x] 주간 루틴/이력 조회 API 추가 (`GET /routines/weekly`)
- [x] 설문 완료 후 루틴 자동 재생성 또는 갱신 (`save_dementia_risk_survey` 연동)

### 6. 마이페이지 집계 로직

- [x] 오늘 루틴 완료 수를 실제 루틴 완료 데이터로 계산 — `routine_completions` + `get_today_routines()`
- [x] 주간 달성률 계산 기준 정의 — 루틴 완료율(`GET /routines/weekly`) 기준
- [x] 설문 결과를 기반으로 설문 탭 설명과 배너를 더 정교화 — 위험도별 배너 문구 + 영역 bullet
- [x] 최근 활동에 설문, 루틴, 훈련 이벤트를 함께 정렬해서 제공

### 7. 인증/정책

- [x] 설문 저장을 로그인 필수로 유지할지 검토 — 저장 API는 JWT Bearer 필수, `/survey` 화면 진행은 비로그인 허용
- [x] 비회원 설문 결과 임시 저장 전략 검토 — 백엔드 임시 저장 없음, 필요 시 프론트 `localStorage`
- [x] 재로그인 후 임시 설문 결과 복구 여부 검토 — 별도 복구 API 없음, 로그인 후 기존 저장 API로 재제출

### 8. 테스트

- [x] 설문 저장 API 테스트 추가 — HTTP 인증/응답 테스트 (`test_survey_api.py`)
- [x] 설문 점수 검증 테스트 추가
- [x] 루틴 추천 규칙 테스트 추가 (`test_routine_recommendation.py`)
- [x] 루틴 완료 처리 테스트 추가 (`test_routine_completions.py`)
- [x] 마이페이지 요약 집계 테스트 추가 — 오늘 루틴 수, 루틴 주간 달성률, 최근 활동 통합 (`test_mypage_routine_counts.py`)
- [x] 루틴 API HTTP 테스트 추가 (`test_routine_api.py`)

## 권장 구현 순서

1. [x] 백엔드 설문 점수 검증 로직 추가
2. [x] 사용자별 맞춤 루틴 데이터 모델 설계
3. [x] 설문 결과 기반 루틴 추천 서비스 구현
4. [x] 루틴 완료 API 및 프론트 완료 UI 구현
5. [x] 마이페이지 집계 고도화
6. [ ] 브라우저 E2E 검증 및 예외 처리 보강

## 메모

- 설문 저장·서버 검증·맞춤 `user_routines` 배정까지 백엔드는 연결됨.
- 루틴 완료 API와 프론트 `/routine` 완료 UI가 연결되어 `routine_completions`에 저장됨.
- 마이페이지는 루틴 기준 주간 달성률과 설문·루틴·훈련 최근 활동을 표시함.
- 남은 백엔드 중심 작업은 HTTP 통합/E2E 테스트 보강과 운영용 관리 API 확장이다.
