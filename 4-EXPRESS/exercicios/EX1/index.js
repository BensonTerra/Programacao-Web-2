// import Express
const express = require('express');
const app = express();
const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

// sets the server response to a GET request on URL “/”
app.get('/', (req, res) => {
    res.send('<html><body><h1>Hello World</h1></body></html>');
})
app.get('/Teste', (req, res) => {
    res.send('<html><body><h1>Teste de route</h1></body></html>');
})
// server creation and listening for any incoming requests
app.listen(port, hostname, (error) => {
console.log(`App listening at http://${hostname}:${port}/`)
})