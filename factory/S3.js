var AWS = require('aws-sdk');
var Promise = require('bluebird');

var S3 = function (bucket, key) {

    var _s3bucket = new AWS.S3({params: {Bucket: bucket}});
    var _params = {
        Key: key
    };

    this.checkIfFileExists = function () {
        return new Promise(function (resolveFileExists, rejectFileExists) {
            _s3bucket.headObject(_params, function (err, metadata) {
                if (err) {
                    console.log("s3:", key, err.code);
                    rejectFileExists(err);
                } else {
                    console.log(_params.Key + " found in bucket");
                    resolveFileExists(metadata);
                }
            });
        });
    };

    this.upload = function (data) {
        var img = new Buffer(data, 'base64');
        var uploadParams = {
            Key: _params.Key,
            Body: img,
            ContentEncoding: 'base64',
            ContentType: 'image/png'
        };

        _s3bucket.putObject(uploadParams, function (err, data) {
            if (err) {
                console.log("Error uploading data: ", err);
            } else {
                console.log("Successfully uploaded data to s3 - " + uploadParams.Key);
            }
        });

    };

    this.download = function () {
        return new Promise(function (resolveDownload, rejectDownload) {
            _s3bucket.getObject(_params, function (err, data) {
                if (err) {
                    console.log("Error getting data: ", err);
                    rejectDownload(err);
                } else {
                    resolveDownload(data.Body);
                }
            });
        });
    };
};

module.exports = S3;
