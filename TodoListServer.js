'use strict';

var http = require('http');
var https = require('https');
var url = require('url');
//var querystring = require('querystring');
var fs = require('fs');
// var websocket = require('websocket'); // don't forget to run "npm install websocket"


var MongoClient = require('mongodb').MongoClient;
var MongoObjectID = require("mongodb").ObjectID;

/*
    TodoListServer
*/
function TodoListServer() {
    // Create HTTP server
    this._httpServer = http.createServer(function(req, res) {
        var path = url.parse(req.url).pathname;
        var query = url.parse(req.url).query;

        if ( path==='/test') {
            TodoListServer.forwardApiCall( 'kantree.io', '/api/1.0/projects/18efe2bc-zeproject/board', null, null, res );
        } else if (path.indexOf('/') === 0) {
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

TodoListServer.forwardApiCall = function( host, path, query, auth, res )
{
    var fullPath = path;
    if ( query ) {
        fullPath = '?' + query;
    }
    var username = '?????????????';
    var passw = '?????????????';
    var options = {
        hostname: host,
        path: fullPath,
        auth: new Buffer(username + ':' + passw).toString('base64')
    };

    var callback = function(response) 
        {
            console.log('statusCode:', response.statusCode);
            console.log('headers:', response.headers);
            var str = '';
            response.on('data', function (chunk) 
                {
                    //console.log("data=" + chunk);
                    str += chunk;
                }); 

            response.on('end', 
                function() 
                {
                    console.log("END");
                    res.writeHead(200, {"content-type": "application/json"});
                    res.write(str);
                    res.end();
                });
        };

    var req = https.request(options, callback);

    req.on('error', 
        function(err) 
        {
            console.log("ERROR: " + err);
            createHTMLErrorResponse( res, 500, err );
        });

    req.end();
};


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
        TodoListServer._createHTMLErrorResponse(res, 500, 'Unsupported file/content type');
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

    // Test MongoDB: https://zestedesavoir.com/tutoriels/312/debuter-avec-mongodb-pour-node-js/
    MongoClient.connect("mongodb://localhost/TodoList", function(error, db) {
        if (error) throw error;
        console.log("Connected to db");

        db.collection("tasks").find().toArray( function (error, results) {
            if (error) throw error;
            for ( var i=0; i<results.length; i++ ) {
                var task = results[i];
                console.log("task '" + task.name + "' ID:" + task._id );
            }
        });         

        // Get one object by id
        var idToFind = "5a1c13a42245f0dc2a9d72c4";      
        var objToFind = { _id: new MongoObjectID(idToFind) }; 
        db.collection("tasks").findOne(objToFind, function(error, result) {
            if (error) throw error;
            var task = result;
            console.log("FOUND BY ID: task '" + task.name + "' ID:" + task._id );
        });

        // Insert doc
        var objNew = { name: "BlaBloBli!" };  
        db.collection("tasks").insert(objNew, null, function (error, result) {
            if (error) throw error;
            console.log("Added task " + JSON.stringify(result));  
            
            var idToRemove = result.insertedIds[0];

            // Remove it after a while
            setTimeout( function() {
                    console.log("Removing..." + idToRemove);
                    var objToRemove = { _id: new MongoObjectID(idToRemove) };
                    db.collection("tasks").remove(objToRemove, null, function(error, result) {
                        if (error) throw error;   
                        console.log("REMOVED! " + JSON.stringify(result)); 
                    });
                }, 5000 );

        });

    });

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
