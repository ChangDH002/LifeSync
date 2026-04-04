
# LifeSync Frontend Style Guide

이 문서는 현재 프로젝트의 프론트엔드 구조와 코드 작성 규칙을 정의한다.  
모든 구현과 리뷰는 이 문서를 기본 기준으로 삼는다.

이 가이드는 업로드된 기존 스타일 가이드의 핵심 원칙인 **Feature 기반 구조**, **관심사 분리**, **공통 리소스의 중앙화**, **명확한 명명 규칙**, **API 호출의 중앙화**를 참고해 현재 프로젝트 구조에 맞게 단순화한 버전이다.  
또한 LifeSync 기획안의 기능 명세를 반영해 GNB, 회원, 마이페이지, 설정, 아바타, 인지훈련, 정보 페이지, 챗봇 등의 기능을 기준으로 폴더 책임과 UI 방향을 정리한다.

---

## 1. 핵심 원칙

### 1.1 구조는 단순하게 유지한다
현재 프로젝트는 다음 구조를 기준으로 한다.

```text
src/
├── app/
├── pages/
├── features/
├── shared/
└── vite-env.d.ts
```

복잡한 구조를 억지로 도입하지 않는다.  
폴더 깊이는 최소화하고, 파일 위치를 쉽게 예측할 수 있어야 한다.

### 1.2 기능 중심으로 분리한다
도메인 또는 사용자 기능 단위로 `features`를 나눈다.

예:
- auth
- mypage
- settings
- avatar
- cognitive-training
- dementia-info
- chatbot
- gnb

### 1.3 페이지와 기능을 분리한다
- `pages`: URL과 직접 연결되는 화면
- `features`: 페이지 내부에서 사용하는 기능 모듈

### 1.4 공통 코드는 shared에 둔다
공용 UI, 유틸, 타입, API 클라이언트, 설정은 `shared`에 둔다.  
특정 도메인에 종속된 코드는 `shared`에 두지 않는다.

### 1.5 비즈니스 로직과 UI를 분리한다
컴포넌트 안에 복잡한 로직을 길게 작성하지 않는다.  
가능하면 `hooks.ts`, `api.ts`, `lib` 함수로 분리한다.

### 1.6 시니어 친화 UX를 기본값으로 한다
LifeSync는 시니어 사용자를 위한 서비스다.  
따라서 큰 글자, 높은 대비, 단순한 내비게이션, 명확한 버튼, 짧고 분명한 문구를 기본으로 한다.

---

## 2. 디렉토리 구조

```
src/
├── app/                    # 앱 진입점, 라우터, 전역 Provider
│   ├── providers/          # QueryClient, Theme, Auth 등 전역 설정
│   ├── routes/             # 라우트 정의와 라우트 설정
│   ├── App.tsx             # 최상위 앱 컴포넌트
│   └── main.tsx            # React 마운트 진입 파일
│
├── pages/                  # URL과 직접 연결되는 화면 단위
│   ├── home/               # 메인 화면
│   ├── login/              # 로그인/회원가입 진입
│   ├── mypage/             # 마이페이지
│   ├── settings/           # 설정 화면
│   ├── avatar/             # 아바타/나무 화면
│   ├── training/           # 인지훈련 화면
│   ├── information/        # 정보 페이지
│   ├── chatbot/            # 챗봇 화면
│   └── not-found/          # 404 화면
│
├── features/               # 기능 단위 모듈
│   ├── auth/               # 로그인, 회원가입, 세션 관리
│   ├── survey/             # 위험도/성향 설문
│   ├── gnb/                # GNB, 사용자 상태 영역
│   ├── footer/             # 정책/서비스 정보 푸터
│   ├── mypage/             # 사용자 정보, 활동 내역, 출석
│   ├── settings/           # 글자 크기, 알림, 탈퇴
│   ├── avatar/             # 아바타, 상점, 옷장, 장착
│   ├── cognitive-training/ # 기억력/집중력/판단력/언어 훈련
│   ├── dementia-info/      # 치매 정보 콘텐츠
│   └── chatbot/            # 챗봇 기능
│
├── shared/                 # 여러 화면/기능에서 함께 쓰는 공통 코드
│   ├── api/                # 공통 API 클라이언트, fetch wrapper
│   ├── ui/                 # 공용 버튼, 입력창, 모달, 카드 등
│   ├── hooks/              # 공통 커스텀 훅
│   ├── lib/                # 유틸 함수, 포맷 함수
│   ├── types/              # 전역 공통 타입
│   ├── constants/          # 상수값, 메시지, 키값
│   ├── config/             # 환경설정, 메뉴 설정, route 상수
│   └── assets/             # 공용 아이콘, 이미지, 폰트
│
└── vite-env.d.ts           # Vite 타입 선언
```

