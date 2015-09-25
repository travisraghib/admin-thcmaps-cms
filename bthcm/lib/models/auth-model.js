/**
 * Created by travisraghib on 8/17/14.
 */
//deps
var mailer = require ('../../lib/mail/mailer');

//mod

var auth = {};
auth.signing = function(req, res, passport) {
    passport.authenticate ('local-login', function (err, user) {
        if (err) {
            console.log (err);
            res.status(401);
            res.end();
            return;
        }
        if (!user) {
            console.log ('no user');
            res.status(401);
            res.end();
            return;
        }
        req.login (user, {}, function (err) {
            if (err) {
                console.log(err);
                res.status(401);
                res.end();
                return;
            }
            userObj = req.user;
            return res.json (
                {
                    user: {
                        id    : req.user.id,
                        email : req.user.email,
                        joined: req.user.joined
                    },
                    success        : true
                }
            );
        });
    }) (req, res);
};
auth.login = function login (req, res, passport) {
    passport.authenticate ('local-login', function (err, user) {
            if (err) {
                console.log (err)
                return res.json ({ error: err.message });
            }
            if (!user) {
                console.log ('no user')
                return res.json ({error: 'Invalid Login'});
            }
            req.login (user, {}, function (err) {
                if (err) {
                    return res.json ({error: err});
                }
                userObj = req.user;
                return res.json ({ user: {
                        id    : req.user.id,
                        email : req.user.email,
                        joined: req.user.joined
                    },
                        success        : true
                    });
            });
        }) (req, res);
};

auth.signUp = function signUp (req, res, passport) {
    passport.authenticate ('local-signup', function (err, user, message) {
        //todo check username
        if (err) {
            //mongo lookup error
            return res.json ({ error: err.message });
        }
        if (!user) {
            //user already registered (duplicate email)
            console.log (err, ', ', user);
            return res.json ({error: message.message});
        }
        console.log('user is : ' , user );
        req.login (user, {}, function (err) {
            //this shouldn't happen
            if (err) {
                console.log ('auth err : ', err);
                return res.json ({error: err});
            }
            //send email
            mailer.signUpEmail (user, handle);

            function handle (mailErr, emailData) {
                "use strict";
                if (mailErr) {
                    console.log ('mailErr : ', mailErr);
                    return res.json ({error: mailErr});
                }
                return res.json ({ user: {
                        id    : req.user.id,
                        email : req.user.email,
                        joined: req.user.joined
                    },
                        success        : true
                    });
            }
        });
    }) (req, res);
};

module.exports = auth;