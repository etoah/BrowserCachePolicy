var config = require("./config.js");
var path = require("path");
var url = require("url");
var fs = require("fs");
var crypto = require('crypto');

module.exports = function (request, response, next) {
    var pathname = url.parse(request.url).pathname;
    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : 'unknown';
    var realPath = path.join("assets", pathname);

    if (ext.match(config.Expires.fileMatch)) {

        var expires = new Date();

        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);

        response.setHeader("Expires", expires.toUTCString());
        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

        if (request.headers['if-none-match']) {

            fs.readFile(realPath, 'binary', function (err, file) {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                    return response.end(err);
                } else {
                    var hash = crypto.createHash('md5').update(file).digest('base64');
                    if (request.headers['if-none-match'] === hash) {
                        response.writeHead(304, "Not Modified");
                        response.end();
                        return;
                    }
                    response.writeHead(200, {
                        'Content-Type': 'text/plain',
                        "Etag": hash
                    });

                    response.write(file, "binary");

                    return response.end();
                }
            });
        }
        else {
            fs.stat(realPath, function (err, stat) {

                var lastModified = stat.mtime.toUTCString();

                var ifModifiedSince = "If-Modified-Since".toLowerCase();

                response.setHeader("Last-Modified", lastModified);

                if (request.headers[ifModifiedSince] && new Date(lastModified) <= new Date(request.headers[ifModifiedSince])) {

                    response.writeHead(304, "Not Modified");

                    response.end();

                }
                else {
                    next();
                }
            })
        }




    }
}