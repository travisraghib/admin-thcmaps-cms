/**
 * Created by travisraghib on 8/17/14.
 */
var aws = require('../aws/aws-ses');


var mailer = {};

mailer.signUpEmail = function(user, callBack){
    "use strict";
    var mail = {
        from : 'accounts@thcmaps.com',
        to : [user.local.email],
        subject : 'New Account',
        body : 'This e-mail is to confirm your account at thcmaps.com'
    };
    aws(mail, function(err, data){
        if(callBack)callBack(err, data);
    });
};

mailer.createDispensaryEmail = function(user, callBack){
    "use strict";
    var mail = {
        from : 'accounts@thcmaps.com',
        to : [user.local.email],
        subject : 'New Account',
        body : 'This e-mail is to confirm that you\'ve created a new dipsensary.'
    };
    aws(mail, function(err, data){
        if(callBack)callBack(err, data);
    });
};


module.exports = mailer;
