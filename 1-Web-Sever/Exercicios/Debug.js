//const clear = require('clear'); clear()

const http = require('http');

let EX = process.argv.slice(2)
const {getRandomColor,getAllColors} = require('./EX1.js');
const {calc} = require('./EX2.js');
const {calculoDiferenca} = require('./EX3.js');
//const {} = require('./EX4.js');
console.log(EX)

if(EX[0] == "EX1")
{
  getRandomColor(); getAllColors(); //console.log() 
}
else if(EX[0] == "EX2")
{
  let data = EX.slice(1);
  calc(data)
}
else if(EX[0] == "EX3")
{
  const HOST = process.env.HOSTNAME || 'localhost' // local server
  const PORT = process.env.PORT || 3000; // determine the port to listen to by checking the PORT variable first and providing it with a default value, if undefined

  // create a web server instance
  const server = http.createServer((request, response) => 
  {
    const { method, url, headers } = request; // gets the client request properties
    const host = headers['host']; // extracts the host header from request
    console.log(method, url, host);

    //consider a request with a query ?file=string
    const parse_q = new URL(request.url, `http://${request.headers.host}`);
    //console.log(parse_q.searchParams.get()); //outputs 'teste'
    
    let datas = calculoDiferenca()

    response.statusCode = 200 // set HTTP status code for OK - SUCCESS
    response.setHeader('Content-Type', 'text/html'); //set HTTP response header parameters

    datas.forEach( data => 
    {
      //console.table(data)
      response.write(`<h1>Dias para ${data.nome}: ${data.diferenca} dias</h1>`)
    })

    /*
    if(url == "/node")
    {
      response.end("<h1>Hello World via NODE</h1>"); // send a response back to client, adding thecontent as an argument

    }
    else
    {
      response.end("<h1>Hello Strange via NODE</h1>"); // send a response back to client, adding thecontent as an argument
    }
    */
    response.end()
  });

  // listen for any incoming requests
  server.listen(PORT, HOST, () => 
  {
    // print message in server terminal
    console.log(`Node server running on http://${HOST}:${PORT}/`);
  });
}
else
{
  console.log("ERROR")
}