---

## 3. 레이어별 규칙

### 3.1 `app/`
역할:
- 앱 초기화
- Router 설정
- 전역 Provider 설정
- 앱 진입 파일 관리

규칙:
- 비즈니스 로직을 직접 작성하지 않는다
- API 호출을 직접 넣지 않는다
- 화면별 상세 UI를 만들지 않는다

### 3.2 `pages/`
역할:
- URL과 직접 연결되는 화면 단위
- 레이아웃과 화면 조합

규칙:
- 페이지는 최대한 얇게 유지한다
- 기능 구현은 `features`에 위임한다
- 페이지 안에서 긴 `useEffect`와 복잡한 로직을 작성하지 않는다

예시:

```tsx
import { MainHero } from '@/features/gnb';
import { DementiaInfoPreview } from '@/features/dementia-info';

export function HomePage() {
  return (
    <>
      <MainHero />
      <DementiaInfoPreview />
    </>
  );
}
```

### 3.3 `features/`
역할:
- 기능 단위 모듈
- 기능별 API, 훅, 타입, UI를 묶어서 관리

구조:
```text
features/{feature}/
├── ui/
├── api.ts
├── hooks.ts
├── types.ts
└── index.ts
```

규칙:
- 해당 기능에만 필요한 코드는 이 폴더 안에 둔다
- UI와 로직은 분리한다
- 복잡해지면 나중에 `ui/`, `model/`, `api/`로 확장할 수 있다
- 처음부터 과하게 깊은 구조로 만들지 않는다

### 3.4 `shared/`
역할:
- 여러 기능에서 재사용하는 공통 자원

포함 가능:
- Button, Input, Modal, Card
- 공통 API 클라이언트
- 날짜/숫자 포맷 함수
- 전역 타입
- 상수
- 설정값

포함 금지:
- AvatarShopPanel
- MypageAttendanceCalendar
- TrainingResultCard
- DementiaInfoSection

규칙:
- `shared`는 특정 feature를 알면 안 된다
- 재사용 가능성이 분명한 것만 둔다
- 기능 전용 UI는 `features`에 둔다

---

## 4. 기획안 기준 기능 분해

### 4.1 공통 모듈
기획안의 GNB와 Footer는 공통 기능이지만 도메인 문맥이 있으므로 `features/gnb`, `features/footer`로 관리한다.

- `features/gnb`
  - 로고
  - 메뉴 이동
  - 로그인 상태 영역
  - 마이페이지/로그아웃 버튼
- `features/footer`
  - 개인정보 처리 방침
  - 이용 약관
  - 쿠키/세션 정책
  - 팀 정보

### 4.2 회원 / 설문
회원가입, 로그인, 소셜 인증, 위험도 설문, 성향 설문은 `features/auth`, `features/survey`로 분리한다.

- `features/auth`
  - 로그인
  - 회원가입
  - 세션 유지
  - 로그아웃
- `features/survey`
  - 치매 위험도 설문
  - 성향 설문
  - 설문 결과 저장

