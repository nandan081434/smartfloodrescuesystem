import { db } from "../../css/js/firebase-auth.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById("alertsContainer");

async function loadAlerts() {

  container.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "alerts"));

    snapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");
      div.classList.add("alert-card");

      div.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.message}</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <hr>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    alert("Error loading alerts: " + error.message);
  }
}

loadAlerts();