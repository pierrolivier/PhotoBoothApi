var phantomService = require('./phantomJs');
var S3Service = require('../factory/S3');
var Promise = require('bluebird');
var CONFIG = require ('../config/config');

module.exports.fetchScreenshot = function (url, query) {
    if (CONFIG.aws_cache.use) {
        return  fetchWithCache (url, query);
    }
    return fetch(url, query);
};

function fetchWithCache (url, query) {

    var S3 = new S3Service(CONFIG.aws_cache.bucket, url);

    return new Promise(function (resolveData, rejectData) {
        S3.checkIfFileExists(url).then(function (metadata) {
            S3.download().then(function (data) {
                resolveData(data);
            }).catch(function (error) {
                phantomService.screenshot(url, query).then(function (data) {
                    resolveData(data);
                    S3.upload(data);
                }).catch(function (error) {
                    rejectData(error);
                });
            });
        }).catch(function (err) {
            phantomService.screenshot(url, query).then(function (data) {
                resolveData(data);
                S3.upload(data);
            }).catch(function (error) {
                rejectData(error);
            });
        })
    });
}

function fetch (url, query) {
    return new Promise(function (resolveData, rejectData) {
        phantomService.screenshot(url, query).then(function (data) {
            resolveData(data);
        }).catch(function (error) {
            rejectData(error);
        });
    });
}