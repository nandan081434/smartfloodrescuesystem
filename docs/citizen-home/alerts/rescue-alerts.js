import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../../css/js/firebase-auth.js";

/* ================================
   🔥 REALTIME ALERT LISTENER
================================ */

const alertsList = document.getElementById("alertsList");

const alertsQuery = query(
  collection(db, "alerts"),
  orderBy("timestamp", "desc")
);

onSnapshot(alertsQuery, (snapshot) => {

  alertsList.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();
    const alertId = docSnap.id;

    // Default status if missing
    const status = data.status || "active";

    const card = document.createElement("div");
    card.classList.add("alert-card");

    // Emergency glow
    if (data.type === "emergency" && status === "active") {
      card.classList.add("emergency");
    }

    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.message}</p>

      <span class="status ${status}">
        ${status.toUpperCase()}
      </span>

      ${
        status === "active"
          ? `<button class="resolve-btn" data-id="${alertId}">
               Mark Resolved
             </button>`
          : ""
      }
    `;

    alertsList.appendChild(card);
  });

  /* ================================
     ✅ RESOLVE BUTTON LOGIC
  ================================ */

  document.querySelectorAll(".resolve-btn").forEach(btn => {
    btn.addEventListener("click", async () => {

      const id = btn.getAttribute("data-id");

      try {
        await updateDoc(doc(db, "alerts", id), {
          status: "resolved"
        });
      } catch (error) {
        console.error("Resolve Error:", error);
        alert("Error updating alert.");
      }

    });
  });

});

/* ================================
   🚨 SEND ALERT BUTTON
================================ */

const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {

  const title = document.getElementById("title").value.trim();
  const message = document.getElementById("message").value.trim();
  const type = document.getElementById("type").value;

  if (!title || !message) {
    alert("Please fill all fields");
    return;
  }

  try {

    await addDoc(collection(db, "alerts"), {
      title: title,
      message: message,
      type: type,
      status: "active",
      timestamp: serverTimestamp()
    });

    // Clear fields
    document.getElementById("title").value = "";
    document.getElementById("message").value = "";

  } catch (error) {
    console.error("FULL ERROR:", error);
    alert("Firestore error: " + error.message);
  }

});

console.log("🔥 Rescue Alerts System Ready");