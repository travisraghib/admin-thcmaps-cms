/**
 * Created by travisraghib on 8/17/14.
 */
//deps
var Dispensary = require ('../../models/dispensaryModel');
var User = require ('../../models/user');
var Review = require ('../../models/review');
var cloudinary = require ('cloudinary');
var utils = require ('../../models/utils/utils');
var landingPage = require ('./landing-page-model');
var moment = require('moment');

//mod
var page = {};

//landing
page.landing = function home (req, res) {
    var obj = landingPage (req, utils);
    res.render ('index', obj);
};

page.doctors = function doctors (req, res){
    "use strict";
    var obj = landingPage (req, utils);
    obj.doctors = true;
    res.render ('doctors', obj);
};
//list view of landing
page.list = function list (req, res) {
    var obj = landingPage (req, utils);
    res.render ('list', obj);
};

//legal page (static)
page.legal = function legal (req, res) {
    "use strict";
    var obj = landingPage (req, utils);
    res.render ('privacy', obj);

};

//dispensary page
page.dispensary = function (req, res) {
    "use strict";
    var currDispensary = req.param ('name');
    Dispensary.findOne ({'pageInfo.slug': currDispensary}).exec (function (err, result) {
        if (err) {
            console.log ('err : ', err);
            res.render ('404');
            return;
        }
        if (!result) {
            console.log ('result : ', result);
            res.render ('404');
            return;
        }


        //map out result then render page
        console.log(result.pageInfo.hours);

        var date = new Date();
        var currDay = date.getDay();

        var loginStatus = req.user;

        var id = result._id;
        var info = result.pageInfo;
        var name = info.name;
        var rating = Math.floor (result.rating) / result.reviewCount;
        var phone = utils.formatPhone (info.phone_number);
        var addressBase = (info.address && info.city && info.address.toLowerCase () != info.city.toLowerCase ()) ? info.address : '';
        var address = addressBase + ' ' + info.city + ' ' + info.state + ' ' + info.zip_code;
        var businessHours = result.pageInfo.hours;
        var weedMenu = result.weedMenu;
        var reviews = result.reviews;
        var avatar = result.pageInfo.avatar_url;
        var picturesArray = (result.pictures.length > 0) ? utils.cloudinaryImages (result.pictures, cloudinary) : null;
        var pageOwner = result.pageOwner;
        var isFollowing = (req.user && req.user.following.indexOf (id) !== -1) ? true : false;
        console.log(req.user && req.user.following);
        console.log(req.user && req.user.following.indexOf (id));
        var updatedMoment = moment(result.pageInfo.updated_at);
        var now = moment();
        var updatedAt = updatedMoment.from(now);


        //            if (result.avatar)
        //            {
        //                avatar = cloudinary.url (result.avatar, {
        //                    height: 145,
        //                    width : 145,
        //                    crop  : 'fill'
        //                });
        //                console.log (avatar);
        //            }


        var obj = {
            currDay     : currDay,
            avatar        : avatar,
            pageOwner     : pageOwner,
            picturesArray : picturesArray,
            stub          : currDispensary,
            dispensaryName: name,
            id            : id,
            rating        : rating,
            phone         : phone,
            address       : address,
            weedMenu      : weedMenu,
            hours         : businessHours,
            hasReviews    : false,
            loginStatus   : loginStatus,
            user          : req.user,
            isFollowing   : isFollowing,
            updatedAt     : updatedAt

        };

        if (reviews && reviews.length > 0) {
            var reviewIds = [];
            for (var i = 0; i < reviews.length; i++) {
                reviewIds.push (reviews[i].reviewId);
            }
            //find my reviews
            Review.find ({
                '_id': {$in: reviewIds}
            }).exec (function (err, revs) {
                if (err) {
                    console.log ('err : ', err);
                    res.render ('404');
                    return;
                }
                if (!revs) {
                    res.render ('404');
                    return;
                }
                obj.reviews = revs;
                obj.hasReviews = true;
                console.log (revs);
                res.render ('dispensary', obj);
            });
        } else {
            res.render ('dispensary', obj);
        }
    })

};

page.profile = function (req, res) {
    if (!req.user) {
        res.redirect ('/');
        return;
    }
    var id = req.param ('id');
    console.log ('location : ', id);
    User.findOne ({'_id': id}).exec (function (err, user) {
        if (err) {
            console.log ('err : ', err);
            res.render ('404');
            return;
        }
        if (!user) {
            console.log ('user : ', user);
            res.render ('404');
            return;
        }


        console.log (user);
        console.log (user.reviews && user.reviews[0]);
        var obj = {
            user        : user,
            loggedInUser: userObj
        };

        var reviews = user.reviews;

        if (reviews && reviews.length > 0) {
            obj.hasReviews = true;
            var reviewIds = [];
            for (var i = 0; i < reviews.length; i++) {
                reviewIds.push (reviews[i].reviewId);
            }
            //find my reviews
            Review.find ({
                '_id': {$in: reviewIds}
            }).exec (function (err, revs) {
                if (err) {
                    console.log ('err : ', err);
                    res.render ('404');
                    return;
                }
                if (!revs) {
                    console.log ('revs : ', revs);
                    res.render ('404');
                    return;
                }

                console.log ('err : ', err);
                obj.reviews = revs;
                res.render ('publicProfile', obj);
                console.log ('*********************************************');
                console.log ('*********************************************');
                console.log ('rendering publicProfile page with : ', obj)
                console.log ('*********************************************');
                console.log ('*********************************************');
            });
        } else {
            res.render ('publicProfile', obj);
        }

    });
};
page.regcomplete = function (req, res) {
    "use strict";
    res.render ('regcomplete');
    // need a link here to send them to their respective manage or create pages

};

