//Dependencies
var express = require('express');
var router = express.Router();
var urlUtil = require('url');
var imageService = require('../service/imageService');
//Routes


const CONTENT_TYPES = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif'
};

// Function catches all requests to /screenshot/* and makes sure url passed in is encoded
// 1) /screenshoot/http://www.google.com ==> /screenshot/http%3A%2F%2Fwww.google.com
// 2) /screenshoot/http%3A%2F%2Fwww.google.com ==> /screenshot/http%3A%2F%2Fwww.google.com
router.get('/screenshot/*', function (req, res, next) {
    var base = '/screenshot/';
    var url = req.url.replace(base, '');
    if (url.match(/:\//)) {
        var encodedUrl = encodeURIComponent(url);
        req.url = base + encodedUrl;
    }
    next('route');
});

// Route where we take a screenshot. It expects :url to be encoded
// Otherwise this route will be missed
router.get('/screenshot/:url', function (req, res) {

    //first get url that is passed in as param
    var url = decodeURIComponent(req.params.url);
    //get url params - of current url
    var url_parts = urlUtil.parse(req.url, true);
    var query = url_parts.query;

    var contentType = (function (format) {
        if (!format || !CONTENT_TYPES[format.toLowerCase()]) {
            return CONTENT_TYPES['jpeg'];
        }
        return CONTENT_TYPES[format.toLowerCase()];
    } (query.format));

    imageService.fetchScreenshot(url, query).then(function (data) {
        var img = new Buffer(data, 'base64');
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': img.length
        });
        res.end(img);
    }).catch(function (error) {
        res.status(error.status).send(error.msg);
    });
});

module.exports = router;
