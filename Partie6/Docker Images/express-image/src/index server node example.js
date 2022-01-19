const http = require('http');

const server = http.createServer((request, response) => {
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'];

    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
    }).on('error', (err) => {
        // This prints the error message and stack trace to `stderr`.
        console.error(err.stack);
    }).listen(8080);

    //response.statusCode = 404;
    //response.setHeader('Content-Type', 'application/json');
    response.writeHead(200, {
        'Content-Type': 'application/json',
    });

    const responseBody = { headers, method, url, body };

    response.end(JSON.stringify(responseBody));

    /*response.write('<html>');
    response.write('<body>');
    response.write('<h1>Hello, World!</h1>');
    response.write('</body>');
    response.write('</html>');
    response.end();
    or response.end('<html><body><h1>Hello, World!</h1></body></html>');*/

});
