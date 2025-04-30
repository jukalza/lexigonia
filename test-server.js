const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.send("Server is working!");
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});