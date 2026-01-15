// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 YOUR FIREBASE CONFIG (already correct)
const firebaseConfig = {
    apiKey: "AIzaSyBAPHcdSk9WQYFTZjefEkJTYXpLoDZ6Bg",
    authDomain: "flood-rescue-app-1cba1.firebaseapp.com",
    projectId: "flood-rescue-app-1cba1",
    storageBucket: "flood-rescue-app-1cba1.appspot.com",
    messagingSenderId: "213864775528",
    appId: "1:213864775528:web:56c931dee8cf759324a0dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
