import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs, getDoc, addDoc, orderBy} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { loadNavbar } from "./navbar.js";


const firebaseConfig = {
    apiKey: "AIzaSyCRVOC-CPPY6gJ0M1VPrqonMLUfvoCmeOQ",
    authDomain: "lexigonia.firebaseapp.com",
    projectId: "lexigonia",
    appId: "1:944448872367:web:77a6b3f228cb0f4243d95a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


document.addEventListener("DOMContentLoaded", async function () {

    loadNavbar();

    const container = document.getElementById("book-detail-container");
    const loading = document.getElementById("loading");
    const reviewSection = document.getElementById("review-section");

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");
    

    if (!bookId) {
        container.textContent = "Book ID is missing.";
        return;
    }

    loading.style.display = "block";

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        if (!response.ok) throw new Error("Failed to fetch book");

        const data = await response.json();
        const info = data.volumeInfo;


        document.getElementById("book-title").textContent = info.title || "No Title";
        document.getElementById("book-authors").textContent = `by ${info.authors?.join(", ") || "Unknown Author"}`;
        document.getElementById("book-thumbnail").src = info.imageLinks?.thumbnail || "./images/placeholder_img.png";
        
        const descriptionElement = document.getElementById("book-description");
        descriptionElement.innerHTML = info.description || "<p>No description available.</p>";

        document.getElementById("book-published").textContent = info.publishedDate || "Unknown";
        document.getElementById("book-categories").textContent = info.categories?.join(", ") || "N/A";
        document.getElementById("book-rating").textContent = info.averageRating ?? "Not rated";


        // Preview Link (if available)
        if (info.previewLink) {
            const preview = document.createElement("a");
            preview.href = info.previewLink;
            preview.target = "_blank";
            preview.textContent = "Preview this book";
            document.getElementById("book-preview").appendChild(preview);
        }

        // Back link setup
        const backLink = document.getElementById("back-link");
        if (backLink) {
            const q = urlParams.get("q");
            const page = urlParams.get("page");

            console.log("q:", q, "page:", page);

            if (q && page) {
                backLink.href = `home.html?q=${encodeURIComponent(q)}&page=${page}`;
            } else if (document.referrer && document.referrer.includes("home.html")) {
                backLink.href = document.referrer;
            } else {
                backLink.href = "home.html";
            }
        }


        onAuthStateChanged(auth, (user) => {

            const collectionButtons = document.querySelectorAll('.collection-option');

            if (!user) {
                collectionButtons.forEach(btn => {
                    btn.disabled = true;
                    btn.textContent = "Login to Add";
                });
                // hide review section when not logged in
                reviewSection.style.display = "none";
                return;
            }

            reviewSection.style.display = "block";

            const types = ["want_to_read", "have_read", "currently_reading"];

            collectionButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const selectedType = button.getAttribute('data-type');
                    button.disabled = true;
        
                    try {

                        let alreadyInList = null;

                        for (const type of types) {
                            const colRef = collection(db, "users", user.uid, type);
                            const q = query(colRef, where("bookId", "==", bookId));
                            const snapshot = await getDocs(q);

                            if (!snapshot.empty) {
                            alreadyInList = type;
                            break;
                            }
                        }

                        if (alreadyInList) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Already Added',
                                text: `This book is already in your "${alreadyInList.replace(/_/g, " ")}" list.`,
                                confirmButtonText: 'OK'
                            });
                            return;
                        }

                        const bookRef = doc(collection(db, "users", user.uid, selectedType));
                        await setDoc(bookRef, {
                            title: info.title || "No Title",
                            authors: info.authors || [],
                            thumbnail: info.imageLinks?.thumbnail || "",
                            bookId: bookId,
                            added_at: new Date()
                        });

                        Swal.fire({
                            icon: 'success',
                            title: 'Book Added!',
                            text: `Added to your "${selectedType.replace(/_/g, " ")}" list.`,
                            showConfirmButton: false,
                            timer: 1500,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });
        
                        // button.textContent = "Added!";
                    } catch (err) {
                        console.error("Error saving to Firestore:", err);
                        button.disabled = false;
                        button.textContent = "Try Again";
                    }
                });
            });
        
             
        });


        // handle review submission
        document.getElementById("review-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const rating = document.getElementById("rating").value;
            const reviewText = document.getElementById("review-text").value;
            const user = auth.currentUser;

            if (user) {
                try {

                    // Fetch the user's username
                    const userRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userRef);

                    let username = "Anonymous"; // default username if not found

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        username = userData.username || "Anonymous"; 
                    }

                    const reviewsRef = collection(db, "books", bookId, "reviews");
                    await addDoc(reviewsRef, {
                        rating: parseInt(rating),
                        reviewText,
                        username,
                        timestamp: new Date()
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Review Submitted!',
                        text: 'Thank you for your review!',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    // reload reviews after submission
                    loadReviews();

                    // CLEAR INPUTS
                    document.getElementById("rating").value = '';
                    document.getElementById("review-text").value = '';

                } catch (error) {
                    console.error("Error adding review:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong. Please try again later.'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Not Logged In',
                    text: 'You need to be logged in to leave a review.'
                });
            }
        });

        // allow "Enter" press to submit form
        document.getElementById("review-form").addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); 
                document.getElementById("review-form").requestSubmit();
            }
        });

        // load reviews for book
        async function loadReviews() {
            const reviewsContainer = document.getElementById("reviews");
            reviewsContainer.innerHTML = ''; 

            const reviewsRef = collection(db, "books", bookId, "reviews");
            const q = query(reviewsRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                reviewsContainer.innerHTML = "<p>No reviews yet. Be the first to leave one!</p>";
                return;
            }

            querySnapshot.forEach(doc => {
                const reviewData = doc.data();
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review");

                reviewElement.innerHTML = `
                    <h4>${reviewData.username}</h4>
                    <p>Rating: ${reviewData.rating}/5</p>
                    <p>${reviewData.reviewText || "No review text."}</p>
                    <p><small>Reviewed on: ${new Date(reviewData.timestamp.seconds * 1000).toLocaleString()}</small></p>
                `;

                reviewsContainer.appendChild(reviewElement);
            });
        }
      
        loadReviews();


    } catch (err) {
        container.innerHTML = "<p>Something went wrong. Could not load book details.</p>";
        console.error(err);
    }

    loading.style.display = "none";

});