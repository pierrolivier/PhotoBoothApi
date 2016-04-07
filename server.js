//Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var path = require('path');
var config = require('./config/config');

//Express
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//declare static folder
app.use(express.static(path.join(__dirname + '/public')));

//log request stats
app.use(responseTime(function (req, res, time) {

    var skipper = function (value, excludeValuesArray) {
        if (value === undefined) {
            return false;
        }
        if (excludeValuesArray === undefined) {
            return false;
        }
        return excludeValuesArray.reduce(function (shouldSkip, currentValue) {
            return shouldSkip || value.includes(currentValue);
        }, false);
    };

    var skipThisRequest = false;
    if (config.logger && config.logger.skip) {
        var headers = Object.keys(config.logger.skip.headers);
        skipThisRequest = headers.reduce(function (shouldSkipThisRequest, headerNameToSkip) {
            var valueToSkip = config.logger.skip.headers[headerNameToSkip];
            if (valueToSkip === '*') {
                return shouldSkipThisRequest || req.headers[headerNameToSkip] !== undefined;
            }
            var containsValuesToSkip = skipper(req.headers[headerNameToSkip], valueToSkip);
            return shouldSkipThisRequest || containsValuesToSkip;
        }, false);
    }
    if (!skipThisRequest) {
        console.log('=======STATS=======');
        console.log('User agent: ' + req.headers['user-agent']);
        console.log('Referrer: ' + req.headers['referer']);
        console.log('Url: ' + req.url);
        console.log('Response status code: ' + res.statusCode);
        console.log('Time spent: ' + time + ' ms');
        console.log('All headers: ' + JSON.stringify(req.headers, null, 2));
        console.log('Timestamp: ' + new Date());
        console.log('===================');
    }
}));

//Routes
app.use('/api', require('./routes/api'));

// Start server
app.listen(3000);
console.log('API is running on port 3000');
