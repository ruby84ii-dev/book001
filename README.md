# 🌱🦋 매일 쑥쑥 멋진 나 (초등 3학년 습관 기록장)

초등학교 3학년 어린이들이 독서와 줄넘기를 기록하고, **강낭콩과 배추흰나비의 한살이** 마스코트를 키우며 스스로의 성장을 한눈에 확인하는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

- **🏃 줄넘기 기록장**:
  - 두발 모아 뛰기, 발 번갈아 뛰기 입력
  - **오늘의 총 줄넘기 갯수 수동 직접 입력** (아이가 원하는데로 수정 및 입력 가능)
  - 느낌 이모지 및 **오늘의 줄넘기 소감 (선택사항)** 입력
  - 날짜별 갯수 변화 그래프 (Chart.js)
  - 배추흰나비 한살이 (알 🥚 ➔ 애벌레 🐛 ➔ 번데기 🪵 ➔ 나비 🦋) 성장판

- **📚 독서 기록장**:
  - 시작일 ~ 종료일 (하루에 읽은 경우 시작일만 지정해도 기록 가능)
  - 별점 평가 (⭐ 1~5점) & 이 책 한마디 💭
  - 알록달록 3D 서재 책장 뷰 (Bookshelf)
  - 강낭콩 한살이 (씨앗 🫘 ➔ 떡잎/싹 🌱 ➔ 줄기/잎 🌿 ➔ 꽃 🌸 ➔ 꼬투리 🫛) 성장판

- **🏆 명예의 전당 (Hall of Fame)**:
  - [독서 전당] 과 [줄넘기 전당] 탭 분리
  - 최다 권수, 별5점 베스트, 최다 총 갯수 기록 및 10종의 달성 뱃지 수여

- **🌟 나의 성취 리포트 (상장 카드)**:
  - 독서 + 줄넘기 종합 요약 & 자동 칭찬 응원 카드
  - 부모님/선생님께 제출 가능한 **상장 카드 인쇄/이미지 저장** 기능 (`window.print()`)

- **🔑 Firebase & 배포 연동**:
  - Firebase Authentication (**Google 로그인**) & Cloud Firestore DB 데이터 동기화
  - Vercel 자동 배포 설정 (`vercel.json`)

---

## 🛠️ 기술 스택

- **Front-end**: HTML5, Vanilla CSS3 (Pastel Glassmorphism), JavaScript (Modern ES6 SPA)
- **Chart & Animation**: Chart.js, Canvas-Confetti
- **Backend / Auth**: Firebase Auth (Google Provider), Cloud Firestore
- **Deployment**: GitHub, Vercel

---

## 🚀 GitHub 올리기 & Vercel 배포 가이드

### 1) GitHub 레포지토리 업로드
터미널에서 아래 명령어를 실행하여 깃허브에 코드를 올립니다.
```bash
git init
git add .
git commit -m "Feat: 매일 쑥쑥 멋진 나 앱 완성 (Firebase Google Auth & 수동 total 입력 반영)"
git branch -M main
git remote add origin https://github.com/사용자계정/바이브코딩-줄넘기.git
git push -u origin main
```

### 2) Firebase 구글 로그인 & DB 설정
1. [Firebase Console](https://console.firebase.google.com/) 접속 ➔ 프로젝트 생성
2. **Authentication** ➔ Google 로그인 제공업체 활성화
3. **Firestore Database** ➔ 데이터베이스 만들기 (테스트 모드 시작)
4. 앱 설정의 `firebaseConfig` 객체 값을 `firebase-config.js` 파일에 복사 붙여넣기 합니다.

### 3) Vercel 배포
1. [Vercel](https://vercel.com/) 로그인
2. **Add New...** ➔ **Project** ➔ 본인의 GitHub 레포지토리 선택
3. **Deploy** 버튼 클릭! (약 10초 후 배포 URL이 생성됩니다 🎉)
