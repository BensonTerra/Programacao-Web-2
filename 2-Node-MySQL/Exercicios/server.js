// import module to connect with DB
const connection = require("./connect");
const {
  DATABASE_ERROR,
  RESOURCE_NOT_FOUND,
  INVALID_VERB,
  INVALID_FILTER,
  AUTHOR_NOT_FOUND,
  NO_BODY_DATA,
} = require("./errorHandler");

const http = require("http");
const hostname = process.env.HOST || "127.0.0.1"; // local serverâ€‹
const port = process.env.PORT || 3000; // port to listen to

const server = http.createServer((request, response) => {
  const parsedURL = new URL(request.url, `http://${request.headers.host}`);

  if (parsedURL.pathname == "/authors") {
    // look for HTTP verbs> GET, POST, PUT or DELETE
    if (request.method == "GET") {
      //query the BD with a SELECT statementâ€‹
      connection.query("SELECT * FROM authors", (err, results) => {
        if (err) {
          //set response for DB acess error
          response.writeHead(DATABASE_ERROR.statusCode, {
            "Content-Type": "application/json",
          });
          response.end(JSON.stringify(DATABASE_ERROR.message));
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(results));
      });
      } 
      else if (request.method == "POST") {
        let bodyData = "";
        // grab the data from the request body (it is a stream)
        request.on("data", (chunk) => {
          // data is sent in chunks
          bodyData += chunk;
        });
        request.on("end", () => {
          //end of data retrieval: convert data (JSON string) into an object
          let newAuthor = JSON.parse(bodyData || "{}");

          if (newAuthor.name == undefined || newAuthor.city == undefined) {
            //set response for DB acess error
            response.writeHead(NO_BODY_DATA.statusCode, {
              "Content-Type": "application/json",
            });
            response.end(JSON.stringify(NO_BODY_DATA.message));
            return;
          }

          //query the BD with an INSERT statementâ€‹
          connection.query(
            "INSERT INTO authors SET ?",
            newAuthor,
            (err, results) => {
              if (err) {
                //set response for DB acess error
                response.writeHead(DATABASE_ERROR.statusCode, {
                  "Content-Type": "application/json",
                });
                response.end(JSON.stringify(DATABASE_ERROR.message));
                return;
              }

              response.writeHead(201, { "Content-Type": "application/json" });
              //send back to client the ID of the new authorâ€‹
              response.end(
                JSON.stringify({
                  message: "author successfully inserted",
                  newID: results.insertId,
                })
              );
            }
          );
        });
      } 
      else if (request.method == "PUT") {
        let ID = parsedURL.searchParams.get("id"); //console.log(ID);
        
        if (ID == null) {
          //set response for bad request
          response.writeHead(INVALID_FILTER.statusCode, {
            "Content-Type": "application/json",
          });
          response.end(JSON.stringify(INVALID_FILTER.message));
        }

        let bodyData = "";
        // grab the data from the request body (it is a stream)
        request.on("data", (chunk) => {
          // data is sent in chunks
          bodyData += chunk;
        });
        request.on("end", () => {
          let newAuthor = JSON.parse(bodyData || "{}");
          if (newAuthor.name == undefined || newAuthor.city == undefined) {
            //set response for DB acess error
            response.writeHead(NO_BODY_DATA.statusCode, {
              "Content-Type": "application/json",
            });
            response.end(JSON.stringify(NO_BODY_DATA.message));
            return;
          }
          //query the BD with an UPDATE statementâ€‹
          connection.query(
            "UPDATE authors SET name = ?, city = ? WHERE id = ?",
            [newAuthor.name, newAuthor.city, ID],
            function (err, results) {
              if (err) {
                //set response for DB acess error
                response.writeHead(DATABASE_ERROR.statusCode, {
                  "Content-Type": "application/json",
                });
                response.end(JSON.stringify(DATABASE_ERROR.message));
              }
              if (results.affectedRows == 1) {
                // DB responds with # of authors affected by UPDATE
                response.statusCode = 204;
                response.end(
                  JSON.stringify({
                    message: "author successfully updated",
                  })
                );
                return;
              } else {
                //set response for AUTHOR not found
                response.writeHead(AUTHOR_NOT_FOUND.statusCode, {
                  "Content-Type": "application/json",
                });
                response.end(JSON.stringify(AUTHOR_NOT_FOUND.message));
              }
            }
          );
        });
      } 
      else if (request.method == "DELETE") {
        let ID = parsedURL.searchParams.get("id");
        if (ID == null) {
          //set response for bad request
          response.writeHead(INVALID_FILTER.statusCode, {
            "Content-Type": "application/json",
          });
          response.end(JSON.stringify(INVALID_FILTER.message));
        }

        //query the BD with an INSERT statementâ€‹
        connection.query(
          "DELETE FROM authors WHERE id = ?",
          [ID],
          function (err, results) {
            if (err) {
              //set response for DB acess error
              response.writeHead(DATABASE_ERROR.statusCode, {
                "Content-Type": "application/json",
              });
              response.end(JSON.stringify(DATABASE_ERROR.message));
            }

            if (results.affectedRows == 1) {
              response.statusCode = 204;
              response.end(
                JSON.stringify({ message: "author successfully deleted" })
              );
            } else {
              //set response for AUTHOR not found
              response.writeHead(AUTHOR_NOT_FOUND.statusCode, {
                "Content-Type": "application/json",
              });
              response.end(JSON.stringify(AUTHOR_NOT_FOUND.message));
            }
          }
        );
      } 
    else {
      //set response for invalid VERB
      response.writeHead(INVALID_VERB.statusCode, {
        "Content-Type": "application/json",
      });
      response.end(JSON.stringify(INVALID_VERB.message));
    }
  } 
  else {
    //set response for invalid other invalid requests
    response.writeHead(RESOURCE_NOT_FOUND.statusCode, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify(RESOURCE_NOT_FOUND.message));
  }
});

//  listen for any incoming requestsâ€‹
server.listen(port, hostname, () => {
  // print message in server terminalâ€‹
  console.log(`Node server running on http://${hostname}:${port}/`);
});