//edit dispensary page
page.editDispensary = function (req, res) {

    //security stuff
    var currDispensary = req.param ('name');
    console.log (currDispensary);
    if (!req.user) {
        res.json ({success: false, error: 'Please login to edit this page.'});
        console.log ('User not logged in');
        return;
    }
    //admin back door
    else if (req.user.privileges.slug === 'master') {
        console.log ('find');
        findDispensary ();
    } else if (req.user.dispensaries.length > 0) {
        var hasOwner = false;
        for (var i = 0; i < req.user.dispensaries.length; i++) {
            if (req.user.dispensaries[i].slug == req.param ('name')) {
                hasOwner = true;
                findDispensary ();
            }
        }
    }
    //    findDispensary ();
    function processResults (results) {
        //object mapping
        var loginStatus = req.isAuthenticated ();
        var id = results._id;
        var info = results.pageInfo;
        var name = info.name;
        var avatar = info.avatar;
        var rating = info.rating;
        var phone = info.phone_number;
        var address = info.address;
        var city = info.city;
        var state = info.state;
        var zip = info.zip_code;
        var businessHours = results.hours;
        var picturesArray = (results.pictures.length > 0) ? utils.cloudinaryImages (results.pictures, cloudinary) : null;

        /**-----------------------------------------------------**/
        //catch for dispensaries without business hours
        /**-----------------------------------------------------**/
        if (!businessHours) {
            console.log ('monday undefined please save...');
            businessHours = {
                sunday   : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                monday   : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                tuesday  : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                wednesday: {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                thursday : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                friday   : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                },
                saturday : {
                    hours: { open: '12:00pm', close: '9:45pm' }
                }
            };
        }
        /**-----------------------------------------------------**/
        //end
        /**-----------------------------------------------------**/
        var weedMenu = {
            sativa: results.weedMenu && results.weedMenu.Sativa,
            indica: results.weedMenu && results.weedMenu.Indica
        };
        var obj = {
            loginStatus   : loginStatus,
            isEditing     : true,
            name          : currDispensary,
            dispensaryName: name,
            id            : id,
            rating        : rating,
            avatar        : avatar,
            phone         : phone,
            address       : address,
            city          : city,
            state         : state,
            zip           : zip,
            weedMenu      : weedMenu,
            hours         : businessHours,
            pictures      : picturesArray
        }
        res.render ('editDispensary', obj);
    };
    function findDispensary () {
        "use strict";
        Dispensary.findOne ({'pageInfo.slug': currDispensary}).exec (function (err, results) {
            if (err) {
                console.log ('err : ', err);
                res.render ('404');
                return;
            }
            if (!results) {
                console.log ('results : ', results);
                res.render ('404');
                return;
            }

            console.log (results);
            processResults (results)
        });
    }
};

//claim dispensary
page.sslRedirect = function sslRedirect (req, res, next) {
    "use strict";
    //ssl redirect
    if (req.headers['x-forwarded-proto'] == 'http') {
        if (req.headers.host === 'localhost:5000') {
            next ();
        } else {
            res.redirect ('https://' + req.headers.host + req.originalUrl);
        }
    } else {
        next ();
    }
};
page.claimDispensary = function (req, res) {
    "use strict";
    var dispensaryId = req.param ('id');

    var obj = utils.BasePageData (req, global);
    obj.location = 'Irvine, Ca';

    Dispensary.findOne ({_id: dispensaryId}).exec (function (err, result) {
        if (err) {
            console.log ('err : ', err);
            res.render ('404');
            return;
        }
        if (!result) {
            console.log ('result : ', result);
            res.render ('404');
            return;
        }
        console.log (err);
        obj.pageOwner = result.pageOwner;
        obj.pageName = result.pageInfo.name;
        if (req.user) {
            console.log (req.user);
            obj.userName = req.user.username;
        }

        console.log (obj.userName);
        obj.slug = result.pageInfo.slug;

        res.render ('claimDispensary', obj);
    });
};

//register new dispensary same on purpose just didnt want confunsion on main controller
page.createDispensary = function (req, res) {
    "use strict";
    var obj = {
        loginStatus: req.user
    };
    console.log ('obj : ', obj);
    res.render ('claimDispensary', obj);
};

//create dispensary page
page.createDispensaryPage = function (req, res) {
    "use strict";
    //    User.find

    res.render ('createDispensaryPage');
};


module.exports = page;