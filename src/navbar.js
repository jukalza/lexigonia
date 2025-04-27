import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRVOC-CPPY6gJ0M1VPrqonMLUfvoCmeOQ",
    authDomain: "lexigonia.firebaseapp.com",
    projectId: "lexigonia",
    appId: "1:944448872367:web:77a6b3f228cb0f4243d95a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function loadNavbar() {
    const header = document.querySelector("header");

    if (!header) return;

    header.innerHTML = `
        <nav class="navbar">
            <div class="nav-container">

                <a href="home.html" class="nav-logo">
                    <div class="logo-container">
                        <img src="images/Lexigonia2.png" alt="Lexigonia Logo" class="logo-img">
                        <span class="logo-text">Lexigonia</span>
                    </div>
                </a>

                <div class="nav-toggle" id="nav-toggle" aria-label="Toggle Navigation">
                    <img src="images/icons/hamburger.svg" alt="Menu" class="nav-icon">
                </div>

                <ul class="nav-menu" id="nav-menu">
                    <li><a href="home.html">Home</a></li>
                    <li><a href="dashboard.html" id="dashboard-link">Dashboard</a></li>
                    <li><button id="authButton" class="auth-btn">Login</button></li>
                </ul>
            </div>
        </nav>
    `;

    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");

    toggle.addEventListener("click", () => {
        menu.classList.toggle("show");
        const icon = toggle.querySelector("img");
        icon.src = menu.classList.contains("show") ? "images/icons/xmark.svg" : "images/icons/hamburger.svg";
    });

    const authButton = document.getElementById('authButton');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // user is logged in
      authButton.textContent = "Logout";
      authButton.onclick = async () => {
        try {
          await auth.signOut();
          console.log("Logged out");
          Swal.fire({
            icon: "success",
            title: "Logged out!",
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            window.location.href = "home.html";
          });
        } catch (error) {
          console.error("Error signing out:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Logout failed. Try again."
          });
        }
      };
    } else {
      // user is not logged in
      authButton.textContent = "Login";
      authButton.onclick = () => {
        window.location.href = "auth.html";
      };
    }
  });

}