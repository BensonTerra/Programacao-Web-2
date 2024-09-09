require('dotenv').config();         // read environment variables from .env file
const express = require('express'); 
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;	 	
const host = process.env.HOST;

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- TUTORIALS api' });
});

// routing middleware

app.use('/tutorials', require('./routes/tutorials.routes.js'))
app.use('/tags', require('./routes/tags.routes.js'))
app.use('/users', require('./routes/users.routes.js'))


// routing Recurso
app.use('/books', require('./routes/recursoRoutes/books.routes.js'))
app.use('/booksGenres', require('./routes/recursoRoutes/booksGenres.route.js'))
app.use('/genres', require('./routes/recursoRoutes/genres.routes.js'))
app.use('/instances', require('./routes/recursoRoutes/instances.route.js'))

// handle invalid routes
app.all('*', function (req, res) {
	res.status(400).json({ error: `The API does not recognize the request on ${req.url}` });
})

app.use((err, req, res, next) => {
    const errorStatus = err.statusCode || 500;
    const errorMessage = err.message || "Internal server error" + err.stack;
  
    return res.status(errorStatus).json({
      success: false,
      msg: errorMessage,
    });
  });

app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
