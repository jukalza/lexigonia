require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const { db } = require("./firebaseAdmin");


const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;


app.use(cors());
app.use(express.json());

app.get('/search', (req, res) => {
    console.log("Query parameters:", req.query);
    const searchQuery = req.query.q;
    const startIndex = req.query.startIndex || 0;
    const maxResults = req.query.maxResults || 10;

    if (!searchQuery) {
        return res.status(400).send({error: "Query parameter is required!"});
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;


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

app.post("/user", async (req, res) => {
    const { firebase_uid, name, email } = req.body;
  
    if (!firebase_uid || !email) {
      return res.status(400).json({ error: "firebase_uid and email are required" });
    }
  
    const userRef = db.collection("users").doc(firebase_uid);
  
    try {
      const doc = await userRef.get();
  
      if (doc.exists) {
        return res.status(200).json({ message: "User already exists", user: doc.data() });
      }
  
      await userRef.set({
        name: name || "No Name",
        email,
        created_at: new Date().toISOString(),
      });
  
      res.status(201).json({ message: "User created" });
    } catch (err) {
      console.error("Firestore error:", err);
      res.status(500).json({ error: "Error creating user" });
    }
});

// just for testing
app.get('/test', (req, res) => {
    res.send("Server is working!");
});

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;

