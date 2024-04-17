const mysql = require('mysql');

//Node.js MySQL database connection 
const connection = mysql.createConnection({
    host: 'pw2.joaoferreira.eu',
    user: 'teresaterroso_pw2_user',
    password: 'Eq&ls9ImiVZ_',
    database: 'teresaterroso_pw2' 
});

connection.connect((err) => {
    if (err) throw err;
    // print success message
    console.log('Connected to MySQL Server!');
});

module.exports = connection; 
