function start_html_server() {
    const http = require('http');
    const fs = require('fs');

    const hostname = '0.0.0.0';
    const port = 8080;

    const server = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        const html = fs.readFileSync('./index.html', 'utf8');
        response.write(html);
        response.end();
    });

    server.listen(port, hostname, () => {
        console.log("Server running at http://web-a74953b7c-c58a.docode.fi.qwasar.io");
        console.log("Replace a74953b7c-c58a by your current workspace ID");
        console.log("(look at the URL of this page and http://web-a74953b7c-c58a.docode.fi.qwasar.io, a74953b7c-c58a is your workspace ID and fi is your zone)");
    });
}

start_html_server();