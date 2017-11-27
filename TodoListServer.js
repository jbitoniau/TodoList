'use strict';

var http = require('http');
var https = require('https');
var url = require('url');
//var querystring = require('querystring');
var fs = require('fs');
// var websocket = require('websocket'); // don't forget to run "npm install websocket"


/*
    TodoListServer
*/
function TodoListServer() {
    // Create HTTP server
    this._httpServer = http.createServer(function(req, res) {
        var path = url.parse(req.url).pathname;
        var query = url.parse(req.url).query;
        if (path.indexOf('/') === 0) {
            var filename = path.substr(1);
            if (filename.length === 0) {
                filename = 'TodoList.html';
            }
            TodoListServer._serveFile(filename, res);
        } else {
            TodoListServer._createHTMLErrorResponse(res, 404, 'Page not found');
        }
    });
    this._httpServer.listen(8080, function() {
        console.log('HTTP server listening');
    });
}

TodoListServer.prototype.dispose = function() {
    // Stop things here!
    console.log('dispose to implement here...');
};

TodoListServer._getFilenameExtension = function(filename) {
    var parts = filename.split('.');
    if (parts.length > 1) {
        return parts[parts.length - 1];
    }
    return '';
};

TodoListServer._getFileContentType = function(filename) {
    var contentType = null;
    var extension = TodoListServer._getFilenameExtension(filename).toLowerCase();
    switch (extension) {
        case 'html':
            return 'text/html';
        case 'js':
            return 'application/javascript';
    }
    return null;
};

TodoListServer._serveFile = function(filename, res) {
    var contentType = TodoListServer._getFileContentType(filename);
    if (!contentType) {
        console.warn('Serving file: ' + filename + '. Unsupported file/content type');
        res.end();
        return;
    }
    console.log('Serving file: ' + filename + ' as ' + contentType);

    filename = 'Client/' + filename;

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            TodoListServer._createHTMLErrorResponse(res, 500, err);
        } else {
            res.writeHead(200, { 'content-type': contentType });
            res.write(data);
            res.end();
        }
    });
};

TodoListServer._createHTMLErrorResponse = function(res, code, message) {
    res.writeHead(code, { 'content-type': 'text/html' });
    res.write(
        '<!DOCTYPE html>' +
            '<html>' +
            '    <head>' +
            '        <meta charset="utf-8" />' +
            '        <title>Error</title>' +
            '    </head>' +
            '    <body>' +
            '       <p>' +
            message +
            '</p>' +
            '    </body>' +
            '</html>'
    );
    res.end();
};

/*
    Main
*/
function Main() {
    var todoListServer = new TodoListServer();

    //http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js/14861513#14861513
    //http://stackoverflow.com/questions/6958780/quitting-node-js-gracefully
    if (process.platform === 'win32') {
        var rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('SIGINT', function() {
            process.emit('SIGINT');
        });
    }
    process.on('SIGINT', function() {
        console.log('Stopping server...');
        todoListServer.dispose();
        process.exit();
    });
}

Main();
