# Advisor Demo Deploy Runbook

목표:
- 2026년 5월 10일 자문 전에 외부 접속 가능한 프론트, 백엔드, AI 서버 URL 확보
- 설문 저장, 마이페이지 반영, 챗봇 응답까지 실사용 확인

현재 확인 완료:
- GitHub `main` 최신 푸시 완료
- 프론트 `npm run build` 성공
- 백엔드 `app.main` import 성공
- AI 서버 `main` import 성공

배포 권장 순서:
1. MongoDB Atlas 생성
2. AI 서버 Render 배포
3. 백엔드 Render 배포
4. 프론트 Vercel 배포
5. 통합 기능 테스트

## 1. MongoDB Atlas

해야 할 일:
- Free Cluster 생성
- Database User 생성
- Network Access에 `0.0.0.0/0` 임시 허용
- Connection String 복사

사용할 값:
- `DATABASE_NAME=lifesync_prod`
- `MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-url>/lifesync_prod?retryWrites=true&w=majority`

완료 기준:
- Atlas 접속 문자열 준비 완료

## 2. AI 서버 Render 배포

Render 설정:
- Service Type: `Web Service`
- Root Directory: `LifeSync-ai/AI_Chatbot`
- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

환경변수:
- 현재 필수값 없음

배포 후 확인:
- `https://<ai-service>.onrender.com/health`

정상 기준:
- 200 응답

메모:
- 첫 기동은 모델 준비 때문에 조금 느릴 수 있음
- 현재 코드상 모델이 완전하지 않으면 fallback 경로로 기동 가능

## 3. 백엔드 Render 배포

Render 설정:
- Service Type: `Web Service`
- Root Directory: `.`
- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

필수 환경변수:
- `APP_ENV=production`
- `APP_NAME=LifeSync Backend API`
- `MONGODB_URL=<Atlas connection string>`
- `DATABASE_NAME=lifesync_prod`
- `CORS_ORIGINS=https://<your-frontend-domain>`
- `SOCIAL_REDIRECT_ALLOWLIST=https://<your-frontend-domain>`
- `SECRET_KEY=<long-random-secret>`
- `JWT_SECRET_KEY=<long-random-secret>`
- `SOCIAL_STATE_SECRET=<long-random-secret>`
- `ACCESS_TOKEN_EXPIRES_MINUTES=60`
- `REFRESH_TOKEN_EXPIRES_DAYS=14`
- `AI_CHATBOT_URL=https://<ai-service>.onrender.com`

선택 환경변수:
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `KAKAO_REST_API_KEY=...`
- `KAKAO_CLIENT_SECRET=...`

배포 후 확인:
- `https://<api-service>.onrender.com/health`
- `https://<api-service>.onrender.com/docs`

정상 기준:
- `/health` 200
- `/docs` 진입 가능

메모:
- OAuth 설정이 비어 있어도 이메일 로그인은 가능해야 함
- 소셜 로그인은 운영 도메인 등록 전까지 시연에서 제외하는 편이 안전함

## 4. 프론트 Vercel 배포

Vercel 설정:
- Framework Preset: `Vite`
- Root Directory: `LifeSync-frontend`
- Build Command: 기본값 사용 가능

필수 환경변수:
- `VITE_API_URL=https://<api-service>.onrender.com`
- `VITE_ENV=production`

배포 후 확인:
- `https://<frontend>.vercel.app`

정상 기준:
- 메인 페이지 진입 가능
- 네트워크 요청이 백엔드 배포 URL로 향함

## 5. 통합 테스트 순서

1. 프론트 메인 페이지 접속
2. 테스트 계정 로그인
3. 치매 위험도 설문 진입
4. 설문 완료 후 결과 확인
5. 마이페이지에서 최신 설문 결과 반영 확인
6. 루틴 페이지 조회 확인
7. 챗봇 질문 1회 확인

테스트 계정:
- `test.cleanup.dev@example.com`
- `Test1234!`

## 6. 자문 시연 전에 꼭 확인할 것

- 백엔드 `AI_CHATBOT_URL`이 실제 AI Render URL인지
- 백엔드 `CORS_ORIGINS`가 실제 프론트 URL인지
- 백엔드 `SOCIAL_REDIRECT_ALLOWLIST`가 실제 프론트 URL인지
- 프론트 `VITE_API_URL`이 실제 백엔드 URL인지
- Atlas Network Access가 열려 있는지

## 7. 시연용 공유 링크

자문가에게 전달할 링크:
- 프론트: `https://<frontend>.vercel.app`
- 백엔드 Swagger: `https://<api-service>.onrender.com/docs`
- AI Health: `https://<ai-service>.onrender.com/health`

## 8. 남은 리스크

- Render 무료 플랜이면 슬립 후 첫 요청이 느릴 수 있음
- AI 서버 첫 응답이 느릴 수 있음
- OAuth 운영 도메인 등록이 안 되어 있으면 소셜 로그인은 실패 가능
- 프론트 정적 자산 중 일부 SVG가 커서 첫 로딩이 다소 무거울 수 있음
