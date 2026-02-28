/* ===============================
   PROFILE PAGE SCRIPT
   Smart Flood Rescue System
   FINAL VERSION (FIRESTORE)
================================ */

/* ===============================
   🔥 FIREBASE IMPORTS
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   🔥 FIREBASE CONFIG (SAME AS OTHERS)
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyDDc8peb4i19Rku8smgr5BwLxt0WMB9Gjw",
  authDomain: "flood-rescue-guide-ac3a8.firebaseapp.com",
  projectId: "flood-rescue-guide-ac3a8",
  storageBucket: "flood-rescue-guide-ac3a8.appspot.com",
  messagingSenderId: "635830559756",
  appId: "1:635830559756:web:xxxxxx"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ===============================
   ✅ ADD ONLY: WAIT FOR DOM READY
================================ */
window.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     🔐 LOAD PROFILE FROM FIRESTORE
  ================================ */
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn("User not logged in");
      window.location.href = "../login.html";
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        alert("Profile data not found in database");
        return;
      }

      const data = snap.data();

      // Fill UI (NO UI CHANGE)
      document.getElementById("userName").innerText =
        data.name || "Citizen User";

      document.getElementById("userEmail").innerText =
        data.email || user.email;

      document.getElementById("userPhone").innerText =
        data.phone || "----------";

      document.getElementById("userRole").innerText =
        data.role || "Citizen";

      document.getElementById("userLocation").innerText =
        data.location || "---";

    } catch (err) {
      console.error("Profile load error:", err);
    }
  });

});

/* ===============================
   🔙 GO BACK TO HOME
================================ */
window.goHome = function () {
  window.location.href = "home.html";
};

/* ===============================
   🚪 LOGOUT FUNCTION
================================ */
window.logout = async function () {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  await signOut(auth);
  alert("Logged out successfully");
  window.location.href = "../login.html";
};

/* ===============================
   UI + UX ENHANCEMENTS (KEPT)
================================ */

// Smooth fade-in effect
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.4s ease";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 50);
});

// Debug safety check
setTimeout(() => {
  const requiredIds = [
    "userName",
    "userEmail",
    "userPhone",
    "userRole",
    "userLocation"
  ];

  requiredIds.forEach(id => {
    if (!document.getElementById(id)) {
      console.warn(`Profile element missing: #${id}`);
    }
  });
}, 500);
