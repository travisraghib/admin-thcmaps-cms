var lib = '../../../lib',
    serviceController = {},
    Dispensary = require(lib + '/models/db/DispensaryModel'),
    User = require(lib + '/models/db/UserModel'),
    Review = require(lib + '/models/db/ReviewModel'),
    editDispensaryPage = require(lib + '/models/edit-dispensary-model'),
    dispensaryReview = require(lib + '/models/dispensary-review-model'),
//    photoModel = require(lib + '/models/dispensary-photo-model'),
    geoModel = require(lib + '/models/geo-model'),
//    subscription = require(lib + '/models/subscription-model'),
    moment = require('moment-timezone');




serviceController.simpleVendors = geoModel.simpleVendors;
serviceController.filteredVendors = geoModel.filteredVendors;

serviceController.infoWindowData = function(req, res) {
    "use strict";
    //todo:  remove loc means that getDistance needs to be refactored
    Dispensary.findOne({_id: req.query.id}).select('-_id pageInfo.name pageInfo.slug pageInfo.has_testing ' + 'pageInfo.is_delivery pageInfo.rating pageInfo.reviews_count ' + 'pageInfo.phone_number pageInfo.avatar_url ' + 'pageInfo.city pageInfo.address pageInfo.state pageInfo.zip_code loc ')
        .exec(function(err, result) {
            if(err) {
                res.json({success: false});
                return;
            }
            var vendorWithDistance = getDistance(result, req.session.locationObj);
            res.send(vendorWithDistance)
        });

};
serviceController.clientLocation = function(req, res) {
    "use strict";
    res.json(req.session.locationObj);
};
serviceController.setSearchAddress = function(req, res) {
    "use strict";
    if(req.body.formatted_address && req.body.lng && req.body.lat) {
        req.session.locationObj.formatted_address = req.body.formatted_address;
        req.session.locationObj.lng = req.body.lng;
        req.session.locationObj.lat = req.body.lat;
        res.send(200).end();
        return;
    }
    res.send(400).end();
};

