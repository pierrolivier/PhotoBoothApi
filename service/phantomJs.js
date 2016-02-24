var phantom = require('phantom');
var Promise = require('bluebird');
var CONFIG = require ('../config/config');

var ALLOWED_ORIGINS = CONFIG.allowed_origins;

var phantomJS = {};

phantomJS.screenshot = function (url, query) {

    return new Promise(function (resolveScreenshot, rejectScreenshot) {

        var viewportWidth = parseInt(query.w) || 800;
        var viewportHeight = parseInt(query.h) || 600;

        if (!isValidOrigin(url)) {
            var response = {
                status: 403,
                msg: 'Forbidden'
            };
            rejectScreenshot(response);
            return;
        }

        phantom.create('--web-security=no', function (ph) {
                ph.createPage(function (page) {
                    page.get('settings.userAgent', function (data) {
                        page.set('viewportSize', {width: viewportWidth, height: viewportHeight});
                        page.set('settings.userAgent', data + ' Photobooth (+https://github.com/Onefootball/PhotoBoothApi.git)');
                        //prevent google analytics from loading
                        page.onResourceRequested(function (requestData, request) {
                            if ((/google-analytics\.com/gi).test(requestData['url'])) {
                                request.abort();
                            }
                        });

                        page.open(url, function (status) {
                            function checkReadyState() {
                                setTimeout(function () {
                                    page.evaluate(function () {
                                        return document.readyState;
                                    }, function (result) {
                                        if ("complete" === result) {
                                            page.renderBase64('png', function (data) {
                                                closePhantom(ph, page);
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
                                closePhantom(ph, page);
                                var response = {
                                    status: 500,
                                    msg: 'Opening message: ' + status
                                };
                                rejectScreenshot(response);
                                return;
                            }
                        });
                    });
                });
            },
            {
                onExit: handleExit
            });
    });
};

var closePhantom = function (ph, page) {
    page.close();
    ph.exit();
};

var handleExit = function (code, signal) {
    if (code === 0) {
        console.log("Phantom exit success");
    } else {
        //maybe we need to handle it
        console.log("Code: " + code);
        console.log("Signal: " + signal);
    }
};

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

module.exports = phantomJS;
