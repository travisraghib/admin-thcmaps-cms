/**
 * Created by travisraghib on 8/17/14.
 */
//deps
var Dispensary = require ('../../models/dispensaryModel');
var User = require ('../../models/user');
var braintree = require ('braintree');
var mailer = require ('../../lib/mailer');
/**
 *prod
 */

var gateway = braintree.connect ({
    environment: braintree.Environment.Sandbox,
    merchantId : 'tw6x5mw3hkpkhtpt',
    publicKey  : '2fv98xgnfgnkjkw3',
    privateKey : 'bd540ee699d3987a3060ca5c7b0b81a1'
});

/**
 *
 *sandbox dont commit with sandbody env enableds
 *
 */
//var gateway = braintree.connect ({
//    environment: braintree.Environment.Sandbox,
//    merchantId : 'xvd8kkh3vwmtychh',
//    publicKey  : 'vt9fycpjf5xsd6x8',
//    privateKey : '0c7246ff08c6350037e6e969b660770a'
//});


//mod
var sub = {};


sub.createdispensary = function (req, res) {
    "use strict";
    //check login status
    if (!req.user) {
        res.json ({success: false, error: 'user not logged in '});
        return;
    }
    //billing in fo
    var customerRequest = {
        firstName : req.body.fname,
        lastName  : req.body.lname,
        phone     : req.body.phone,
        creditCard: {
            number         : req.body.ccn,
            cvv            : req.body.cvv,
            expirationMonth: req.body.expmonth,
            expirationYear : req.body.expyear,
            billingAddress : {
                postalCode: req.body.postalcode
            }
        }
    };
    //create braintree customer
    gateway.customer.create (customerRequest, function (err, result) {
        if (err || !result.success) {
            console.log (err);
            console.log (result);
            return res.json ({success: false, error: err});
        }

        var bTreeCustomerId = result.customer.id;

        if (result.success) {
            //create subscription
            gateway.customer.find (bTreeCustomerId, function (err, customer) {
                if (err) {
                    errorHandler (res, err);
                    return;
                } else {
                    var subscriptionRequest = {
                        paymentMethodToken: customer.creditCards[0].token,
                        planId            : req.body.price
                    };
                    gateway.subscription.create (subscriptionRequest, function (err, result) {
                        console.log ('results : ', result);
                        var dispensaryObj = {
                            dispensaryId: req.body.id,
                            name        : req.body.name,
                            slug        : req.body.slug,
                            brainTreeId : customer.id,
                            isCurrent   : true
                        };
                        var update = {$push: {dispensaries: dispensaryObj}, $set: {dispensaryCredits: 1}};
                        //use when here
                        User.update ({_id: req.user._id}, update).exec (function (err, updateResults) {
                            console.log (err);
                            if (err) {
                                errorHandler (res, err);
                                return;
                            }
                            console.log (updateResults);
                            mailer.createDispensaryEmail(req.user, function(err, mail){
                                console.log(err);
                                console.log(mail);
                            });
                            res.json ({success: true});

                        });
                    });
                }
            });

        }
    });
};


sub.claimdispensary = function claimdispensary (req, res) {
    'use strict';
    if (!req.user) {
        res.json ({success: false, error: 'user not logged in '});
        return;
    }

    var customerRequest = {
        firstName : req.body.fname,
        lastName  : req.body.lname,
        phone     : req.body.phone,
        creditCard: {
            number         : req.body.ccn,
            cvv            : req.body.cvv,
            expirationMonth: req.body.expmonth,
            expirationYear : req.body.expyear,
            billingAddress : {
                postalCode: req.body.postalcode
            }
        }
    };
    console.log ('req.body : ', req.body);
    console.log ('customerRequest : ', customerRequest);

    //create customer

    gateway.customer.create (customerRequest, function (err, result) {
        if (err || !result.success) {
            console.log (err);
            console.log (result);
            return res.json ({success: false});
        }
        console.log (result);
        var bTreeCustomerId = result.customer.id;
        if (result.success) {
            //create subscription
            gateway.customer.find (bTreeCustomerId, function (err, customer) {
                if (err) {
                    errorHandler (res, err);
                    return;
                } else {
                    var subscriptionRequest = {
                        paymentMethodToken: customer.creditCards[0].token,
                        planId            : req.body.price
                    };
                    gateway.subscription.create (subscriptionRequest, function (err, result) {
                        console.log ('results : ', result);
                        var dispensaryObj = {
                            dispensaryId: req.body.id,
                            name        : req.body.name,
                            slug        : req.body.slug,
                            brainTreeId : customer.id,
                            isCurrent   : true
                        };
                        var pushDispensary = {$push: {dispensaries: dispensaryObj}};
                        //use when here
                        User.update ({_id: req.user._id}, pushDispensary).exec (function (err, updateResults) {
                            console.log (err);
                            if (err) {
                                errorHandler (res, err);
                                return;
                            }
                            console.log (updateResults);

                            res.json ({success: true, slug : req.body.slug});
                        });
                        Dispensary.update ({_id: req.body.id}, {$set: {pageOwner: req.user._id}}).exec (function (err, updateResults) {
                            if (err) {
                                errorHandler (res, err);
                                return;
                            }
                            console.log (updateResults);
                        });
                    });
                }
            });

        }
    });
};

//privates
function errorHandler (res, error) {
    "use strict";
    res.json ({success: false, error: error});
};

module.exports = sub;