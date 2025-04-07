document.addEventListener("DOMContentLoaded", function () {

    const searchBtn = document.getElementById("searchBtn");
    const searchSection = document.getElementById("search-section");
    const resultsDiv = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const loading = document.getElementById("loading");
    const errorContainer = document.getElementById("error-container");

    let currentPage = 1;
    let currentQuery = "";
    const resultsPerPage = 12;

    // Variables to store last successful state
    let lastQuery = ""; // To store the last query
    let lastPage = 1;   // To store the last page number

    searchBtn.addEventListener("click", () => {
        currentPage = 1;
        currentQuery = document.getElementById("searchInput").value.trim();
        searchBooks(currentQuery, currentPage);
    });

    async function searchBooks(query, page) {

        const startIndex = (page - 1) * resultsPerPage;

        errorContainer.style.display = "none";
        errorContainer.innerHTML = "";
        resultsDiv.innerHTML = "";
        paginationContainer.innerHTML = "";

        // clear previous results
        // while (resultsDiv.firstChild) {
        //     resultsDiv.removeChild(resultsDiv.firstChild);
        // }

        if (!query) {
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
            // while (resultsDiv.firstChild) {
            //     resultsDiv.removeChild(resultsDiv.firstChild);
            // }

            const response = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${resultsPerPage}`);

            // check for HTTP response status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            loading.style.display = "none";

            // Clear previous results
            // while (resultsDiv.firstChild) {
            //     resultsDiv.removeChild(resultsDiv.firstChild);
            // }

            // Log the output of data.totalItems and data.items.length
            console.log("Total items:", data.totalItems);
            console.log("Items returned:", data.items.length);

            if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
                // loading.style.display = "none";
                resultsDiv.textContent = "No results found";
                // const messageNoResults = document.createElement("p");
                // messageNoResults.textContent = "No results found";
                // resultsDiv.appendChild(messageNoResults);
                return;
            }

            // Filter out any undefined or invalid items
            // const validItems = data.items.filter(book => book.volumeInfo);

            // Handle case where valid items are empty
            // if (validItems.length === 0) {
            //     resultsDiv.textContent = "No valid results found.";
            //     return;
            // }

            // Store the last successful state
            lastQuery = query;
            lastPage = page;


            data.items.forEach(book => {
                const info = book.volumeInfo;
                const title = info.title || "No Title";
                const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
                const thumbnail = info.imageLinks ? info.imageLinks.thumbnail : "./images/placeholder_img.png";
            
                const bookDiv = document.createElement("div");
                bookDiv.classList.add("book");

                bookDiv.addEventListener("click", () => {
                    window.location.href = `book.html?id=${book.id}`;
                });
                
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
    
            // Handle Pagination
            const cappedTotalItems = Math.min(data.totalItems, 1000);
            const totalPages = Math.ceil(cappedTotalItems / resultsPerPage); // Calculate total pages

            // Ensure currentPage doesn't exceed totalPages
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }

            // Limit buttons to show only 5 at a time
            const pageLimit = 5;
            const startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2)); // Starting page number
            const endPage = Math.min(startPage + pageLimit - 1, totalPages); // Ending page number

            // Adjust startPage if too close to the end
            if (endPage - startPage < pageLimit - 1) {
                startPage = Math.max(1, endPage - pageLimit + 1);
            }

            // Create page number buttons
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement("button");
                pageBtn.textContent = i;
                pageBtn.classList.add("page-btn");
                if (i === currentPage) {
                    pageBtn.classList.add("active");
                }

                pageBtn.addEventListener("click", () => {
                    // Don't try to load beyond API's result cap
                    const startIndex = (i - 1) * resultsPerPage;
                    if (startIndex >= cappedTotalItems) return;

                    currentPage = i; // Set current page
                    searchBooks(currentQuery, currentPage); // Fetch new page results
                });

                paginationContainer.appendChild(pageBtn);
            }

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

            // If an error occurs, we can allow going back to the last results if needed.
            if (lastQuery && lastPage) {
                const retryButton = document.createElement("button");
                retryButton.textContent = "Retry Last Search";
                retryButton.classList.add("retry-btn");
                retryButton.addEventListener("click", () => {
                    searchBooks(lastQuery, lastPage); // Retry the last successful search
                });

                resultsDiv.appendChild(retryButton);
            }

        } finally {
            loading.style.display = "none";
        }
    }


});


// // Hide loading
// loading.style.display = "none";

// data.items.forEach(book => {
//     const info = book.volumeInfo;
//     const title = info.title || "No Title";
//     const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
//     const thumbnail = info.imageLinks ? info.imageLinks.thumbnail : "./images/placeholder_img.png";

//     const bookDiv = document.createElement("div");
//     bookDiv.classList.add("book");
    
//     // create image element
//     const img = document.createElement("img");
//     img.src = thumbnail;
//     img.alt = "Book cover";
//     bookDiv.appendChild(img);

//     // create title element
//     const h3 = document.createElement("h3");
//     h3.textContent = title;
//     bookDiv.appendChild(h3);

//     // create authors paragraph
//     const p = document.createElement("p");
//     const strong = document.createElement("strong");
//     strong.textContent = "Author(s): ";
//     p.appendChild(strong);
//     p.appendChild(document.createTextNode(authors));
//     bookDiv.appendChild(p);


//     resultsDiv.appendChild(bookDiv);
// });