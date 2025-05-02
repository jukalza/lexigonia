import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { loadNavbar } from "./navbar.mjs";

const firebaseConfig = {
    apiKey: "AIzaSyCRVOC-CPPY6gJ0M1VPrqonMLUfvoCmeOQ",
    authDomain: "lexigonia.firebaseapp.com",
    projectId: "lexigonia",
    appId: "1:944448872367:web:77a6b3f228cb0f4243d95a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {

    loadNavbar();

    const searchBtn = document.getElementById("searchBtn");
    const searchSection = document.getElementById("search-section");
    const resultsDiv = document.getElementById("results");
    const paginationContainer = document.getElementById("pagination");
    const loading = document.getElementById("loading");
    const errorContainer = document.getElementById("error-container");

    let currentPage = 1;
    let currentQuery = "";
    const resultsPerPage = 12;

    // to store last successful state
    let lastQuery = ""; // store the last query
    let lastPage = 1;   // store the last page number
    

    function updateURL(query, page) {
        const url = new URL(window.location.href);
        url.searchParams.set("q", query);
        url.searchParams.set("page", page);
        window.history.pushState({}, "", url);
    }

    searchBtn.addEventListener("click", () => {
        currentPage = 1;
        currentQuery = document.getElementById("searchInput").value.trim();
        searchBooks(currentQuery, currentPage);
    });

    document.getElementById("searchInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); 
            searchBtn.click(); // search button click
        }
    });

    async function searchBooks(query, page) {

        updateURL(query, page);

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

            const response = await fetch(`/search?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${resultsPerPage}`);

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

                // bookDiv.addEventListener("click", () => {
                //     window.location.href = `book.html?id=${book.id}`;
                // });
                bookDiv.addEventListener("click", () => {
                    const queryParams = new URLSearchParams({
                        id: book.id,
                        q: currentQuery,
                        page: currentPage
                    });
                    window.location.href = `book.html?${queryParams.toString()}`;
                });
                
                // create image element
                const img = document.createElement("img");
                img.src = thumbnail;
                img.alt = "Book cover";
                bookDiv.appendChild(img);
            
                // create title element
                const h3 = document.createElement("h3");
                h3.textContent = title;
                h3.classList.add("book-title");
                bookDiv.appendChild(h3);
            
                // create authors paragraph
                const p = document.createElement("p");
                p.classList.add("book-author");
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

    // handle query from URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");
    const pageParam = parseInt(urlParams.get("page"), 10) || 1;

    if (queryParam) {
        document.getElementById("searchInput").value = queryParam;
        currentQuery = queryParam;
        currentPage = pageParam;
        searchBooks(queryParam, pageParam);
    }

    // onAuthStateChanged(auth, (user) => {
    //     const dashboardLink = document.getElementById("dashboard-link");
    //     const authActions = document.getElementById("auth-actions");

    //     if (user) {
    //       // Authenticated: allow dashboard + logout
    //       dashboardLink.href = "dashboard.html";
      
    //       authActions.innerHTML = `
    //         <button id="logout-btn">Logout</button>
    //       `;
      
    //       document.getElementById("logout-btn").addEventListener("click", () => {
    //         signOut(auth).then(() => {
    //           window.location.href = "auth.html";
    //         });
    //       });
      
    //     } else {
    //       // Not authenticated: redirect dashboard & show login
    //       dashboardLink.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         window.location.href = "auth.html";
    //       });
      
    //       authActions.innerHTML = `
    //         <a href="auth.html" class="nav-link">Login</a>
    //       `;
    //     }
    //   });

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