serviceController.getFullDispensary = function(req, res) {
    Dispensary
        .findOne({'pageInfo.slug': req.query.dispensary})
        .select('weedMenu reviews pageInfo.address pageInfo.time_zone_identifier pageInfo.avatar_url pageInfo.body pageInfo.city pageInfo.state pageInfo.zip_code pageInfo.hours pageInfo.intro_body pageInfo.is_delivery pageInfo.latitude pageInfo.longitude pageInfo.name pageInfo.phone_number pageInfo.rating pageInfo.reviews_count pageInfo.updated_at')
        .exec(function(error, d) {
            if(error) {
                console.log(error);
                res.status(400).end();
                return;
            }

            var clientTime = Number(req.query.cTime);

            var now = moment(clientTime)
                .tz(d.pageInfo.time_zone_identifier);
            console.log('now : ', now.format('DD h:mm a'));
            var i;
            for(i = 0; i < d.weedMenu.length; i++) {
                var updatedMoment = moment(d.weedMenu[i].updated_at).utc();
                var from = updatedMoment.from(now);
                d.weedMenu[i].updated_at = from;
            }
            d.pageInfo.has_owner = (d.pageOwner) ? true : false;
            d.pageInfo.last_update = moment(d.pageInfo.updated_at).from(moment());

            var date = new Date();
            var currDay = date.getDay();
            for(i = 0; i < d.pageInfo.hours.length; i++) {
                if(currDay === d.pageInfo.hours[i].day_order) {
                    //                console.log('-----------------------------------------------------------');
                    //                console.log('start  timezone calculations : service-controller.js [76]');
                    //                console.log('-----------------------------------------------------------');
                    d.pageInfo.hours[i].is_today = true;

                    var openTime = moment(d.pageInfo.hours[i].opening_time, 'h:mm a');
                    var openHour = openTime.format('HH');
                    var openMin = openTime.format('mm');

                    var closeTime = moment(d.pageInfo.hours[i].closing_time, 'h:mm a');
                    var closeHour = closeTime.format('HH');
                    var closenMin = closeTime.format('mm');

                    var c = new moment(clientTime)
                        .tz(d.pageInfo.time_zone_identifier)
                        .set('hour', closeHour)
                        .set('minute', closenMin);

                    var m = new moment(clientTime)
                        .set('hour', 4)
                        .set('minute', 0)
                        .tz(d.pageInfo.time_zone_identifier);

                    var midnight = new moment(clientTime)
                        .set('hour', 23)
                        .set('minute', 59)
                        .tz(d.pageInfo.time_zone_identifier);

                    var o;
                    if(now.isBefore(m) && c.isAfter(midnight)) {
                        var day = (i === 0 ) ? 6 : i - 1;

                        openTime = moment(d.pageInfo.hours[day].opening_time, 'h:mm a');
                        openHour = openTime.format('HH');
                        openMin = openTime.format('mm');
                        o = new moment(clientTime)
                            .tz(d.pageInfo.time_zone_identifier)
                            .set('hour', openHour)
                            .set('minute', openMin)
                            .add(-1, 'day');

                    } else {
                        o = new moment(clientTime)
                            .tz(d.pageInfo.time_zone_identifier)
                            .set('hour', openHour)
                            .set('minute', openMin);
                    }

                    var elevenFiftyNine = new moment(clientTime)
                        .set('hour', 11)
                        .set('minute', 59)
                        .set('second', 59)
                        .tz(d.pageInfo.time_zone_identifier);

                    //this shit because moment cant understand 12:00 am
                    if(!now.isBefore(m) && (c.isBefore(m) || c.format('h:mm a') === '12:00 am')) {
                        c.add(1, 'd');
                    }
                    if(now.isAfter(o) && now.isBefore(c)) {
                        d.pageInfo.is_open = true;
                        d.pageInfo.remaining_hours = c.from(now, true);

                        console.log('open : ', o.format('DD h:mm a'));
                        console.log('close : ', c.format('DD h:mm a'));
                        console.log('now : ', now.format('DD h:mm a'));
                        console.log('opening from now : ', o.from(now, true));
                    } else {
                        if(c.isBefore()) {
                            if(now.isBefore(o)) {
                                console.log('hasn\'t opened');
                            }
                        }
                        openHour = openTime.format('HH');
                        openMin = openTime.format('mm');

                        var o = new moment(clientTime)
                            .tz(d.pageInfo.time_zone_identifier)
                            .set('hour', openHour)
                            .set('minute', openMin);

                        if(now.isAfter(c)) {
                            console.log('just closed');
                            o.add(1, 'd')
                        }

                        d.pageInfo.remaining_hours = o.from(now, true);

                        //                    console.log('open : ', o.format( 'DD h:mm a'));
                        //                    console.log('close : ', c.format( 'DD h:mm a'));
                        //                    console.log('now : ', now.format( 'DD h:mm a'));
                        //                    console.log('opening from now : ', o.from(now, true));

                    }
                    //                console.log('-----------------------------------------------------------');
                    //                console.log('end timezone calculations : service-controller.js [141]');
                    //                console.log('-----------------------------------------------------------');
                }
            }
            res.json(d)
        });
};


//social
serviceController.postReview = function postReview(req, res) {
    "use strict";
    dispensaryReview.review(req, res);
};

serviceController.deleteReview = function deleteReview(req, res) {
    "use strict";
    dispensaryReview.deleteReview(req, res);
};

serviceController.replyReview = function replyReview(req, res) {
    "use strict";
    dispensaryReview.reply(req, res);
};

//vendor admin
//serviceController.postPhoto = function postPhoto(req, res) {
//    "use strict";
//    photoModel.postPhoto(req, res);
//};
//
//serviceController.deletePhoto = function deletePhoto(req, res) {
//    "use strict";
//    photoModel.deletePhoto(req, res);
//};
//
//serviceController.makeAvatar = function makeAvatar(req, res) {
//    "use strict";
//    photoModel.makeAvatar(req, res);
//};

serviceController.editHours = function editHours(req, res) {
    "use strict";
    editDispensaryPage.editHours(req, res);
};

serviceController.editMenuItem = function editMenuItem(req, res) {
    "use strict";
    editDispensaryPage.editMenuItem(req, res);
};
serviceController.addMenuItem = function addMenuItem(req, res) {
    "use strict";
    editDispensaryPage.addMenuItem(req, res);
};
serviceController.deleteMenuItem = function deleteMenuItem(req, res) {
    "use strict";
    editDispensaryPage.deleteMenuItem(req, res);
};

serviceController.editContact = function editContact(req, res) {
    "use strict";
    editDispensaryPage.editContact(req, res);
};

