document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("book-detail-container");
    const loading = document.getElementById("loading");

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


    } catch (err) {
        container.innerHTML = "<p>Something went wrong. Could not load book details.</p>";
        console.error(err);
    }

    loading.style.display = "none";


});