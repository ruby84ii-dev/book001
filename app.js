/* ==========================================
   매일 쑥쑥 멋진 나 - 초등 3학년 습관 기록장 App Logic
   - LocalStorage & Firebase Auth/Firestore DB
   - School-Grade-Class Selector & Class Leaderboard
   - Monthly Reading Leaderboard (이달의 다독왕)
   - Today's Jump Rope Leaderboard (오늘의 챔피언)
   - Mascot Life-Cycle (강낭콩 & 배추흰나비)
   - Chart.js Jump Rope Graph & Bookshelf & Certificate
   ========================================== */

// --- 1. 상태 및 상수 정의 ---
const STORAGE_KEYS = {
  JUMP_ROPE: 'growing_me_jump_rope_v1',
  READING: 'growing_me_reading_v2',
  USER_CLASS: 'growing_me_class_v1'
};

const BEAN_STAGES = [
  { stage: 1, name: '🫘 씨앗 단계', icon: '🫘', title: '1단계: 흙 속의 강낭콩 씨앗', desc: '따뜻한 흙 속에서 물을 마시고 있는 씨앗이에요!', req: 0 },
  { stage: 2, name: '🌱 떡잎/어린싹 단계', icon: '🌱', title: '2단계: 파릇파릇 어린싹', desc: '씨앗을 뚫고 떡잎과 어린싹이 돋아났어요!', req: 3 },
  { stage: 3, name: '🌿 줄기/본잎 단계', icon: '🌿', title: '3단계: 쑥쑥 줄기와 본잎', desc: '줄기가 튼튼해지고 본잎이 넓게 펼쳐졌어요!', req: 6 },
  { stage: 4, name: '🌸 꽃 단계', icon: '🌸', title: '4단계: 예쁘게 피어난 강낭콩 꽃', desc: '분홍빛 귀여운 강낭콩 꽃이 활짝 피었습니다!', req: 10 },
  { stage: 5, name: '🫛 꼬투리 단계', icon: '🫛', title: '5단계: 탐스러운 강낭콩 꼬투리', desc: '영양 가득 강낭콩 꼬투리가 주렁주렁 열렸어요!', req: 15 }
];

const BUTTERFLY_STAGES = [
  { stage: 1, name: '🥚 알 단계', icon: '🥚', title: '1단계: 배추잎 위 알', desc: '배추 잎 뒤에 쪼그만 옥수수 모양 알이 있어요!', req: 0 },
  { stage: 2, name: '🐛 애벌레 단계', icon: '🐛', title: '2단계: 와구와구 애벌레', desc: '배추 잎을 맛있게 먹으며 허물을 벗고 자라나요!', req: 3 },
  { stage: 3, name: '🪵 번데기 단계', icon: '🪵', title: '3단계: 변신 준비 번데기', desc: '실을 내어 몸을 고정하고 멋진 변신을 준비해요!', req: 6 },
  { stage: 4, name: '🦋 배추흰나비 단계', icon: '🦋', title: '4단계: 날아오르는 배추흰나비', desc: '번데기에서 부화해 아름다운 나비가 되었어요!', req: 10 }
];

const READING_BADGES = [
  { id: 'rb1', icon: '🌱', name: '첫 걸음 싹', condition: '책 1권 읽기', check: (books) => books.length >= 1 },
  { id: 'rb2', icon: '🌿', name: '책벌레 어린싹', condition: '책 3권 읽기', check: (books) => books.length >= 3 },
  { id: 'rb3', icon: '🌸', name: '꽃피는 서재', condition: '책 5권 읽기', check: (books) => books.length >= 5 },
  { id: 'rb4', icon: '⭐', name: '별점 마스터', condition: '별 5점 리뷰 3개 이상', check: (books) => books.filter(b => b.rating == 5).length >= 3 },
  { id: 'rb5', icon: '🫛', name: '강낭콩 달인', condition: '책 10권 이상 다독왕', check: (books) => books.length >= 10 }
];

const JUMP_BADGES = [
  { id: 'jb1', icon: '🥚', name: '줄넘기 입문알', condition: '줄넘기 1회 기록', check: (jumps) => jumps.length >= 1 },
  { id: 'jb2', icon: '🐛', name: '튼튼 애벌레', condition: '줄넘기 3회 기록', check: (jumps) => jumps.length >= 3 },
  { id: 'jb3', icon: '⚡', name: '100회 돌파', condition: '한 번에 100개 이상 뛰어넘기', check: (jumps) => jumps.some(j => j.total >= 100) },
  { id: 'jb4', icon: '🪵', name: '번데기 점퍼', condition: '줄넘기 6회 기록', check: (jumps) => jumps.length >= 6 },
  { id: 'jb5', icon: '🦋', name: '배추흰나비 챔피언', condition: '누적 300회 뛰기 성공', check: (jumps) => jumps.reduce((a, b) => a + b.total, 0) >= 300 }
];