//geo location
serviceController.landingDispensaries = function landingDispensaries(req, res) {
    "use strict";
    geoModel.landingDispensaries(req, res);
};
serviceController.getDoctors = geoModel.getDoctors;
serviceController.getDots = geoModel.getDots;
serviceController.getVendors = geoModel.getVendors;
serviceController.getDispensaryByLatLng = geoModel.getDispensaryByLatLng;


serviceController.dispensariesByLocation = function dispensariesByLocation(req, res) {
    "use strict";
    geoModel.dispensariesByLocation(req, res);
};


serviceController.setSearchHome = function dispensariesByLocation(req, res) {
    "use strict";
    geoModel.setSearchHome(req, res);
};
serviceController.setSearchPosition = geoModel.setSearchPosition;


////create subscription
//serviceController.claimdispensary = function createSubscription(req, res) {
//    "use strict";
//    subscription.claimdispensary(req, res);
//
//};
//serviceController.createdispensary = function createdispensary(req, res) {
//    "use strict";
//    subscription.createdispensary(req, res);
//
//};

//get reviews
serviceController.getReviews = function(req, res) {
    "use strict";
    console.log('------------get reviews start------------')
    console.log(req.query);
    var ids = req.query['0'];
    console.log(ids);


    if(!ids) {

    }
    console.log(ids);

    //search for reviews now.
    Review.find({'_id': {$in: ids}}).exec(function(err, reviews) {
        if(err) {
            console.log(err);
            res.status(400).send('Bad Request');
            return;
        }
        res.json(reviews);
        console.log(reviews)
        console.log('------------get reviews start------------')
    })
};

//get dispensary data
serviceController.getDispensary = function(req, res) {
    Dispensary.findOne({'pageInfo.slug': req.query.dispensary}).exec(function(err, d) {
        if(err) {
            console.log(err);
            res.json({success: false, error: err});
            return;
        }

        var clientTime = Number(req.query.cTime);
        var now = moment(clientTime).tz(d.pageInfo.time_zone_identifier);


        var i;
        for(i = 0; i < d.weedMenu.length; i++) {
            var updatedMoment = moment(d.weedMenu[i].updated_at).utc();
            var from = updatedMoment.from(now);
            d.weedMenu[i].updated_at = from;
        }
        d.pageInfo.has_owner = (d.pageOwner) ? true : false;
        d.pageInfo.last_update = moment(d.pageInfo.updated_at).from(moment());

        var date = new Date();
        var currDay = date.getDay();
        for(i = 0; i < d.pageInfo.hours.length; i++) {
            if(currDay === d.pageInfo.hours[i].day_order) {
                d.pageInfo.hours[i].is_today = true;

                var openTime = moment(d.pageInfo.hours[i].opening_time, 'h:mm a');
                var openHour = openTime.format('HH');
                var openMin = openTime.format('mm');

                var closeTime = moment(d.pageInfo.hours[i].closing_time, 'h:mm a');
                var closeHour = closeTime.format('HH');
                var closenMin = closeTime.format('mm');

                var o = new moment(clientTime)
                    .tz(d.pageInfo.time_zone_identifier)
                    .set('hour', openHour)
                    .set('minute', openMin)
                var c = new moment(clientTime)
                    .tz(d.pageInfo.time_zone_identifier)
                    .set('hour', closeHour)
                    .set('minute', closenMin)

                var m = new moment(clientTime).add(1, 'd')
                    .set('hour', 00)
                    .set('minute', 00)
                    .tz(d.pageInfo.time_zone_identifier);


                //this shit because moment cant understand 12:00 am
                if(c.isAfter(m) || c.format('h:mm a') === '12:00 am') {
                    c.add(1, 'd')
                }
                if(now.isAfter(o) && now.isBefore(c)) {
                    d.pageInfo.is_open = true;
                    d.pageInfo.remaining_hours = c.from(now, true);

                } else {
                    d.pageInfo.remaining_hours = o.from(now, true);
                    console.log('closed');
                }
            }
        }
        res.json({success: true, dis: d})
    });
};

