require('dotenv').config();         // read environment variables from .env file
const express = require('express');
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// capture body parsing errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).json({ success: false, message: `Error parsing body data (${error.message})` });
    } else {
        next();
    }
});

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- TUTORIALS api' });
});

// routing middleware (mounted on /tutorials route)
app.use('/tutorials', require('./routes/tutorials.routes.js'))

// handle invalid routes
app.all('*', function (req, res) {
    res.status(404).json({ message: 'WHAT???' });
})


app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
