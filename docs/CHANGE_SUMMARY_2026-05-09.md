# Change Summary - 2026-05-09

이 문서는 현재 워크트리에서 "이번 작업으로 올릴 후보 변경"을 빠르게 확인하기 위한 요약이다.

## 이번 작업 핵심

- 치매 위험도 설문 시작 버튼 연결
- 설문 완료 결과를 백엔드로 저장하는 API 연동
- 백엔드에 설문 저장 엔드포인트 추가
- 마이페이지에서 최신 설문 결과 반영
- 배포 전용 설정 파일과 체크리스트 추가
- `bcrypt` 호환성 문제 방지를 위한 의존성 고정

## 커밋에 포함 추천 파일

### Frontend

- `LifeSync-frontend/src/features/dementia-info/ui/InfoActionBanner.tsx`
  - 정보 페이지 CTA 버튼을 `/survey`로 연결
- `LifeSync-frontend/src/features/survey/api.ts`
  - 설문 저장 API 함수 추가
- `LifeSync-frontend/src/features/survey/hooks.ts`
  - 응답 목록 반환, 영역별 점수 계산 보완
- `LifeSync-frontend/src/features/survey/types.ts`
  - 설문 저장 요청/응답 타입 추가
- `LifeSync-frontend/src/features/survey/ui/DementiaSurvey.tsx`
  - 설문 완료 시 백엔드 저장, 저장 상태 표시

### Backend

- `app/routers/survey.py`
  - `POST /survey/dementia-risk` 엔드포인트 추가
- `app/services/survey.py`
  - 설문 결과 저장 및 최신 결과 조회 로직 추가
- `app/schemas/survey.py`
  - 설문 요청/응답 스키마 추가
- `app/main.py`
  - survey router 등록
- `app/db.py`
  - `survey_results` 인덱스 추가
- `app/services/mypage.py`
  - 최신 설문 결과를 마이페이지 배너/탭/최근 활동에 반영

### Deployment / Ops

- `requirements.txt`
  - `bcrypt==4.0.1` 고정
- `render.yaml`
  - Render 배포 설정 추가
- `.env.production.example`
  - 백엔드 운영 환경변수 예시 추가
- `LifeSync-frontend/.env.production.example`
  - 프론트 운영 환경변수 예시 추가
- `docs/DEPLOYMENT_CHECKLIST_2026-05-10.md`
  - 자문 시연용 배포 순서 체크리스트 추가
- `docs/ROUTINE_SURVEY_FEATURE_TODO.md`
  - 설문/루틴 기능 TODO 정리

## 기능 관점 변경 요약

### 설문

- 설문 시작 버튼이 실제 설문 페이지로 이동함
- 설문 결과가 화면 계산으로 끝나지 않고 백엔드에 저장됨
- 비로그인 상태에서는 저장 대신 안내 문구 표시

### 백엔드 저장

- 인증된 사용자의 설문 결과를 `survey_results`에 저장
- 저장 필드:
  - `survey_type`
  - `total_score`
  - `risk_level`
  - `category_scores`
  - `responses`
  - `submitted_at`

### 마이페이지

- 최신 설문 결과가 있으면 설문 배너가 갱신됨
- 최근 활동에 설문 저장 내역이 표시됨
- 설문 탭에 총점, 위험도, 영역별 점수가 표시됨

### 배포

- Render 기준 API/AI 서비스 설정 추가
- 운영용 환경변수 예시 파일 추가
- bcrypt 런타임 호환성 문제 예방

## 검증한 내용

- 프론트 `npm run type-check` 통과
- 설문 저장 API `POST /survey/dementia-risk` 200 확인
- MongoDB `survey_results` 저장 확인
- `GET /mypage/summary`에 설문 결과 반영 확인

## 현재 워크트리에 섞여 있는 다른 변경

아래는 이번 작업과 직접 관련 없을 가능성이 높은 기존 변경이다.
커밋 범위를 나눠서 올리는 것을 권장한다.

- `LifeSync-ai/AI_Chatbot/main.py`
- `LifeSync-ai/AI_Chatbot/services/chatbot_service.py`
- `LifeSync-ai/AI_Chatbot/services/recommendation_service.py`
- `LifeSync-frontend/src/features/chatbot/types.ts`
- `LifeSync-frontend/src/features/mypage/ui/MypageSummary.tsx`
- `app/core/config.py`
- 프론트 자산 파일 다수
- `.local/`

## 권장 커밋 단위

### Commit 1

- 설문 저장 연동
- 마이페이지 설문 반영

### Commit 2

- 배포 준비 파일
- 운영 환경 예시
- 배포 체크리스트

### 별도 검토 후 분리

- AI 서버 fallback 관련 변경
- 챗봇 타입 변경
- 마이페이지 UI의 기존 변경
- 자산 추가 파일
