/**
 * Created by travisraghib on 8/16/14.
 */
//deps
var aws = require('aws-sdk');
// load AWS SES
aws.config = {
    "accessKeyId": "AKIAJ7XFAIPZYIXXLOVQ",
    "secretAccessKey": "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",
    "region": "us-west-2"
};

module.exports = function (mail, callBack){
    "use strict";
    var ses = new aws.SES({apiVersion: '2010-12-01'});
    var from = mail.from;
    var to = mail.to;
    var subject = mail.subject;
    var body = mail.body;

    var mailObj = {
        Source: from,
        Destination: {
            ToAddresses: to
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Text: {
                    Data: body
                }
            }
        }
    };
    ses.sendEmail(mailObj, function(err, data) {
        if(callBack)callBack(err, data);
    });
};