const BOOK_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1DD1A1', '#FF9F43', '#54A0FF', '#A55EEA', '#FF9FF3'];

// 학급 비교용 데모 반 친구들 샘플 데이터 (이달의 독서량 & 오늘 줄넘기)
const MOCK_CLASSMATES = [
  { name: '김철수', monthlyRead: 5, todayJump: 110, recBook: { title: '어린이 과학 형사대', author: '고수진', quote: '추리가 너무 흥미진진해서 손을 뗄 수가 없었다!' } },
  { name: '이영희', monthlyRead: 3, todayJump: 90, recBook: { title: '무지개 장수풍뎅이', author: '박곤충', quote: '곤충의 생태를 자세히 알아가는 것이 즐거웠다.' } },
  { name: '박민수', monthlyRead: 2, todayJump: 140, recBook: { title: '마법의 수학 퀴즈', author: '정수학', quote: '수학 문제가 게임처럼 느껴지는 마법 같은 책!' } },
  { name: '최지우', monthlyRead: 4, todayJump: 75, recBook: { title: '아홉 살의 마음', author: '박성우', quote: '내 마음속 기분을 여러 단어로 알아볼 수 있어 좋았다.' } }
];

let state = {
  jumpRopes: [],
  readings: [],
  userClass: {
    school: '서울초등학교',
    grade: '3',
    classNum: '1',
    nickname: '멋진 어린이'
  },
  currentUser: null
};

let jumpChartInstance = null;

// --- 2. 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
  initClassConfig();
  initFirebaseApp();
  initLocalData();
  setupEvents();
  setupDates();
  renderAll();
});

function initClassConfig() {
  const savedClass = localStorage.getItem(STORAGE_KEYS.USER_CLASS);
  if (savedClass) {
    try {
      state.userClass = JSON.parse(savedClass);
    } catch (e) {}
  }
  updateClassHeaderDisplay();
}

function updateClassHeaderDisplay() {
  const shortSchool = state.userClass.school.length > 5 ? state.userClass.school.substring(0, 4) + '..' : state.userClass.school;
  const schoolLabel = `${shortSchool} ${state.userClass.grade}-${state.userClass.classNum}반`;
  
  const elSchool = document.getElementById('header-school-label');
  const elNick = document.getElementById('header-nickname-val');
  
  if (elSchool) elSchool.textContent = schoolLabel;
  if (elNick) elNick.textContent = state.userClass.nickname;

  const tagRead = document.getElementById('hall-reading-class-tag');
  if (tagRead) tagRead.textContent = `${state.userClass.grade}-${state.userClass.classNum}반 이달의 명예의 전당`;
  
  const certSub = document.getElementById('cert-class-subtitle');
  if (certSub) certSub.textContent = `${state.userClass.school} ${state.userClass.grade}학년 ${state.userClass.classNum}반 | 독서 & 줄넘기 성장 기록`;

  const certFoot = document.getElementById('cert-school-name-footer');
  if (certFoot) certFoot.textContent = `${state.userClass.school} ${state.userClass.grade}학년 ${state.userClass.classNum}반`;

  const hallSub = document.getElementById('hall-class-title-subtitle');
  if (hallSub) hallSub.textContent = `🏫 ${state.userClass.school} ${state.userClass.grade}학년 ${state.userClass.classNum}반 친구들과 소통하며 성장을 겨루어보세요!`;
}

function saveClassConfig() {
  localStorage.setItem(STORAGE_KEYS.USER_CLASS, JSON.stringify(state.userClass));
  updateClassHeaderDisplay();
}

function initFirebaseApp() {
  const isAvailable = typeof initFirebase === 'function' && initFirebase();
  if (!isAvailable || !firebaseAuth) return;

  firebaseAuth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('btn-google-login');
    const profileChip = document.getElementById('user-profile-chip');

    if (user) {
      state.currentUser = user;
      if (loginBtn) loginBtn.style.display = 'none';
      if (profileChip) {
        profileChip.style.display = 'flex';
        document.getElementById('user-name').textContent = user.displayName || state.userClass.nickname;
        document.getElementById('user-photo').src = user.photoURL || 'https://via.placeholder.com/32';
      }
      loadFirestoreData(user.uid);
    } else {
      state.currentUser = null;
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (profileChip) profileChip.style.display = 'none';
      initLocalData();
      renderAll();
    }
  });
}

