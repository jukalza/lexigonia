import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyCRVOC-CPPY6gJ0M1VPrqonMLUfvoCmeOQ",
    authDomain: "lexigonia.firebaseapp.com",
    projectId: "lexigonia",
    storageBucket: "lexigonia.firebasestorage.app",
    messagingSenderId: "944448872367",
    appId: "1:944448872367:web:77a6b3f228cb0f4243d95a",
    measurementId: "G-R2Z5VJFR9H"
});

const auth = getAuth(firebaseApp);
connectAuthEmulator(auth, "http://localhost:9099");


document.addEventListener("DOMContentLoaded", () => {

    const status = document.getElementById("status");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");


    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in: " + user.email);
            status.textContent = `Logged in as: ${user.email}`;

            // show logout button, hide login and signup buttons
            logoutBtn.style.display = "block";
            loginBtn.style.display = "none";
            signupBtn.style.display = "none";

            // later dev: show user dashboard, search, or user collections
        } else {
            console.log("Not logged in");
            status.textContent = "Not logged in";

            // hide logout button, show signup and login buttons
            logoutBtn.style.display = "none";
            loginBtn.style.display = "block";
            signupBtn.style.display = "block";

            // later dev: show login form
        }

    });


    // sign up
    signupBtn.addEventListener("click", async () => {

        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
            console.log("Signed up: " + userCred.user.email);
            alert("Account created successfully!");
        } catch (error) {
            console.log("Signup error: " + error.message);
            alert(error.message);
        }
    });


    // login
    loginBtn.addEventListener("click", async () => {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
            console.log("Logged in: " + userCred.user.email);
            alert("Login successful!");
        } catch (error) {
            console.log("Login error: " + error.message);
            alert(error.message);
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
        
            try {
                await auth.signOut();
                console.log("Logged out");
                alert("Logged out!");
            } catch (error) {
                console.log("Logout error: " + error.message);
                alert(error.message);
            }
        });
    }

});

