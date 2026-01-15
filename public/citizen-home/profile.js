/* ===============================
   PROFILE PAGE SCRIPT
   Smart Flood Rescue System
================================ */

// --------- LOAD USER DATA ---------
window.onload = function () {
  // Get saved user data (from signup / login)
  const user = JSON.parse(localStorage.getItem("floodUser"));

  if (!user) {
    // If no user found, redirect to login
    window.location.href = "../login.html";
    return;
  }

  // Set values to UI
  document.getElementById("userName").innerText =
    user.name || "Citizen User";

  document.getElementById("userEmail").innerText =
    user.email || "email@example.com";

  document.getElementById("userPhone").innerText =
    user.phone || "----------";

  document.getElementById("userRole").innerText =
    user.role || "Citizen";

  document.getElementById("userLocation").innerText =
    user.location || "---";
};

// --------- GO BACK TO HOME ---------
function goHome() {
  window.location.href = "home.html";
}

// --------- LOGOUT FUNCTION ---------
function logout() {
  // Clear stored user session
  localStorage.removeItem("floodUser");

  // Optional confirmation
  alert("Logged out successfully");

  // Redirect to login
  window.location.href = "../login.html";
}
/* ===============================
   UI + UX ENHANCEMENTS (ADD ONLY)
   No existing logic touched
================================ */

// Smooth fade-in effect after data loads
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.4s ease";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 50);
});

// Prevent accidental logout (confirmation)
const originalLogout = logout;
logout = function () {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  originalLogout();
};

// Safety: If profile elements are missing, warn (for debugging)
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
