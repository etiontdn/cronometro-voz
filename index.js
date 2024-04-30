const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'docs')));

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(8080, () => {
    console.log("Server successfully running on port 8080");
});