document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("searchBtn").addEventListener("click", searchBooks);

    async function searchBooks() {
        const searchQuery = document.getElementById("searchInput").value.trim();
        const searchSection = document.getElementById("search-section");
        const resultsDiv = document.getElementById("results");
        const loading = document.getElementById("loading");
        const errorContainer = document.getElementById("error-container");


        errorContainer.style.display = "none";
        errorContainer.innerHTML = "";

        // clear previous results
        while (resultsDiv.firstChild) {
            resultsDiv.removeChild(resultsDiv.firstChild);
        }

        if (!searchQuery.trim()) {
            const noQueryMsg = document.createElement("p");
            noQueryMsg.textContent = "Please enter a book title!";
            errorContainer.appendChild(noQueryMsg);
            errorContainer.style.display = "block";
            return
        }


         // Show spinner and move search bar
        loading.style.display = "block";
        searchSection.classList.add("moved-up");


        try {

            // clear previous results
            while (resultsDiv.firstChild) {
                resultsDiv.removeChild(resultsDiv.firstChild);
            }

            const response = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(searchQuery)}`);

            // check for HTTP response status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Clear previous results
            while (resultsDiv.firstChild) {
                resultsDiv.removeChild(resultsDiv.firstChild);
            }

            if (!data.items || data.totalItems === 0) {
                loading.style.display = "none";
                resultsDiv.textContent = "";
                const messageNoResults = document.createElement("p");
                messageNoResults.textContent = "No results found";
                resultsDiv.appendChild(messageNoResults);
                return;
            }

            // Hide loading
            loading.style.display = "none";

            data.items.forEach(book => {
                const info = book.volumeInfo;
                const title = info.title || "No Title";
                const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
                const thumbnail = info.imageLinks ? info.imageLinks.thumbnail : "./images/placeholder_img.png";
    
                const bookDiv = document.createElement("div");
                bookDiv.classList.add("book");
                
                // create image element
                const img = document.createElement("img");
                img.src = thumbnail;
                img.alt = "Book cover";
                bookDiv.appendChild(img);
    
                // create title element
                const h3 = document.createElement("h3");
                h3.textContent = title;
                bookDiv.appendChild(h3);
    
                // create authors paragraph
                const p = document.createElement("p");
                const strong = document.createElement("strong");
                strong.textContent = "Author(s): ";
                p.appendChild(strong);
                p.appendChild(document.createTextNode(authors));
                bookDiv.appendChild(p);
    
    
                resultsDiv.appendChild(bookDiv);
            });

        } catch (error){
            console.error("Error fetching books:", error);

            // Clear previous results
            while (resultsDiv.firstChild) {
                resultsDiv.removeChild(resultsDiv.firstChild);
            }

            // ONLY show error message if no results message is not already shown
            const existingMsg = resultsDiv.querySelector("p");
            if (!existingMsg || existingMsg.textContent !== "No results found") {
                const messageErrorFetch = document.createElement("p");
                messageErrorFetch.textContent = "Something went wrong. Try again later.";
                resultsDiv.appendChild(messageErrorFetch);
            }

        } finally {
            loading.style.display = "none";
        }
    }
});