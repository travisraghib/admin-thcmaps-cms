'use strict';

var lib = '../../lib',
    express = require('express');
var router = express.Router();

var search = require('./search/index');
var auth = require(lib + '/models/auth-model');
var service = require('./search/service');



/*
 * Setup /services route
 * Most end points live here
 */
router.use('/search', search);

//vendor page
router.get ('/vendor', service.getFullDispensary);
//reviews
router.post ('/review' , service.postReview);
router.get  ('/review'  ,  service.getReviews);

//auth
router.post ('/signin' , function (req, res) { auth.signing  (req, res, passport); });
router.post ('/signup' , function (req, res) { auth.signUp (req, res, passport); });
router.get  ('/logout' , function (req, res) { req.logout  (); res.json ({success: true}); });
router.get  ('/authstatus', function(req, res){
    if(req.user){
        res.status(200);
    }else{
        res.status(202);
    }
    res.end();
});

module.exports = router;
