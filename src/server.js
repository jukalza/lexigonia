require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');


const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;


app.use(cors());

app.get('/search', (req, res) => {
    console.log("Query parameters:", req.query);
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(400).send({error: "Query parameter is required!"});
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=10`;


    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (dataPiece) => {
            data += dataPiece;
        });

        apiRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (error) {
                res.status(500).json({ error: 'Invalid response from Google Books API' });
            }
        });
    }).on('error', (err) => {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: 'Failed to fetch book details' });
    });

    // useful for debugging
    console.log("Requesting URL:", url);
})

// just for testing
app.get('/test', (req, res) => {
    res.send("Server is working!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


