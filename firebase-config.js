/* ==========================================
   매일 쑥쑥 멋진 나 - Firebase Auth & Firestore 연동 모듈
   Firebase Web SDK v10 (Modular Version)
   ========================================== */

// Firebase 프로젝트 설정 객체
// 💡 실제 배포 시 본인의 Firebase 콘솔 설정값으로 교체하거나 환경변수를 활용할 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyDemoConfigKeyForGrowingMeApp2026",
  authDomain: "growing-me-app.firebaseapp.com",
  projectId: "growing-me-app",
  storageBucket: "growing-me-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo1234567890"
};

// CDN 전역 Firebase SDK 참조 준비
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let googleProvider = null;

// Firebase 초기화 함수
function initFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore();
      googleProvider = new firebase.auth.GoogleAuthProvider();
      console.log("🔥 Firebase가 성공적으로 연결되었습니다!");
      return true;
    } catch (e) {
      console.warn("⚠️ Firebase 초기화 중 참고사항 (데모 모드):", e.message);
      return false;
    }
  }
  return false;
}
