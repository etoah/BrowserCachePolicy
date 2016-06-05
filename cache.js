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



        fs.stat(realPath, function (err, stat) {

            var lastModified = stat.mtime.toUTCString();

            var ifModifiedSince = "If-Modified-Since".toLowerCase();

            response.setHeader("Last-Modified", lastModified);


            fs.readFile(realPath, 'binary', function (err, file) {   // 为了使代码简单，这是里与stat是串行读取,  同时与后面的next读取了文件两次可以优化
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                    return response.end(err);
                } else {
                    var hash = crypto.createHash('md5').update(file).digest('base64');
                    response.setHeader("Etag", hash);
                    if (
                        (request.headers['if-none-match'] && request.headers['if-none-match'] === hash)
                        // ||
                        // (request.headers[ifModifiedSince] && new Date(lastModified) <= new Date(request.headers[ifModifiedSince]))
                    ) {
                        response.writeHead(304, "Not Modified");
                        response.end();
                        return;
                    }
                    else {
                        next();
                    }
                }
            });



        })





    }
}