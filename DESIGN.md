# 금오링고 - 투자 학습 플랫폼 설계 문서

## 1. 핵심 개념

금오링고는 듀오링고의 성공적인 학습 모델을 투자 교육에 접목한 웹 애플리케이션입니다. 사용자들이 하루 5~10분씩 짧은 퀴즈를 통해 투자 개념을 단계적으로 학습하고, 경험치와 스트릭으로 동기부여를 받으며, 모의 투자를 통해 배운 내용을 실습할 수 있습니다.

## 2. 데이터 모델

### 2.1 사용자 관련 테이블

#### users (기존 테이블 확장)
- `id`: 사용자 고유 ID
- `openId`: Manus OAuth ID
- `name`: 사용자 이름
- `email`: 이메일
- `currentLevel`: 현재 레벨 (1-4)
- `totalXP`: 누적 경험치
- `currentXP`: 현재 레벨의 경험치
- `streak`: 연속 학습 일수
- `lastLearningDate`: 마지막 학습 날짜
- `createdAt`: 생성 일시
- `updatedAt`: 수정 일시

#### userProfiles (신규)
- `id`: 프로필 ID
- `userId`: 사용자 ID (FK)
- `notificationTime`: 알림 시간 (HH:MM 형식)
- `notificationEnabled`: 알림 활성화 여부
- `badges`: 획득한 배지 (JSON 배열)
- `totalLessonsCompleted`: 완료한 레슨 수
- `totalQuizzesCompleted`: 완료한 퀴즈 수
- `portfolioValue`: 포트폴리오 총 자산가

### 2.2 학습 콘텐츠 테이블

#### levels (신규)
- `id`: 레벨 ID
- `levelNumber`: 레벨 번호 (1-4)
- `title`: 레벨 제목 (예: "주식 기초")
- `description`: 레벨 설명
- `requiredXP`: 이 레벨에 도달하기 위한 필요 XP
- `order`: 순서

#### lessons (신규)
- `id`: 레슨 ID
- `levelId`: 레벨 ID (FK)
- `title`: 레슨 제목 (예: "주식이란?")
- `description`: 레슨 설명
- `content`: 레슨 본문 (마크다운)
- `order`: 레벨 내 순서
- `createdAt`: 생성 일시

#### quizzes (신규)
- `id`: 퀴즈 ID
- `lessonId`: 레슨 ID (FK)
- `type`: 퀴즈 타입 ("multiple_choice" | "true_false")
- `question`: 문제 텍스트
- `explanation`: 정답 설명
- `order`: 레슨 내 순서
- `xpReward`: 이 퀴즈 완료 시 획득 XP (기본값: 10)

#### quizOptions (신규)
- `id`: 옵션 ID
- `quizId`: 퀴즈 ID (FK)
- `text`: 선택지 텍스트
- `isCorrect`: 정답 여부
- `order`: 선택지 순서

#### userQuizProgress (신규)
- `id`: 진행도 ID
- `userId`: 사용자 ID (FK)
- `quizId`: 퀴즈 ID (FK)
- `isCompleted`: 완료 여부
- `isCorrect`: 정답 여부
- `attemptCount`: 시도 횟수
- `completedAt`: 완료 일시

#### userLessonProgress (신규)
- `id`: 진행도 ID
- `userId`: 사용자 ID (FK)
- `lessonId`: 레슨 ID (FK)
- `isCompleted`: 완료 여부
- `completedAt`: 완료 일시

### 2.3 모의 투자 관련 테이블

#### stocks (신규)
- `id`: 주식 ID
- `symbol`: 주식 심볼 (예: "AAPL")
- `name`: 회사명
- `currentPrice`: 현재 가격
- `priceUpdatedAt`: 가격 업데이트 시간
- `description`: 회사 설명

#### portfolioItems (신규)
- `id`: 포트폴리오 항목 ID
- `userId`: 사용자 ID (FK)
- `stockId`: 주식 ID (FK)
- `quantity`: 보유 수량
- `purchasePrice`: 매입가
- `purchaseDate`: 매입 날짜
- `currentValue`: 현재 평가액

#### portfolioTransactions (신규)
- `id`: 거래 ID
- `userId`: 사용자 ID (FK)
- `stockId`: 주식 ID (FK)
- `type`: 거래 타입 ("buy" | "sell")
- `quantity`: 거래 수량
- `price`: 거래 가격
- `totalAmount`: 거래 총액
- `transactionDate`: 거래 일시

## 3. 학습 콘텐츠 구조

### Level 1: 주식 기초 (필요 XP: 0)
1. **Lesson 1-1: 주식이란?**
   - Quiz 1: 주식의 정의 (객관식)
   - Quiz 2: 주식 시장의 역할 (OX)

2. **Lesson 1-2: 주식 시장**
   - Quiz 1: 주식 거래소 (객관식)
   - Quiz 2: 주식 가격 결정 (OX)

3. **Lesson 1-3: 주식 분석 기초**
   - Quiz 1: PER, PBR의 의미 (객관식)
   - Quiz 2: 기술적 분석 (OX)

