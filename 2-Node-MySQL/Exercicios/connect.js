const mysql = require("mysql");

//Node.js MySQL database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "BensonTerra",
  password: "BensonTerraPass",
  database: "bookstore"
});
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Server!");
});

module.exports = connection;
