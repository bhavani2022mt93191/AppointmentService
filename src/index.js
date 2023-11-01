const http = require('http');
const app = require('./services');
require("dotenv").config();
const port = process.env.BOOKING_SERVICE_PORT || 3004

console.log("port: ", port )

//App.js contains the code to process the http request and send the response
const server = http.createServer(app);

server.listen(port, () => { 
    console.log(`Server running at ${port}`); 
});