### Level 2: ETF와 분산투자 (필요 XP: 100)
1. **Lesson 2-1: ETF란?**
   - Quiz 1: ETF의 정의 (객관식)
   - Quiz 2: ETF의 장점 (OX)

2. **Lesson 2-2: 분산투자 전략**
   - Quiz 1: 자산 배분 (객관식)
   - Quiz 2: 포트폴리오 구성 (OX)

### Level 3: 기업 분석 (필요 XP: 250)
1. **Lesson 3-1: 재무제표 분석**
   - Quiz 1: 손익계산서 (객관식)
   - Quiz 2: 재무비율 분석 (OX)

2. **Lesson 3-2: 경쟁 분석**
   - Quiz 1: 산업 분석 (객관식)
   - Quiz 2: 경쟁 우위 (OX)

### Level 4: 거시경제 (필요 XP: 400)
1. **Lesson 4-1: 경제 지표**
   - Quiz 1: GDP와 인플레이션 (객관식)
   - Quiz 2: 금리와 환율 (OX)

2. **Lesson 4-2: 투자 전략**
   - Quiz 1: 경기 사이클 투자 (객관식)
   - Quiz 2: 리스크 관리 (OX)

## 4. 경험치 및 레벨 시스템

### XP 획득 규칙
- 퀴즈 정답: 10 XP
- 퀴즈 오답 후 재시도 정답: 5 XP
- 매일 첫 학습 완료: 5 XP 보너스
- 스트릭 7일 달성: 20 XP 보너스
- 스트릭 30일 달성: 50 XP 보너스

### 레벨업 기준
- Level 1 → Level 2: 100 XP
- Level 2 → Level 3: 250 XP (누적)
- Level 3 → Level 4: 400 XP (누적)
- Level 4 최대: 500+ XP

### 스트릭 시스템
- 매일 1개 이상의 퀴즈 완료 시 스트릭 +1
- 24시간 이상 학습하지 않으면 스트릭 리셋
- 스트릭 달성 시 배지 획득 (7일, 30일, 100일)

## 5. 모의 투자 시뮬레이션

### 초기 설정
- 초기 자본금: 1,000,000 (가상 화폐)
- 거래 가능 주식/ETF: 30개 (S&P 500, Apple, Microsoft, Tesla, Samsung, NAVER 등)
- 실시간 시세: Data API를 통해 5분마다 업데이트

### 포트폴리오 기능
- 매수/매도 거래
- 보유 주식 조회
- 수익률 계산 (수익률 = (현재가 - 매입가) / 매입가 * 100%)
- 거래 이력 조회
- 포트폴리오 성과 차트

## 6. 알림 시스템

### 알림 설정
- 사용자가 원하는 시간 설정 (예: 오전 8시)
- 매일 해당 시간에 학습 알림 발송
- 알림 활성화/비활성화 토글

### 알림 내용
- "오늘의 투자 레슨을 배워보세요!"
- 현재 스트릭 일수 표시
- 다음 레벨까지 필요한 XP 표시

## 7. LLM 통합

### 오답 피드백
- 퀴즈 오답 시 LLM이 개념을 쉽게 재설명
- 사용자 수준에 맞춘 설명 제공

### 맞춤형 가이드
- 사용자의 질문에 대해 투자 학습 가이드 제공
- 특정 개념에 대한 심화 학습 자료 제공

## 8. 디자인 원칙

### 우아하고 완벽한 스타일
- **색상**: 프리미엄 그라데이션 (진청색 → 라벤더)
- **타이포그래피**: 세련된 산세리프 폰트 (Pretendard)
- **레이아웃**: 대칭적이고 정돈된 구조
- **마이크로 인터랙션**: 부드러운 애니메이션과 즉각적인 피드백
- **여백**: 충분한 공간으로 우아함 표현

### 사용자 경험
- 직관적인 네비게이션
- 명확한 진행도 시각화
- 즉각적인 성취감 제공 (XP, 배지, 레벨업)
- 모바일 우선 반응형 디자인

## 9. 기술 스택

- **프론트엔드**: React 19 + Tailwind CSS 4 + shadcn/ui
- **백엔드**: Express 4 + tRPC 11
- **데이터베이스**: MySQL (Drizzle ORM)
- **인증**: Manus OAuth
- **외부 API**: Data API (주식 시세), LLM (설명 생성)
- **알림**: Manus 내장 알림 API

## 10. 개발 로드맵

1. **Phase 1**: 데이터 모델 설계 ✓
2. **Phase 2**: 데이터베이스 스키마 및 tRPC 라우터 구현
3. **Phase 3**: 핵심 학습 UI 및 기능 개발
4. **Phase 4**: 모의 투자 시뮬레이션 구현
5. **Phase 5**: 대시보드, 알림, LLM 통합
6. **Phase 6**: UI 완성 및 반응형 디자인
7. **Phase 7**: 배포 및 최종 검수
