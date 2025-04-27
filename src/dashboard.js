import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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

loadNavbar();

async function renderCollection(user, col) {

    const colRef = collection(db, "users", user.uid, col.name);
    const container = document.getElementById(col.id);

        try {
        const snapshot = await getDocs(colRef);

        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `<p>No books in this list.</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const book = doc.data();

            const bookItem = document.createElement("div");
            bookItem.classList.add("book-card");

            // Make book card clickable to view details
            bookItem.addEventListener("click", (e) => {
                if (!e.target.classList.contains("remove-btn") && !e.target.classList.contains("move-btn")) {
                    window.location.href = `book.html?id=${book.bookId}`;
                }
            });

            bookItem.innerHTML = `
            <img src="${book.thumbnail || './images/placeholder_img.png'}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p class="author-name">${book.authors}</p>
            <div class="book-actions">
                <button class="move-btn" data-doc="${doc.id}" data-collection="${col.name}" data-bookid="${book.bookId}" data-title="${book.title}" data-authors='${JSON.stringify(book.authors)}' data-thumbnail="${book.thumbnail}">Move</button>
                <button class="remove-btn" data-doc="${doc.id}" data-collection="${col.name}">Remove</button>
            </div>
            `;

            container.appendChild(bookItem);
        });

        } catch (error) {
        console.error(`Error fetching books from ${col.name}:`, error);
        container.innerHTML = `<p>Error loading your ${col.name.replace(/_/g, " ")} books.</p>`;
        }
    
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    // fetch and display the username
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const username = userData.username || "User";

        // display the username in the heading
        const usernameHeading = document.getElementById("username-heading");
        if (usernameHeading) {
            usernameHeading.textContent = `Welcome, ${username}!`;
        }
    }

    const collections = [
        { id: "want-to-read-list", name: "want_to_read" },
        { id: "currently-reading-list", name: "currently_reading" },
        { id: "have-read-list", name: "have_read" }
    ];

    // Initial render
    for (const col of collections) {
        await renderCollection(user, col);
    }
    
    // event listener for move and remove buttons
    document.body.addEventListener("click", async (e) => {
        const target = e.target;

        // Remove handler
        if (target.classList.contains("remove-btn")) {
            const docId = target.getAttribute("data-doc");
            const collectionName = target.getAttribute("data-collection");

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This book will be removed from your list.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, remove it!'
            });

            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "users", user.uid, collectionName, docId));
                    await renderCollection(user, collections.find(c => c.name === collectionName));
        
                    Swal.fire(
                        'Removed!',
                        'The book has been removed.',
                        'success'
                    );
                } catch (err) {
                    console.error("Failed to delete:", err);
                    Swal.fire(
                        'Error!',
                        'Could not remove the book. Try again.',
                        'error'
                    );
                }
            }

        }

        // Move handler
        if (target.classList.contains("move-btn")) {
            const currentCollection = target.getAttribute("data-collection");
            const docId = target.getAttribute("data-doc");

            const bookId = target.getAttribute("data-bookid");
            const title = target.getAttribute("data-title");
            const authors = JSON.parse(target.getAttribute("data-authors"));
            const thumbnail = target.getAttribute("data-thumbnail");

            const options = {
                want_to_read: "Want to Read",
                currently_reading: "Currently Reading",
                have_read: "Have Read"
            };

            const choices = Object.keys(options).filter(opt => opt !== currentCollection);
            const { value: newList } = await Swal.fire({
                title: "Move book to...",
                input: "select",
                inputOptions: choices.reduce((obj, key) => {
                    obj[key] = options[key];
                    return obj;
                }, {}),
                inputPlaceholder: "Select a list",
                showCancelButton: true
                });

            if (newList) {
                try {
                // Remove from current
                await deleteDoc(doc(db, "users", user.uid, currentCollection, docId));

                // Add to new
                const newDocRef = doc(collection(db, "users", user.uid, newList));
                await setDoc(newDocRef, {
                    title,
                    authors,
                    thumbnail,
                    bookId,
                    added_at: new Date()
                });

                await renderCollection(user, collections.find(c => c.name === currentCollection)); // re-render current
                await renderCollection(user, collections.find(c => c.name === newList)); // re-render new list

                Swal.fire("Moved!", `Book moved to ${newList.replace(/_/g, " ")}.`, "success");

        } catch (err) {
          console.error("Move failed:", err);
          Swal.fire("Error", "Could not move book. Try again.", "error");
        }
      }
    }
  });

  const logoutButton = document.getElementById("logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await auth.signOut();
            window.location.href = "auth.html";
        } catch (error) {
            console.error("Logout error:", error);
            Swal.fire("Error", "Failed to logout. Try again.", "error");
        }
    });
  }

        
});