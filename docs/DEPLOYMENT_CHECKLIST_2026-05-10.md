# Deployment Checklist for Advisor Demo

목표:
- 2026년 5월 10일 자문 전에 외부에서 접속 가능한 URL 준비
- 최소 구성:
  - 프론트 공개 URL 1개
  - 백엔드 공개 URL 1개
  - AI 서버 공개 URL 1개
  - MongoDB Atlas 연결 완료

## 추천 배포 조합

- 프론트: Vercel
- 백엔드: Render Web Service
- AI 서버: Render Web Service
- DB: MongoDB Atlas

이 조합을 추천하는 이유:
- 프론트는 Vite 기반이라 Vercel 배포가 가장 빠름
- FastAPI는 Render에서 바로 띄우기 쉬움
- MongoDB는 Atlas가 가장 준비 시간이 짧음

## 사전 준비물

- GitHub 저장소 최신 반영
- Vercel 계정
- Render 계정
- MongoDB Atlas 계정
- Google/Kakao OAuth를 쓸 경우 운영 도메인 등록 권한

## 1. MongoDB Atlas 만들기

1. Atlas에서 Free Cluster 생성
2. Database User 생성
3. IP Access List에 `0.0.0.0/0` 임시 허용
4. Connection String 확보
5. 데이터베이스 이름을 `lifesync_prod`로 결정

메모:
- 자문 시연 전용이면 임시로 `0.0.0.0/0` 허용 가능
- 시연 후에는 IP 제한을 다시 조이는 것이 좋음

## 2. AI 서버 먼저 배포

Render에서 새 Web Service 생성:
- Root Directory: `LifeSync-ai/AI_Chatbot`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

확인:
- `/health` 접속 확인
- 모델 로딩 시간이 길 수 있으므로 첫 배포 후 대기 필요

환경변수:
- 기본적으로는 필수 없음
- 필요 시 CORS 허용 도메인 추가 검토

배포 후 확보:
- `https://<ai-service>.onrender.com`

## 3. 백엔드 배포

Render에서 새 Web Service 생성:
- Root Directory: `.`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

환경변수:
- `.env.production.example` 기준으로 입력
- 특히 아래 값이 중요
  - `MONGODB_URL`
  - `DATABASE_NAME`
  - `JWT_SECRET_KEY`
  - `SECRET_KEY`
  - `SOCIAL_STATE_SECRET`
  - `AI_CHATBOT_URL`
  - `CORS_ORIGINS`
  - `SOCIAL_REDIRECT_ALLOWLIST`

확인:
- `/health` 접속 확인
- `/docs` 접속 확인
- 회원가입/로그인 확인

배포 후 확보:
- `https://<api-service>.onrender.com`

## 4. 프론트 배포

Vercel에서 프로젝트 Import:
- Root Directory: `LifeSync-frontend`
- Framework: Vite

환경변수:
- `.env.production.example` 기준
- `VITE_API_URL=https://<api-service>.onrender.com`

빌드 확인:
- `npm run build`

배포 후 확보:
- `https://<frontend>.vercel.app`

## 5. 서비스 연결 확인

확인 순서:
1. 프론트 접속
2. 회원가입/로그인
3. 설문 페이지 진입
4. 설문 완료 후 저장
5. 마이페이지에서 설문 반영 확인
6. 챗봇 응답 확인

## 6. OAuth 쓸 경우 추가 작업

Google/Kakao 콘솔에 아래 redirect URI 등록:
- 프론트 콜백 URL
- 백엔드 social start/callback 흐름 기준 운영 도메인

없으면:
- 자문 시연 중에는 일반 이메일 로그인만 사용하는 것이 안전함

## 7. 오늘 바로 해야 할 우선순위

1. GitHub에 현재 코드 푸시
2. Atlas 클러스터 생성
3. AI 서버 Render 배포
4. 백엔드 Render 배포
5. 프론트 Vercel 배포
6. 실제 설문 저장/마이페이지/챗봇 테스트

## 8. 현재 코드 기준 배포 blocker

- 백엔드 `bcrypt` 버전 호환성 문제
  - 해결: `requirements.txt`에 `bcrypt==4.0.1` 고정 반영
- AI 서버는 첫 기동 시 모델 준비 시간 필요
- 설문 저장은 로그인 사용자 기준
- OAuth는 운영 도메인 등록 전까지 미사용 권장

## 9. 자문 시연용 최소 테스트 시나리오

1. 메인 페이지 접속
2. 로그인
3. 치매 위험도 설문 진입
4. 설문 완료
5. 마이페이지에서 설문 결과 확인
6. 루틴 페이지 확인
7. 챗봇 질문 1회 시연

## 관련 파일

- Render 설정: [render.yaml](E:/LifeSync/render.yaml)
- 백엔드 운영 환경 예시: [.env.production.example](E:/LifeSync/.env.production.example)
- 프론트 운영 환경 예시: [LifeSync-frontend/.env.production.example](E:/LifeSync/LifeSync-frontend/.env.production.example)