### 4.3 마이페이지 / 설정
- `features/mypage`
  - 사용자 정보
  - 활동 내역
  - 출석 캘린더
  - 보상 내역
- `features/settings`
  - 글자 크기 설정
  - 알림 설정
  - 탈퇴

### 4.4 아바타
아바타, 상점, 옷장, 장착은 `features/avatar`로 관리한다.

### 4.5 인지훈련
기억력, 집중력, 판단력, 언어/인지 훈련은 모두 `features/cognitive-training` 안에서 게임별로 분리한다.

예:
```text
features/cognitive-training/
├── ui/
├── memory/
├── attention/
├── judgment/
├── language/
├── api.ts
├── hooks.ts
├── types.ts
└── index.ts
```

### 4.6 정보 페이지 / 챗봇
- `features/dementia-info`
- `features/chatbot`

---

## 5. 의존성 규칙

허용:
- `pages` → `features`, `shared`
- `features` → `shared`
- `app` → `pages`, `shared`

금지:
- `shared` → `features`
- `shared` → `pages`
- `pages` → `pages`
- feature 간 무분별한 순환 참조

---

## 6. 파일 구성 규칙

### 6.1 feature 폴더 기본 구성
예:
```text
features/avatar/
├── ui/
│   ├── AvatarStage.tsx
│   ├── AvatarShop.tsx
│   └── WardrobePanel.tsx
├── api.ts
├── hooks.ts
├── types.ts
└── index.ts
```

### 6.2 index.ts 사용
외부에서 import할 대상은 `index.ts`를 통해 노출한다.

예:
```ts
export * from './ui/AvatarStage';
export * from './ui/AvatarShop';
export * from './hooks';
```

### 6.3 컴포넌트 분리 기준
아래 중 하나라도 해당하면 분리한다.
- 100줄 이상으로 길어짐
- 조건문이 많아짐
- 재사용 가능성이 있음
- 화면과 로직이 섞임

---

## 7. 명명 규칙

### 파일명
- 컴포넌트: `PascalCase.tsx`
- 훅: `hooks.ts` 또는 `useSomething.ts`
- API: `api.ts`
- 타입: `types.ts`
- 유틸: `camelCase.ts`

### 변수 / 함수명
- 변수: camelCase
- 함수: camelCase
- 상수: SCREAMING_SNAKE_CASE
- 이벤트 핸들러: `handle + 동사 + 대상`

예:
- `handleSubmit`
- `handleLogout`
- `MAX_TRAINING_COUNT`

### Props 이름
컴포넌트 Props는 `컴포넌트명 + Props`

예:
```ts
interface ChatbotButtonProps {
  label: string;
}
```

### 줄임말 규칙
허용:
- id
- url
- api
- ui
- ux

지양:
- req, res
- btn
- img
- idx
- qty

가능하면 풀네임을 쓴다.

---

## 8. 상태 관리 규칙

### 8.1 서버 상태
- API 응답 데이터
- 비동기 요청 결과
- 목록, 상세, 진행 상태

권장:
- React Query 또는 이에 준하는 서버 상태 관리 방식

### 8.2 클라이언트 상태
- 입력값
- 설문 선택값
- 모달 열림/닫힘
- 현재 탭
- 게임 진행 상태

권장:
- `useState`
- `useReducer`

### 8.3 전역 상태
- 로그인 사용자 정보
- 권한 정보
- 글자 크기 설정
- 알림 설정

권장:
- Context API
- 필요 시 Zustand

### 8.4 Hook 분리 기준
컴포넌트 내부에 비즈니스 로직이 길어지면 `hooks.ts` 또는 `useSomething.ts`로 분리한다.

좋은 예:
```ts
const { surveyQuestions, submitSurvey } = useRiskSurvey();
```

피해야 할 예:
- 페이지 컴포넌트 안에 긴 `useEffect`
- 데이터 가공, 권한 분기, 제출 로직이 전부 한 파일에 있음

