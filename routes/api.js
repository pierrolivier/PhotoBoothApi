//Dependencies
var express = require('express');
var router = express.Router();
var phantomService = require('../service/phantomJs');

//Routes

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
    phantomService.screenshot(req, res);
});

module.exports = router;
