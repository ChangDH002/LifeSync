# LifeSync Frontend

시니어 사용자를 위한 건강 및 생활 관리 플랫폼의 프론트엔드입니다.

## 📋 프로젝트 구조

```text
src/
├── app/                  # 앱 진입점, 라우터, 전역 설정
├── pages/                # URL과 연결된 화면
├── features/             # 기능 단위 모듈 (10개)
├── shared/               # 공용 자원
└── vite-env.d.ts
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

## 📖 개발 가이드

자세한 개발 규칙은 [StyleGuide.md](./StyleGuide.md)를 참고하세요.

- **아키텍처**: Feature 기반 구조
- **상태관리**: React Query (서버), `useState/useReducer` 기본, 교차 페이지 상태만 Zustand
- **API**: `shared/api/` 중앙화
- **스타일**: Tailwind CSS
- **접근성**: 시니어 사용자 고려

## 🧭 현재 기준

- 라우팅은 `src/app/routes`에서만 정의
- `pages`는 화면 조합만 담당하고 기능 구현은 `features`에 위임
- `shared`는 도메인을 몰라야 하며 2개 이상 feature에서 재사용될 때만 승격
- Zustand는 인증 세션, 글자 크기, 알림 설정처럼 앱 전역 교차 상태에만 사용

## ✅ 체크리스트

프로젝트 초기화 완료:

- [x] 폴더 구조 생성 (`app`, `pages`, `features`, `shared`)
- [x] 각 feature에 `api.ts`, `hooks.ts`, `types.ts`, `index.ts` 생성
- [x] `.gitignore`, `.editorconfig`, `.nvmrc` 생성
- [x] `npm install` 완료
- [ ] Git 초기화 및 첫 commit

## 🎯 주요 Features

- **auth**: 로그인, 회원가입, 세션 관리
- **survey**: 치매 위험도 및 성향 설문
- **gnb**: 상단 네비게이션
- **footer**: 푸터 정보
- **mypage**: 사용자 정보, 활동 내역, 출석
- **settings**: 글자 크기, 알림, 탈퇴
- **avatar**: 아바타, 상점, 옷장
- **cognitive-training**: 인지훈련 게임
- **dementia-info**: 치매 정보 콘텐츠
- **chatbot**: 챗봇 기능

## 📚 참고 문서

- [StyleGuide.md](./StyleGuide.md) - 개발 가이드 및 규칙
