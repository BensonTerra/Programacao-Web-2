const mysql = require("mysql");

//Node.js MySQL database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "newuser",
  password: "newpass",
  database: "bookstore"
});
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Server!");
});

module.exports = connection;