//get the weed menu for a dispensary page
serviceController.getWeedMenu = function getWeedMenu(req, res) {
    "use strict";
    Dispensary.findOne({'pageInfo.slug': req.body.dispensary}).exec(function(err, wm) {
        if(err) {
            console.log(err);
            res.json({success: false, error: err});
            return;
        }
        var weedMenu = wm.weedMenu;
        for(var i = 0; i < weedMenu.length; i++) {
            var updatedMoment = moment(weedMenu[i].updated_at);
            var now = moment();
            var from = updatedMoment.from(now);
            weedMenu[i].updated = from;
        }
        res.json({success: true, wm: weedMenu})
    });


};
//check for available urls
serviceController.checkSlug = function(req, res) {
    "use strict";
    Dispensary.findOne({'pageInfo.slug': req.body.slug}).exec(function(err, result) {
        if(err) {
            res.json({success: false, error: err});
            return;
        }
        if(result === null) {
            res.json({success: true, name: 'available'});
        } else {
            res.json({success: true, name: 'unavailable'});
        }
    })
};
serviceController.createDispensaryPage = function(req, res) {
    "use strict";
    //session check
    if(!req.user) {
        res.json({success: false, error: 'session timed out'});
        return;
    }
    //data aggregation
    var userData = {};
    var dispensaryData = {};
    var data = req.body;
    var obj = {
        //root search data
        "pageInfo" : {
            "_raise"           : false,
            "address"          : data.address,
            "avatar"           : "http://res.cloudinary.com/thcmaps/image/upload/c_fill,h_100,w_100/lxqmklsiebhj4vffkf63",
            "city"             : data.city,
            "feature_level_raw": 0,
            "has_testing"      : false,
            "id"               : data.slug,
            "is_delivery"      : (data.isDelivery === 'on') ? true : false,
            "latitude"         : Number(data.lat),
            "longitude"        : Number(data.lng),
            "name"             : data.name,
            "phone_number"     : data.phone,
            "pretty_url"       : "/dispensary/" + data.slug,
            "review_count"     : 0,
            "slug"             : data.slug,
            "state"            : data.state,
            "type"             : "dispensary",
            "zip_code"         : data.zip
        },
        //geo location
        "loc"      : {
            "lat": data.lat,
            "lng": data.lng
        },
        //for auth
        "pageOwner": req.user._id
    };

    User.findOne({_id: req.user.id}).exec(function(err, result) {
        console.log(err);
        console.log(result);
        userData = result;
        if(result.dispensaryCredits > 0) {
            makeDispensary();
        }
    });


    function makeDispensary() {
        var nDispensary = new Dispensary(obj);

        nDispensary.save(function(err, result) {
            if(err) {
                res.json({success: false, error: err});
                return;
            }
            dispensaryData = result;
            updateUser();
        });
    }

    function updateUser() {
        var userDispensaryObj = {};
        var dispensaryId = '';
        var dispensarySlug = ''
        for(var i = 0; i < userData.dispensaries.length; i++) {
            if(userData.dispensaries[i].slug === 'undefined') {
                console.log('dispensaryData : ', dispensaryData);
                userDispensaryObj = userData.dispensaries[i];
                userDispensaryObj.dispensaryId = dispensaryData._id;
                userDispensaryObj.slug = dispensaryData.pageInfo.slug;

                dispensaryId = dispensaryData._id;
                dispensarySlug = dispensaryData.pageInfo.slug;

                console.log('userDispensaryObj : ', userDispensaryObj);
                update();
            }
        }
        function update() {
            User.update({_id: req.user.id, 'dispensaries.slug': 'undefined' }, {$set: {dispensaryCredits: 0, 'dispensaries.$.dispensaryId': dispensaryId, 'dispensaries.$.slug': dispensarySlug}})
                .exec(function(err, result) {
                    if(err) {
                        res.json({success: false, error: err})
                    }
                    console.log(err);
                    console.log(result);
                    res.json({success: true, redirect: data.slug});
                });
        }


    }


};


function getDistance(disp, locationObj) {
    lat1 = locationObj.lat;
    lon1 = locationObj.lng;
    if(disp instanceof Array) {
        for(var i = 0; i < disp.length; i++) {
            disp[i].pageInfo.distance = calcDist(disp[i]);
        }
    } else {
        disp.pageInfo.distance = calcDist(disp);
    }
    return disp;
    function calcDist(dispensary) {
        "use strict";
        var loc = dispensary.loc[0];
        var lat2 = loc.lat;
        var lon2 = loc.lng;
        var R = 5969; // mi
        var φ1 = toRad(lat1);
        var φ2 = toRad(lat2);
        var Δφ = toRad((lat2 - lat1));
        var Δλ = toRad((lon2 - lon1));
        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        var distance = Math.round(d * 100) / 100;
        return distance;
    }

    function toRad(n) {
        return n * Math.PI / 180;
    }
}

module.exports = serviceController;