function initLocalData() {
  const savedJump = localStorage.getItem(STORAGE_KEYS.JUMP_ROPE);
  const savedRead = localStorage.getItem(STORAGE_KEYS.READING);

  if (savedJump) {
    state.jumpRopes = JSON.parse(savedJump);
  } else {
    state.jumpRopes = [
      { id: 1, date: '2026-07-15', twoFeet: 30, alternate: 20, total: 50, feeling: '😀', note: '처음엔 쌩쌩이가 안 되었지만 재미있었다!' },
      { id: 2, date: '2026-07-22', twoFeet: 45, alternate: 25, total: 70, feeling: '😃', note: '발 번갈아 뛰는 박수를 익혔다.' },
      { id: 3, date: '2026-08-01', twoFeet: 60, alternate: 40, total: 100, feeling: '🥳', note: '드디어 100회 달성! 나비가 된 느낌!' }
    ];
    saveData();
  }

  if (savedRead) {
    state.readings = JSON.parse(savedRead);
  } else {
    state.readings = [];
    saveData();
  }
}

function loadFirestoreData(uid) {
  if (!firebaseDb) return;
  
  firebaseDb.collection('users').doc(uid).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      if (data.jumpRopes) state.jumpRopes = data.jumpRopes;
      if (data.readings) state.readings = data.readings;
      if (data.userClass) {
        state.userClass = data.userClass;
        saveClassConfig();
      }
      renderAll();
    } else {
      syncToFirestore();
    }
  }).catch(err => console.warn("Firestore 로드 참고:", err));
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.JUMP_ROPE, JSON.stringify(state.jumpRopes));
  localStorage.setItem(STORAGE_KEYS.READING, JSON.stringify(state.readings));
  if (state.currentUser) syncToFirestore();
}

function syncToFirestore() {
  if (!firebaseDb || !state.currentUser) return;
  
  const classId = `${state.userClass.school}_${state.userClass.grade}_${state.userClass.classNum}`;
  firebaseDb.collection('users').doc(state.currentUser.uid).set({
    jumpRopes: state.jumpRopes,
    readings: state.readings,
    userClass: state.userClass,
    classId: classId,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(e => console.error("Firestore 저장 오류:", e));
}

function setupDates() {
  const today = new Date().toISOString().split('T')[0];
  const jumpDateInput = document.getElementById('jump-date');
  const readStartDateInput = document.getElementById('read-start-date');

  if (jumpDateInput) jumpDateInput.value = today;
  if (readStartDateInput) readStartDateInput.value = today;
}

// --- 3. 이벤트 리스너 ---
function setupEvents() {
  // 학급 설정 모달
  const btnClassConfig = document.getElementById('btn-class-config');
  const classModal = document.getElementById('class-modal');
  const classModalClose = document.getElementById('class-modal-close-btn');

  btnClassConfig?.addEventListener('click', () => {
    document.getElementById('school-name-input').value = state.userClass.school;
    document.getElementById('grade-select').value = state.userClass.grade;
    document.getElementById('class-num-input').value = state.userClass.classNum;
    document.getElementById('user-nickname-input').value = state.userClass.nickname;
    classModal?.classList.add('active');
  });

  classModalClose?.addEventListener('click', () => classModal?.classList.remove('active'));
  classModal?.addEventListener('click', (e) => {
    if (e.target.id === 'class-modal') classModal?.classList.remove('active');
  });

  const classModalContent = classModal?.querySelector('.modal-content');
  classModalContent?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.getElementById('class-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.userClass.school = document.getElementById('school-name-input').value.trim() || '서울초등학교';
    state.userClass.grade = document.getElementById('grade-select').value;
    state.userClass.classNum = document.getElementById('class-num-input').value || '1';
    state.userClass.nickname = document.getElementById('user-nickname-input').value.trim() || '멋진 어린이';

    saveClassConfig();
    saveData();
    renderAll();
    classModal?.classList.remove('active');
    alert(`🏫 내 학급 프로필(${state.userClass.school} ${state.userClass.grade}-${state.userClass.classNum}반)이 성공적으로 설정되었습니다!`);
  });

  // 구글 로그인/로그아웃
  document.getElementById('btn-google-login')?.addEventListener('click', () => {
    if (firebaseAuth && googleProvider) {
      firebaseAuth.signInWithPopup(googleProvider).catch(err => alert("구글 로그인 안내: " + err.message));
    } else {
      alert("🌐 구글 로그인 기능은 Firebase 프로젝트 설정(firebase-config.js)을 연결한 후 사용하실 수 있습니다! 현재는 브라우저 저장소 모드로 작동합니다.");
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (firebaseAuth) firebaseAuth.signOut().then(() => alert("로그아웃 되었습니다."));
  });

  // 탭
  document.querySelectorAll('.main-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // 서브 탭
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const subtab = btn.getAttribute('data-subtab');
      document.getElementById(`subtab-${subtab}`).classList.add('active');
    });
  });

  // 바로가기
  document.getElementById('btn-quick-jump')?.addEventListener('click', () => switchTab('jump-rope'));
  document.getElementById('btn-quick-read')?.addEventListener('click', () => switchTab('reading'));
  document.getElementById('go-jump-rope')?.addEventListener('click', () => switchTab('jump-rope'));
  document.getElementById('go-reading')?.addEventListener('click', () => switchTab('reading'));

  // 줄넘기 입력 자동 계산
  const twoFeetInput = document.getElementById('jump-two-feet');
  const alternateInput = document.getElementById('jump-alternate');
  const totalInput = document.getElementById('jump-total');

  function suggestJumpTotal() {
    const val1 = parseInt(twoFeetInput.value) || 0;
    const val2 = parseInt(alternateInput.value) || 0;
    totalInput.value = val1 + val2;
  }

  twoFeetInput?.addEventListener('input', suggestJumpTotal);
  alternateInput?.addEventListener('input', suggestJumpTotal);

  // 이모지 선택
  document.querySelectorAll('#jump-feeling-group .feeling-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#jump-feeling-group .feeling-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // 줄넘기 저장
  document.getElementById('jump-rope-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('jump-date').value;
    const twoFeet = parseInt(document.getElementById('jump-two-feet').value) || 0;
    const alternate = parseInt(document.getElementById('jump-alternate').value) || 0;
    const total = parseInt(document.getElementById('jump-total').value) || 0;
    const activeFeelingBtn = document.querySelector('#jump-feeling-group .feeling-btn.active');
    const feeling = activeFeelingBtn ? activeFeelingBtn.getAttribute('data-feeling') : '😀';
    const note = document.getElementById('jump-note').value.trim();

    const newRecord = {
      id: Date.now(),
      date,
      twoFeet,
      alternate,
      total,
      feeling,
      note
    };

    state.jumpRopes.push(newRecord);
    state.jumpRopes.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveData();
    renderAll();
    fireConfetti();

    alert(`🎉 오늘의 줄넘기 ${total}회가 멋지게 저장되었습니다! 참 잘했어요!`);
    document.getElementById('jump-two-feet').value = 0;
    document.getElementById('jump-alternate').value = 0;
    document.getElementById('jump-total').value = 0;
    document.getElementById('jump-note').value = '';
  });

  // 별점
  document.querySelectorAll('#star-rating-box .star').forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'));
      document.getElementById('book-rating').value = val;
      
      document.querySelectorAll('#star-rating-box .star').forEach((s, idx) => {
        if (idx < val) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });

  // 독서 저장
  document.getElementById('reading-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const startDate = document.getElementById('read-start-date').value;
    let endDate = document.getElementById('read-end-date').value;
    if (!endDate) endDate = startDate;

    const rating = parseInt(document.getElementById('book-rating').value) || 5;
    const isRecommended = document.getElementById('book-recommend').checked;
    const quote = document.getElementById('book-quote').value.trim();

    const newBook = {
      id: Date.now(),
      title,
      author,
      startDate,
      endDate,
      rating,
      isRecommended,
      quote
    };

    state.readings.unshift(newBook);
    saveData();
    renderAll();
    fireConfetti();

    alert(`📚 "${title}" 책이 내 서재와 이달의 추천 갤러리에 등록되었습니다! 대견해요!`);
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-quote').value = '';
    document.getElementById('read-end-date').value = '';
  });

  // 인쇄
  document.getElementById('btn-print-certificate')?.addEventListener('click', () => window.print());

  // 모달 닫기
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('book-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'book-modal') closeModal();
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.main-nav .nav-btn').forEach(b => {
    if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
    else b.classList.remove('active');
  });

  document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));

  const activePage = document.getElementById(`tab-${tabId}`);
  if (activePage) activePage.classList.add('active');

  if (tabId === 'jump-rope') setTimeout(renderJumpChart, 100);
}

function fireConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }
}

function getBeanStage(bookCount) {
  let stage = BEAN_STAGES[0];
  for (let s of BEAN_STAGES) {
    if (bookCount >= s.req) stage = s;
  }
  return stage;
}

function getButterflyStage(jumpCount) {
  let stage = BUTTERFLY_STAGES[0];
  for (let s of BUTTERFLY_STAGES) {
    if (jumpCount >= s.req) stage = s;
  }
  return stage;
}

// --- 4. 렌더링 총괄 ---
function renderAll() {
  const readCount = state.readings.length;
  const jumpCount = state.jumpRopes.length;
  const jumpTotalSum = state.jumpRopes.reduce((acc, curr) => acc + curr.total, 0);

  const beanStage = getBeanStage(readCount);
  const butterflyStage = getButterflyStage(jumpCount);

  // 헤더
  document.getElementById('header-bean-icon').textContent = beanStage.icon;
  document.getElementById('header-bean-stage').textContent = beanStage.name.split(' ')[1] || beanStage.name;
  
  document.getElementById('header-butterfly-icon').textContent = butterflyStage.icon;
  document.getElementById('header-butterfly-stage').textContent = butterflyStage.name.split(' ')[1] || butterflyStage.name;

  // 홈
  renderHomeMascots(readCount, jumpCount, beanStage, butterflyStage);
  renderHomeRecentList();

  // 줄넘기
  renderJumpHistoryList();
  renderJumpChart();

  // 독서
  renderBookshelf();
  renderReadingHistoryList();
  renderRecommendations();

  // 명예의 전당 (이달의 독서 & 오늘의 줄넘기)
  renderHallOfFame(readCount, jumpCount, jumpTotalSum, beanStage, butterflyStage);

  // 성취 리포트 (전체 누적)
  renderCertificate(readCount, jumpTotalSum, beanStage, butterflyStage);
}

