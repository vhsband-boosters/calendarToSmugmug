var https = require('https');
 
/**
 * HOW TO Make an HTTP Call - GET
 */
// options for GET
var optionsget = {
    host : 'www.smugmug.com', // here only the domain name (no http/https !)
    port : 443,
    path : '/api/v2/node/jS5QG5!children?APIKey=YOUR_KEY',
    method : 'GET', // do GET
    headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
    }
};
 
console.info('Using following options:');
console.info(optionsget);
// console.info('Do the GET call');
 
// do the GET request
var reqGet = https.request(optionsget, function(res) {
    console.log("statusCode: ", res.statusCode);
    // uncomment it for header details
    // console.log("headers: ", res.headers);
 
 
    res.on('data', function(d) {
        console.info('GET result:\n');
        process.stdout.write(d);
        console.info('\n\nCall completed');
    });
 
});
 
reqGet.end();
reqGet.on('error', function(e) {
    console.error(e);
});