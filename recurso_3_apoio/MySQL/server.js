const express = require('express');

// set environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT;	// use environment variables
const host = process.env.HOST;


app.use(express.json());

// use route middleware for /users requests
app.use('/users', require('./routes/users.routes.js'));
app.use('/projects', require('./routes/projects.routes.js'));

app.listen(port, () => {
    console.log(`App listening at http://${host}:${port}/`);
});