---

## 9. API 규칙

### 9.1 공통 API 클라이언트
위치:
```text
shared/api/
```

예:
- fetch wrapper
- axios instance
- interceptor
- 공통 에러 처리

### 9.2 feature API
각 기능별 API는 feature 안에 둔다.

예:
```text
features/auth/api.ts
features/survey/api.ts
features/avatar/api.ts
features/cognitive-training/api.ts
```

### 9.3 규칙
- 컴포넌트에서 직접 `fetch` 또는 `axios` 호출하지 않는다
- API 함수는 `api.ts`로 분리한다
- 응답 타입을 반드시 지정한다
- 공통 에러 처리는 중앙 클라이언트에서 우선 처리한다

---

## 10. 컴포넌트 작성 규칙

### 10.1 프레젠테이션 컴포넌트는 단순하게
- 렌더링 중심
- Props 기반
- 가능한 한 순수하게

### 10.2 로직은 hook으로 분리
- 데이터 조회
- 제출 처리
- 권한 체크
- 상태 계산

### 10.3 any 금지
Props, API 응답, 상태는 반드시 타입을 정의한다.

---

## 11. 스타일링 규칙

### 11.1 Tailwind 우선
- 별도 CSS 파일 남용 금지
- 가능한 한 Tailwind utility class 사용

### 11.2 클래스가 길어지면 분리
- `cn()` 유틸 사용
- 공통 UI 컴포넌트로 승격
- 반복 패턴은 shared/ui로 이동

### 11.3 시니어 친화 스타일 원칙
- 기본 폰트 크기를 크게 유지
- 버튼 높이는 충분히 크게 유지
- 대비가 낮은 텍스트 사용 금지
- 클릭 가능한 요소는 명확히 보이게 디자인
- 텍스트만으로 부족하면 아이콘과 함께 안내

### 11.4 반응형
- Mobile First
- 기본은 모바일, 필요 시 `md:`, `lg:` 확장

---

## 12. 접근성 규칙

- label 없는 입력창 금지
- icon-only 버튼에는 `aria-label` 필수
- 키보드만으로 조작 가능해야 함
- 에러 메시지는 짧고 명확해야 함
- 설문, 훈련, 챗봇은 한 번에 한 가지 행동에 집중하게 설계
- 복잡한 애니메이션은 지양

---

## 13. import 규칙

절대경로 alias를 사용한다.

예:
```ts
import { LoginForm } from '@/features/auth';
import { Button } from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/client';
```

금지:
```ts
import { Button } from '../../../../shared/ui/Button';
```

---

## 14. 코드 품질 규칙

### 필수
- TypeScript 에러 없어야 함
- ESLint 에러 없어야 함
- Prettier 포맷 유지
- console 에러 없이 동작해야 함

### 권장
- 중복 코드 줄이기
- 하나의 컴포넌트는 하나의 책임만 가지기
- 긴 파일은 분리하기
- 공통 로직은 hook 또는 util로 이동하기

---

## 15. PR 전 체크리스트

- [ ] TypeScript 에러가 없다
- [ ] ESLint 에러가 없다
- [ ] 불필요한 console 로그가 없다
- [ ] 페이지 컴포넌트가 과도하게 비대하지 않다
- [ ] feature와 shared의 책임이 섞이지 않았다
- [ ] API 호출이 컴포넌트에 직접 들어가 있지 않다
- [ ] 공통 컴포넌트는 shared/ui에 위치한다
- [ ] 기능 전용 컴포넌트는 features 내부에 위치한다
- [ ] 기획안의 기능이 pages/features 책임에 맞게 배치되었다

---

## 16. 한 줄 기준

- `app`: 앱 설정
- `pages`: 화면
- `features`: 기능
- `shared`: 공통

새 파일을 만들기 전, 먼저 이 파일이 어느 책임에 속하는지부터 판단한다.
