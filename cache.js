var config = require("./config.js");
var path = require("path");
var url = require("url");

module.exports = function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : 'unknown';

    if (ext.match(config.Expires.fileMatch)) {

        var expires = new Date();

        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);

        response.setHeader("Expires", expires.toUTCString());
        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

    }
}