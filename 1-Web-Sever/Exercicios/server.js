// import Node.js core module HTTP
const http = require('http');

const HOST = process.env.HOSTNAME || 'localhost' // local server
const PORT = process.env.PORT || 3000; // determine the port to listen to by checking the PORT variable first and providing it with a default value, if undefined

// create a web server instance
const server = http.createServer((request, response) => {
    const { method, url, headers } = request; // gets the client request properties
    const host = headers['host']; // extracts the host header from request
    console.log(method, url, host);

    //consider a request with a query ?file=string
    const parse_q = new URL(request.url, `http://${request.headers.host}`);
    console.log(parse_q.searchParams.get('teste')); //outputs 'teste'
    

    response.statusCode = 200 // set HTTP status code for OK - SUCCESS
    response.setHeader('Content-Type', 'text/html'); //set HTTP response header parameters
    if(url == "/node")
    {
        response.end("<h1>Hello World via NODE</h1>"); // send a response back to client, adding thecontent as an argument

    }
    else
    {
        response.end("<h1>Hello Strange via NODE</h1>"); // send a response back to client, adding thecontent as an argument
    }
});

// listen for any incoming requests
server.listen(PORT, HOST, () => {
    // print message in server terminal
    console.log(`Node server running on http://${HOST}:${PORT}/`);
});