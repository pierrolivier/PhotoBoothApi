//Dependencies
var express = require('express');
var router = express.Router();
var phantom = require ('phantom');
var fs = require('fs');

//Routes
router.get('/screenshot/:url', function(req, res){
    var url = decodeURIComponent(req.params.url);
    console.log('Requested url - ' + url);
    var startTime = new Date();
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.get('settings.userAgent', function(data) {
                page.set('viewportSize', {width:800, height:600});
                page.set('settings.userAgent', data + ' Photob:\ooth (+https://github.com/Onefootball/PhotoBoothApi.git)');
                page.open(url, function (status) {
                    console.log("opened url? ", status);
                    page.renderBase64('png', function (data) {
                        console.log("Image fetched...sending response...");
                        ph.exit();
                        var endTime = new Date();
                        var img = new Buffer(data, 'base64');
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });
                        res.end(img);
                        var endTime = new Date();
                        var timeSpent = (endTime - startTime)/1000;
                        console.log("Time spent - " + timeSpent + " s");
                        var logLine = "Url: " + url + ", Time spent: " + timeSpent + "s;\n";
                        fs.appendFile('photobooth.txt', logLine, function (err) {
                          if (err) {
                              console.log(error);
                          };
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
