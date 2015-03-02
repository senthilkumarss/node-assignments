var http = require('http');
//var fs = require('fs');
var path = require('path');
var mime = require('mime');
formidable = require('formidable');
var util = require('util');
var fs   = require('fs-extra');
var io = require('socket.io').listen(server);


function sendFileNotFound(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    console.log("inside sendFile : "+ fileContents);
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serveStatic(response,absPath) {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        sendFileNotFound(response);

                    } else {
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                console.log("resource not found");
                sendFileNotFound(response);
            }
        });
}


function fileUpload(req, res){
    console.log("inside fileUpload");
    var form = new formidable.IncomingForm();
    console.log("Parsing..");
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.end(files.upload.name + ' was successfully uploaded.');
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        var completed = (bytesReceived / bytesExpected) * 100;
        console.log("Upload Completed %: ", completed.toFixed(2), "%");
    });

    form.on('end', function(fields, files) {
        var tempPath = this.openedFiles[0].path;
        var fileName = this.openedFiles[0].name;
        var newLocation = './Uploaded/';

        fs.copy(tempPath, newLocation + fileName, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Saved the file : "+ fileName);
            }
        });
    });
}

var server = http.createServer(function(req, res) {
    // Simple path-based request dispatcher
    var filePath = false;
    switch (req.url) {
        case '/':
            filePath = 'public/index.html';
            console.log("req.url :" + req.url);
            serveStatic(res, './' + filePath);
            break;
        case '/upload':
            fileUpload(req,res);
            break;
        default:
            console.log("req.url :" + req.url);
            serveStatic(res, 'public' + req.url);
            break;
          }
});


server.listen(5190, function() {
    console.log("Server listening on port 5190.");
});
