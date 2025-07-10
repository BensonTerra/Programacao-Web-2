const clear = require('clear');
const express = require('express');

// read environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT;	// use environment variables
const host = process.env.HOST;


app.use(express.json());

// middleware for ALL routes
app.use((req, res, next) => {
    clear()
    const start = Date.now();
    res.on("finish", () => { // finish event is emitted once the response is sent to the client
        const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
        //console.log(`Request: ${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})


// use route middleware for /posts requests
app.use('/posts', require('./routes/posts.routes.js'));

// use route middleware for /users requests
app.use('/users', require('./routes/users.routes.js'));

//handle invalid routes (404)    
app.use((req, res, next) => {
    res.status(404).json({ message: `The requested resource was not found: ${req.method} ${req.originalUrl}`});
});


// error middleware (always at the end of the file)
app.use((err, req, res, next) => {
    // !Uncomment this line to log the error details to the server console!
    console.error(err); 

    // error thrown by express.json() middleware when the request body is not valid JSON
    if (err.type === 'entity.parse.failed')
        return res.status(400).json({ error: 'Invalid JSON payload! Check if your body data is a valid JSON.' });

    // Mongoose validation errors (ALL models)
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: Object.keys(err.errors).map(key => ({
                field: key,
                message: err.errors[key].message
            }))
        });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false, msg: "ID parameter is not a valid ObjectId (it must be must be a single String of 12 bytes or a string of 24 hex characters)"
        });
    }

    // other errors
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}/`);
});