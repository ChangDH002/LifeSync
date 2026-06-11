# Backend Deploy Prep Local Notes

로컬에서 미리 해둘 수 있는 작업:

## 1. 운영 비밀키 생성

명령:

```powershell
py scripts/generate_prod_secrets.py
```

출력:
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `SOCIAL_STATE_SECRET`

이 값들은 Render 백엔드 환경변수에 그대로 넣으면 됩니다.

## 2. 백엔드 배포 환경변수 점검

PowerShell 예시:

```powershell
$env:APP_ENV="production"
$env:APP_NAME="LifeSync Backend API"
$env:MONGODB_URL="mongodb+srv://<username>:<password>@<cluster-url>/lifesync_prod?retryWrites=true&w=majority"
$env:DATABASE_NAME="lifesync_prod"
$env:CORS_ORIGINS="https://<your-frontend-domain>"
$env:SOCIAL_REDIRECT_ALLOWLIST="https://<your-frontend-domain>"
$env:SECRET_KEY="<secret>"
$env:JWT_SECRET_KEY="<secret>"
$env:SOCIAL_STATE_SECRET="<secret>"
$env:ACCESS_TOKEN_EXPIRES_MINUTES="60"
$env:REFRESH_TOKEN_EXPIRES_DAYS="14"
$env:AI_CHATBOT_URL="https://<your-ai-domain>"
py scripts/check_backend_deploy_env.py
```

성공 기준:
- `All required backend deploy variables are set.`

## 3. 현재 코드 기준 준비 상태

확인 완료:
- 프론트 프로덕션 빌드 성공
- 백엔드 import 성공
- AI 서버 import 성공
- `render.yaml` 존재
- 백엔드 운영 env 예시 파일 존재

남은 외부 작업:
- MongoDB Atlas 생성
- Render AI 서버 배포
- Render 백엔드 배포
- Vercel 프론트 배포
