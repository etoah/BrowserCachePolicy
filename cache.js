var config = require("./config.js");
var path = require("path");
var url = require("url");
var fs = require("fs");

module.exports = function (request, response,next) {
    var pathname = url.parse(request.url).pathname;
    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : 'unknown';
    var realPath = path.join("assets", pathname);

    if (ext.match(config.Expires.fileMatch)) {

        var expires = new Date();

        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);

        response.setHeader("Expires", expires.toUTCString());
        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);


        fs.stat(realPath, function (err, stat) {

            var lastModified = stat.mtime.toUTCString();

            var ifModifiedSince = "If-Modified-Since".toLowerCase();

            response.setHeader("Last-Modified", lastModified);

            if (request.headers[ifModifiedSince] && new Date(lastModified) <= new Date(request.headers[ifModifiedSince])) {

                response.writeHead(304, "Not Modified");

                response.end();

            }
            else{
                next();
            }
        })

    }
}