function renderHomeMascots(readCount, jumpCount, beanStage, butterflyStage) {
  document.getElementById('home-bean-avatar').textContent = beanStage.icon;
  document.getElementById('home-bean-title').textContent = beanStage.title;
  document.getElementById('home-bean-desc').textContent = beanStage.desc;
  document.getElementById('home-read-count').textContent = readCount;

  const nextBean = BEAN_STAGES.find(s => s.req > readCount);
  if (nextBean) {
    const prevReq = beanStage.req;
    const progressPercent = Math.min(100, Math.round(((readCount - prevReq) / (nextBean.req - prevReq)) * 100));
    document.getElementById('home-bean-bar').style.width = `${Math.max(15, progressPercent)}%`;
    document.getElementById('home-bean-next-label').textContent = `다음 단계까지 ${nextBean.req - readCount}권`;
  } else {
    document.getElementById('home-bean-bar').style.width = '100%';
    document.getElementById('home-bean-next-label').textContent = '최고 한살이 달성! 🫛';
  }

  BEAN_STAGES.forEach(s => {
    const el = document.getElementById(`step-bean-${s.stage}`);
    if (el) {
      if (beanStage.stage >= s.stage) el.classList.add('active');
      else el.classList.remove('active');
    }
  });

  document.getElementById('home-butterfly-avatar').textContent = butterflyStage.icon;
  document.getElementById('home-butterfly-title').textContent = butterflyStage.title;
  document.getElementById('home-butterfly-desc').textContent = butterflyStage.desc;
  document.getElementById('home-jump-count').textContent = jumpCount;

  const nextButterfly = BUTTERFLY_STAGES.find(s => s.req > jumpCount);
  if (nextButterfly) {
    const prevReq = butterflyStage.req;
    const progressPercent = Math.min(100, Math.round(((jumpCount - prevReq) / (nextButterfly.req - prevReq)) * 100));
    document.getElementById('home-butterfly-bar').style.width = `${Math.max(15, progressPercent)}%`;
    document.getElementById('home-butterfly-next-label').textContent = `다음 단계까지 ${nextButterfly.req - jumpCount}회`;
  } else {
    document.getElementById('home-butterfly-bar').style.width = '100%';
    document.getElementById('home-butterfly-next-label').textContent = '최고 한살이 달성! 🦋';
  }

  BUTTERFLY_STAGES.forEach(s => {
    const el = document.getElementById(`step-butterfly-${s.stage}`);
    if (el) {
      if (butterflyStage.stage >= s.stage) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function renderHomeRecentList() {
  const jumpContainer = document.getElementById('home-recent-jump-rope');
  const readContainer = document.getElementById('home-recent-reading');

  if (jumpContainer) {
    const recentJumps = [...state.jumpRopes].slice(-3).reverse();
    if (recentJumps.length === 0) {
      jumpContainer.innerHTML = `<div class="summary-item">아직 기록이 없어요. 첫 줄넘기를 도전해보세요!</div>`;
    } else {
      jumpContainer.innerHTML = recentJumps.map(j => `
        <div class="summary-item">
          <div>
            <div class="item-title">🏃 ${j.date}</div>
            <div class="item-sub">두발: ${j.twoFeet}회 | 발번갈: ${j.alternate}회</div>
            ${j.note ? `<div class="jump-note-bubble">💬 ${j.note}</div>` : ''}
          </div>
          <span style="font-size:18px; font-weight:800; color:var(--primary-hover);">${j.total}회 ${j.feeling}</span>
        </div>
      `).join('');
    }
  }

  if (readContainer) {
    const recentReads = [...state.readings].slice(0, 3);
    if (recentReads.length === 0) {
      readContainer.innerHTML = `<div class="summary-item">아직 읽은 책이 없어요. 재미있는 책을 읽고 적어보세요!</div>`;
    } else {
      readContainer.innerHTML = recentReads.map(r => `
        <div class="summary-item">
          <div>
            <div class="item-title">📚 ${r.title} ${r.isRecommended ? '💖' : ''}</div>
            <div class="item-sub">${r.author}</div>
          </div>
          <span style="color:#FFD166;">${'★'.repeat(r.rating)}</span>
        </div>
      `).join('');
    }
  }
}

function renderJumpHistoryList() {
  const listEl = document.getElementById('jump-rope-history-list');
  if (!listEl) return;

  const reversed = [...state.jumpRopes].reverse();
  if (reversed.length === 0) {
    listEl.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">기록된 줄넘기가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = reversed.map(j => `
    <div class="history-item">
      <div class="history-main-info">
        <h4>${j.feeling} ${j.date} 줄넘기</h4>
        <p>두발모아 ${j.twoFeet}회 + 발번갈아 ${j.alternate}회</p>
        ${j.note ? `<div class="jump-note-bubble">💭 소감: "${j.note}"</div>` : ''}
      </div>
      <div class="history-side-info">
        <span class="history-big-val">${j.total} 회</span>
        <button class="delete-btn" onclick="deleteJumpRecord(${j.id})">&times;</button>
      </div>
    </div>
  `).join('');
}

window.deleteJumpRecord = function(id) {
  if (confirm('이 줄넘기 기록을 삭제할까요?')) {
    state.jumpRopes = state.jumpRopes.filter(j => j.id !== id);
    saveData();
    renderAll();
  }
};

function renderJumpChart() {
  const ctx = document.getElementById('jumpRopeChart');
  if (!ctx) return;

  const labels = state.jumpRopes.map(j => j.date.substring(5));
  const totals = state.jumpRopes.map(j => j.total);
  const twoFeets = state.jumpRopes.map(j => j.twoFeet);
  const alternates = state.jumpRopes.map(j => j.alternate);

  if (jumpChartInstance) jumpChartInstance.destroy();

  jumpChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '오늘의 총 갯수 (회)',
          data: totals,
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#36B4AC'
        },
        {
          label: '두발 뛰기',
          data: twoFeets,
          borderColor: '#FF9F43',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: '발 번갈아 뛰기',
          data: alternates,
          borderColor: '#54A0FF',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { family: 'Gothic A1', size: 12, weight: 'bold' } } } },
      scales: {
        y: { beginAtZero: true, ticks: { font: { family: 'Gothic A1' } } },
        x: { ticks: { font: { family: 'Gothic A1' } } }
      }
    }
  });
}

function renderBookshelf() {
  const shelfContainer = document.getElementById('bookshelf-view');
  const countEl = document.getElementById('bookshelf-count');

  if (countEl) countEl.textContent = state.readings.length;
  if (!shelfContainer) return;

  if (state.readings.length === 0) {
    shelfContainer.innerHTML = `<div style="color:rgba(255,255,255,0.7); text-align:center; width:100%;">아직 책장이 비어있어요. 나만의 첫 책을 채워보세요!</div>`;
    return;
  }

  shelfContainer.innerHTML = state.readings.map((b, idx) => {
    const bgColor = BOOK_COLORS[idx % BOOK_COLORS.length];
    const height = 100 + (b.title.length * 3 % 40);
    return `
      <div class="book-spine" style="background-color: ${bgColor}; height: ${height}px;" onclick="openBookModal(${b.id})" title="${b.title} (${b.author})">
        ${b.isRecommended ? '💖 ' : ''}${b.title}
      </div>
    `;
  }).join('');
}

function renderReadingHistoryList() {
  const listEl = document.getElementById('reading-history-list');
  if (!listEl) return;

  if (state.readings.length === 0) {
    listEl.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">등록된 독서 기록이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = state.readings.map(b => `
    <div class="history-item book-item" onclick="openBookModal(${b.id})" style="cursor:pointer;">
      <div class="history-main-info">
        <h4>📖 ${b.title} ${b.isRecommended ? '<span style="color:#FF4081; font-size:12px;">💖 추천함</span>' : ''}</h4>
        <p>${b.author} | ${b.startDate}${b.endDate && b.endDate !== b.startDate ? ' ~ ' + b.endDate : ''}</p>
      </div>
      <div class="history-side-info">
        <div style="color:#FFD166; font-size:14px;">${'★'.repeat(b.rating)}</div>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteReadingRecord(${b.id})">&times;</button>
      </div>
    </div>
  `).join('');
}

function renderRecommendations() {
  const gridEl = document.getElementById('class-recommend-grid');
  const wallEl = document.getElementById('hall-rec-wall');

  const recList = state.readings.filter(b => b.isRecommended);
  const classmateRecs = MOCK_CLASSMATES.map(c => ({
    title: c.recBook.title,
    author: c.recBook.author,
    quote: c.recBook.quote,
    by: c.name
  }));

  const allRecs = [
    ...recList.map(r => ({ title: r.title, author: r.author, quote: r.quote, by: state.userClass.nickname })),
    ...classmateRecs
  ];

  const html = allRecs.map(item => `
    <div class="rec-item-card">
      <span class="rec-badge">💖</span>
      <h5>${item.title}</h5>
      <p class="rec-author">${item.author}</p>
      <p class="rec-quote">"${item.quote}"</p>
      <p class="rec-by">추천: ${item.by}</p>
    </div>
  `).join('');

  if (gridEl) gridEl.innerHTML = html;
  if (wallEl) wallEl.innerHTML = html;
}

window.deleteReadingRecord = function(id) {
  if (confirm('이 독서 기록을 삭제할까요?')) {
    state.readings = state.readings.filter(b => b.id !== id);
    saveData();
    renderAll();
  }
};

window.openBookModal = function(id) {
  const book = state.readings.find(b => b.id === id);
  if (!book) return;

  document.getElementById('modal-book-title').textContent = book.title;
  document.getElementById('modal-book-author').textContent = `${book.author} 지음 ${book.isRecommended ? '(💖 강력 추천)' : ''}`;
  document.getElementById('modal-book-stars').textContent = '★'.repeat(book.rating);
  document.getElementById('modal-book-dates').textContent = `읽은 기간: ${book.startDate}${book.endDate && book.endDate !== book.startDate ? ' ~ ' + book.endDate : ' (하루 만에 완독)'}`;
  document.getElementById('modal-book-quote').textContent = `"${book.quote}"`;

  document.getElementById('book-modal').classList.add('active');
};

function closeModal() {
  document.getElementById('book-modal').classList.remove('active');
}

// 명예의 전당 (이달의 독서 누적 & 오늘의 줄넘기 갯수)
function renderHallOfFame(readCount, jumpCount, jumpTotalSum, beanStage, butterflyStage) {
  // 현재 년월 (YYYY-MM) 계산
  const now = new Date();
  const currentYM = now.toISOString().substring(0, 7); // '2026-08'
  const currentMonthNum = now.getMonth() + 1; // 8

  // 1) 📅 독서 명예의 전당 (이달의 월별 누적 책 수 기준)
  // 나의 이번 달 읽은 책 수 계산
  const myMonthlyReadCount = state.readings.filter(b => b.startDate && b.startDate.substring(0, 7) === currentYM).length;

  // 카드 타이틀에 현재 월 표시
  const titleEl = document.getElementById('monthly-reading-title');
  if (titleEl) titleEl.textContent = `📅 ${currentMonthNum}월의 우리반 다독왕 랭킹 TOP 5`;

  const classmatesRead = MOCK_CLASSMATES.map(c => ({ name: c.name, count: c.monthlyRead, isMe: false }));
  classmatesRead.push({ name: `${state.userClass.nickname} (나)`, count: myMonthlyReadCount, isMe: true });
  
  // 이번 달 독서 권수 내림차순 정렬
  classmatesRead.sort((a, b) => b.count - a.count);

  const rLeaderboard = document.getElementById('reading-leaderboard-list');
  if (rLeaderboard) {
    rLeaderboard.innerHTML = classmatesRead.slice(0, 5).map((item, idx) => {
      const rankNum = idx + 1;
      let medal = `${rankNum}등`;
      if (rankNum === 1) medal = '🥇 1등';
      else if (rankNum === 2) medal = '🥈 2등';
      else if (rankNum === 3) medal = '🥉 3등';

      return `
        <div class="leaderboard-item rank-${rankNum} ${item.isMe ? 'is-me' : ''}">
          <div class="rank-badge-box">
            <span class="rank-num">${medal}</span>
            <span class="rank-name">${item.name}</span>
          </div>
          <strong class="rank-score">${item.count} 권</strong>
        </div>
      `;
    }).join('');
  }

  // 이달의 학급 독서 평균 연산
  const totalReadSum = classmatesRead.reduce((acc, c) => acc + c.count, 0);
  const readAvg = (totalReadSum / classmatesRead.length).toFixed(1);

  document.getElementById('reading-class-avg').textContent = `${readAvg} 권`;
  document.getElementById('reading-my-val').textContent = `${myMonthlyReadCount} 권`;

  const readDiff = (myMonthlyReadCount - readAvg).toFixed(1);
  const readCheerEl = document.getElementById('reading-compare-cheer');
  if (readCheerEl) {
    if (readDiff >= 0) {
      readCheerEl.textContent = `👏 와우! ${currentMonthNum}월 우리반 평균보다 ${readDiff}권이나 더 읽었어요!`;
    } else {
      readCheerEl.textContent = `💪 이번 달 우리반 평균까지 ${Math.abs(readDiff)}권 남았어요! 새로운 마음으로 도전해봐요!`;
    }
  }

  // 2) 🏃 줄넘기 명예의 전당 (오늘의 총 갯수 기준)
  const myTodayJump = state.jumpRopes.length > 0 ? state.jumpRopes[state.jumpRopes.length - 1].total : 0;
  const classmatesJump = MOCK_CLASSMATES.map(c => ({ name: c.name, score: c.todayJump, isMe: false }));
  classmatesJump.push({ name: `${state.userClass.nickname} (나)`, score: myTodayJump, isMe: true });

  classmatesJump.sort((a, b) => b.score - a.score);

  const jLeaderboard = document.getElementById('jump-leaderboard-list');
  if (jLeaderboard) {
    jLeaderboard.innerHTML = classmatesJump.slice(0, 5).map((item, idx) => {
      const rankNum = idx + 1;
      let medal = `${rankNum}등`;
      if (rankNum === 1) medal = '🥇 1등';
      else if (rankNum === 2) medal = '🥈 2등';
      else if (rankNum === 3) medal = '🥉 3등';

      return `
        <div class="leaderboard-item rank-${rankNum} ${item.isMe ? 'is-me' : ''}">
          <div class="rank-badge-box">
            <span class="rank-num">${medal}</span>
            <span class="rank-name">${item.name}</span>
          </div>
          <strong class="rank-score">${item.score} 회</strong>
        </div>
      `;
    }).join('');
  }

  const totalJumpSum = classmatesJump.reduce((acc, c) => acc + c.score, 0);
  const jumpAvg = Math.round(totalJumpSum / classmatesJump.length);

  document.getElementById('jump-class-avg').textContent = `${jumpAvg} 회`;
  document.getElementById('jump-my-today').textContent = `${myTodayJump} 회`;

  const jumpDiff = myTodayJump - jumpAvg;
  const jumpCheerEl = document.getElementById('jump-compare-cheer');
  if (jumpCheerEl) {
    if (jumpDiff >= 0) {
      jumpCheerEl.textContent = `⚡ 훌륭해요! 오늘 우리반 평균보다 ${jumpDiff}개나 더 뛰었어요!`;
    } else {
      jumpCheerEl.textContent = `🏃 오늘 우리반 평균까지 ${Math.abs(jumpDiff)}개 남았어요! 신나게 뛰어봐요!`;
    }
  }

  // 뱃지 컬렉션
  const rBadgeGrid = document.getElementById('reading-badge-grid');
  if (rBadgeGrid) {
    rBadgeGrid.innerHTML = READING_BADGES.map(b => {
      const isUnlocked = b.check(state.readings);
      return `
        <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
          <span class="badge-icon">${b.icon}</span>
          <div class="badge-name">${b.name}</div>
          <div class="badge-condition">${b.condition}</div>
        </div>
      `;
    }).join('');
  }

  const jBadgeGrid = document.getElementById('jump-badge-grid');
  if (jBadgeGrid) {
    jBadgeGrid.innerHTML = JUMP_BADGES.map(b => {
      const isUnlocked = b.check(state.jumpRopes);
      return `
        <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
          <span class="badge-icon">${b.icon}</span>
          <div class="badge-name">${b.name}</div>
          <div class="badge-condition">${b.condition}</div>
        </div>
      `;
    }).join('');
  }
}

function renderCertificate(readCount, jumpTotalSum, beanStage, butterflyStage) {
  document.getElementById('cert-book-val').textContent = `${readCount} 권`;
  document.getElementById('cert-jump-val').textContent = `${jumpTotalSum} 회`;

  const maxJumpRecord = state.jumpRopes.reduce((max, curr) => curr.total > max ? curr.total : max, 0);
  document.getElementById('cert-max-val').textContent = `${maxJumpRecord} 회`;

  document.getElementById('cert-bean-icon').textContent = beanStage.icon;
  document.getElementById('cert-bean-text').textContent = `${beanStage.name} (누적 독서 ${readCount}권)`;

  document.getElementById('cert-butterfly-icon').textContent = butterflyStage.icon;
  document.getElementById('cert-butterfly-text').textContent = `${butterflyStage.name} (줄넘기 ${state.jumpRopes.length}회 기록)`;

  let cheerMsg = "";
  if (readCount >= 5 && jumpTotalSum >= 200) {
    cheerMsg = `"와우! 책도 쑥쑥 읽고 줄넘기도 열정적으로 시도하며 몸과 마음이 완벽한 조화를 이루고 있군요! 강낭콩 꼬투리가 맺히고 배추흰나비가 날개를 크게 펼치듯, 당신의 꿈도 더욱 환하게 빛날 것입니다! 축하해요!"`;
  } else if (readCount >= 3 || jumpTotalSum >= 100) {
    cheerMsg = `"독서로 넓은 세상을 만나고, 줄넘기로 몸을 활기차게 움직이는 모습이 참 대견합니다! 조금씩 꾸준히 노력하는 당신은 매일 멋지게 자라나는 강낭콩과 예쁜 애벌레 같습니다. 계속해서 응원해요!"`;
  } else {
    cheerMsg = `"독서와 줄넘기를 시작하는 소중한 발걸음을 환영합니다! 작은 강낭콩 씨앗과 작은 알에서 매일 성장하듯, 차근차근 기록을 쌓아가다 보면 언제나 훌륭하고 멋진 나를 만나게 될 것입니다! 힘내세요!"`;
  }

  document.getElementById('cert-cheer-message').textContent = cheerMsg;

  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  document.getElementById('cert-current-date').textContent = dateStr;
}
