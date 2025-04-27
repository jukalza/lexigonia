import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


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
const db = getFirestore(firebaseApp);
// connectAuthEmulator(auth, "http://localhost:9099");

export { auth };

document.addEventListener("DOMContentLoaded", () => {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    const signupBtn = document.getElementById("signupBtn");
    const loginBtn = document.getElementById("loginBtn");


    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in: " + user.email);
        } else {
            console.log("Not logged in");
        }

    });


    // sign up
    signupBtn.addEventListener("click", async () => {

        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
            const user = userCred.user;

            console.log("Signed up: " + user.email);

            const { value: username } = await Swal.fire({
                title: "Choose a Username",
                input: "text",
                inputLabel: "Username",
                inputPlaceholder: "Enter your username",
                showCancelButton: false,
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to write a username!";
                    } else if (value.length < 3) {
                        return "Username must be at least 3 characters!";
                    } else if (value.length > 10) {
                        return "Username must be less than 10 characters!";
                    }
                }
            });

            // await fetch("http://localhost:3001/user", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({
            //     firebase_uid: user.uid,
            //     name: user.displayName || "No Name",
            //     email: user.email
            //     })
            // });

            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: user.email,
                uid: user.uid,
                created_at: new Date()
            });

            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Account created",
                showConfirmButton: false,
                timer: 1500,
                didOpen: () => {
                    Swal.showLoading();
                  },
                }).then(() => {
                  window.location.href = "home.html";
                });
        } catch (error) {
            console.log("Signup error: " + error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessages(error)
            });
        }
    });


    // login
    loginBtn.addEventListener("click", async () => {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        try {
            const userCred = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
            console.log("Logged in: " + userCred.user.email);
            Swal.fire({
                icon: "success",
                title: "Login successful!",
                showConfirmButton: false,
                timer: 1500,
                didOpen: () => {
                    Swal.showLoading();
                  },
                }).then(() => {
                  window.location.href = "home.html";
                });
        } catch (error) {
            console.log("Login error: " + error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessages(error)
            });
        }
    });

});


function errorMessages (error) {
    const errorCode = error.code;

    const messages = {
        "auth/invalid-email" : "Email address is invalid.",
        "auth/invalid-password" : "Invalid Password. Must be at least 6 characters.",
        "auth/user-not-found" : "No account found with that email.",
        "auth/wrong-password" : "Incorrect Password. Try again.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/email-already-in-use" : "An account already exists with this email.",
        "auth/missing-password" : "Please enter a password.",
        "auth/missing-email" : "Please enter an email.",
        "auth/password-does-not-meet-requirements" : "Password must be at least 6 characters, contain at least 1 Uppercase, 1 lowercase and 1 number! ",
        "auth/invalid-credential" : "The login info does not match any account."
    };

    return messages[errorCode] || "Something went wrong. Try again.";
}

