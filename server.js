const http = require('http')
const fs = require('fs')
const mongodb_connect = require('./mongodb-connect')
const port = process.env.PORT || 3000;

(async function() {
    try {
        await mongodb_connect.init();
        // console.log(mongodb_connect)
        const app = require('./app')
        const server = http.createServer(app);
        server.listen(port);
    } catch (err) {
        console.log(err)
    }
})()