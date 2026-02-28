import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 YOUR FIREBASE CONFIG (already correct)
const firebaseConfig = {
  apiKey: "AIzaSyDDc8peb4i19Rku8smgr5BwLxt0WMB9Gjw",
  authDomain: "flood-rescue-guide-ac3a8.firebaseapp.com",
  projectId: "flood-rescue-guide-ac3a8",
  storageBucket: "flood-rescue-guide-ac3a8.firebasestorage.app",
  messagingSenderId: "635830559756",
  appId: "1:635830559756:web:cf886a96ac8b16f47dba29",
  measurementId: "G-B8PWHJCJXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { db };

// 🔹 RESET PASSWORD FUNCTION
window.resetPassword = function () {
    const email = document.getElementById("resetEmail").value;
    const message = document.getElementById("resetMessage");

    if (!email) {
        message.style.color = "red";
        message.innerText = "Please enter your email.";
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            message.style.color = "green";
            message.innerText = "Password reset link sent to your email.";
        })
        .catch((error) => {
            message.style.color = "red";
            message.innerText = error.message;
        });
        

        
};
