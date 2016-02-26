var phantom = require('phantom');
var Promise = require('bluebird');
var CONFIG = require('../config/config');

var ALLOWED_ORIGINS = CONFIG.allowed_origins;

var phantomJS = {};

phantomJS.screenshot = function (url, query) {

    return new Promise(function (resolveScreenshot, rejectScreenshot) {

        var viewportWidth = parseInt(query.w) || 800;
        var viewportHeight = parseInt(query.h) || 600;
        var page;

        if (!isValidOrigin(url)) {
            var response = {
                status: 403,
                msg: 'Forbidden'
            };
            rejectScreenshot(response);
            return;
        }

        phantom.create(['--web-security=no']).then(function (ph) {
            ph.createPage().then(function (createdPage) {

                page = createdPage;
                return page.setting('userAgent');
            }).then(function (value) {

                page.setting('userAgent', value + ' Photobooth (+https://github.com/Onefootball/PhotoBoothApi.git)');
                page.property('viewportSize', {width: viewportWidth, height: viewportHeight});
                page.property('onResourceRequested', function (requestData, request) {
                    if ((/google-analytics\.com/gi).test(requestData['url'])) {
                        request.abort();
                    }
                });
                return page.open(url)
            }).then(function (status) {

                var attempts = 0;

                function checkReadyState() {
                    //this should probably not happen, but if readyState does not complete,
                    // then we can have an endless loop
                    attempts++;
                    if (attempts > 10) {
                        page.close();
                        ph.exit();
                        var response = {
                            status: 500,
                            msg: 'Stuck in the loop'
                        };
                        rejectScreenshot(response);
                    }
                    setTimeout(function () {
                        page.evaluate(function () {
                            return document.readyState;
                        }).then(function (result) {
                            if ("complete" === result) {
                                page.renderBase64('png').then(function (data) {
                                    page.close();
                                    ph.exit();
                                    resolveScreenshot(data);
                                    return;
                                });
                            } else {
                                checkReadyState();
                            }
                        });
                    });
                }

                if (status === 'success') {
                    checkReadyState();
                } else {
                    page.close();
                    ph.exit();
                    var response = {
                        status: 500,
                        msg: 'Opening message: ' + status
                    };
                    rejectScreenshot(response);
                    return;
                }
            });
        }).catch(function (error) {
            var response = {
                status: 500,
                msg: error
            };
            rejectScreenshot(response);

        });
    });

    function isValidOrigin(url) {
        try {
            //handle one slash protocol
            var urlNoProtocol;
            if (url.indexOf('//') !== -1) {
                urlNoProtocol = url.split('//')[1];
            } else {
                urlNoProtocol = url.split('/')[1];
            }
            var domain = urlNoProtocol.split('/')[0];
            //domain should end with allowed origin
            for (var i = 0; i < ALLOWED_ORIGINS.length; i++) {
                if (domain.indexOf(ALLOWED_ORIGINS[i], domain.length - ALLOWED_ORIGINS[i].length) !== -1) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }
};

module.exports = phantomJS;