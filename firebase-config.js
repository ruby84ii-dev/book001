/* ==========================================
   매일 쑥쑥 멋진 나 - Firebase Auth & Firestore 연동 모듈
   Firebase Web SDK v10 (Compat Version for Web Browsers)
   ========================================== */

// 발급받으신 실제 Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyAoM94pfj5NVrVc0Oa2R1WaZUFw-vnjkyY",
  authDomain: "book-181b1.firebaseapp.com",
  projectId: "book-181b1",
  storageBucket: "book-181b1.firebasestorage.app",
  messagingSenderId: "472387327992",
  appId: "1:472387327992:web:37eeca6328f2ba63d4280d",
  measurementId: "G-BV75DWV75M"
};

// CDN 전역 Firebase SDK 참조
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
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      console.log("🔥 Firebase에 성공적으로 연결되었습니다! (Project ID: book-181b1)");
      return true;
    } catch (e) {
      console.warn("⚠️ Firebase 초기화 에러:", e.message);
      return false;
    }
  }
  return false;
}
