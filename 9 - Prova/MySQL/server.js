require('dotenv').config();         
const express = require('express'); 
const cors = require('cors');       
const clear = require('clear');

const app = express();
const port = process.env.PORT;	 	
const host = process.env.HOST;

app.use(cors());
app.use(express.json()); 

app.get('/', function (req, res) {
    res.status(200).json({ message: 'REST Api - Pessoal' });
});

app.use('/users',  require('./routes/users.routes.js'))

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

clear()
app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
