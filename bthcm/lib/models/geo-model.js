/**
 * Created by travisraghib on 8/17/14.
 */
//deps
var Dispensary = require ('./db/DispensaryModel');
var Doctor = require ('./db/doctorModel');


//mod
var geo = {};


/**
 * New stuff get simple disps
 * @param req
 * @param res
 */
geo.simpleVendors = function (req, res){
    "use strict";
    "use strict";
    var lat = req.session.locationObj.lat;
    var lng = req.session.locationObj.lng;
    var query = {'loc': {$near: [lat, lng], $maxDistance: 4000}};
    Dispensary.find (query)
        .select ('loc')
        .limit (250)
        .exec (function (err, results) {
            if (err) {
                res.status(400).end();
            }
            res.json (results);
    })
};
geo.filteredVendors = function(req, res, next){
    "use strict";
    console.log(36)
    var filters = JSON.parse(req.query.filters),
        skip  = req.query.skip || 0,
        openOptions = (!req.query.openOptions) ? req.query.openOptions : JSON.parse(req.query.openOptions),
        position = JSON.parse(req.query.position),
        query = {'loc': {$near: [position.lat, position.lng]}},
        deliveries = filters.deliveries,
        retail = filters.retailLocations,
        testing = filters.testing,
        open = filters.open,
        isList = (req.route.path === '/filteredvendorlist'),
        select,
        limit;

    console.log('skip : ', skip);
    //building query object
    if (!deliveries) {
        query['pageInfo.is_delivery'] = false;
    }
    if (!retail) {
        query['pageInfo.is_delivery'] = true;
    }
    if (testing) {
        query['pageInfo.has_testing'] = true;
    }
    if (open) {
        var day = Number(openOptions.day);
        var mtime = Number(openOptions.mtime);
        query['pageInfo.hours'] = {
            '$elemMatch' : {
                day_order : day,
                m_opening : {
                    $lt : mtime
                },
                m_closing : {
                    $gt : mtime
                }
            }
        };
    }
    console.log('req.route.path : ', req.route.path);
    console.log('isList : ', isList);
    if (!isList) {
        select = 'loc pageInfo.is_delivery pageInfo.has_testing';
        limit = 250;
    }else if(isList){
        select = '_id pageInfo.name pageInfo.slug pageInfo.has_testing ' + 'pageInfo.is_delivery pageInfo.rating pageInfo.reviews_count ' + 'pageInfo.phone_number pageInfo.avatar_url ' + 'pageInfo.city pageInfo.address pageInfo.state pageInfo.zip_code ' + 'loc';
        limit = 10;
    }

    Dispensary.find (query)
        .select (select)
        .skip(skip*10)
        .limit (limit)
        .exec (
            function (err, results) {
                if (err) {
                    console.log(err);
                    res.send(400).end();
                }
                console.log(results.length)
                res.send(results);
                console.log('total results : ', results.length);
        })
};



/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
geo.landingDispensaries = function landingDispensaries (req, res) {

    req.session.options = req.body.options;
    searchDispensaries (req, res, req.session.locationObj.search.lat, req.session.locationObj.search.lng);
};
geo.getDoctors = function getDoctors (req, res) {
    "use strict";
    var nResults = 10;
    var docSkip = (req.body.options.currPage) ? req.body.options.currPage * nResults : 0;
    var lat = req.session.locationObj.lat;
    var lng = req.session.locationObj.lng;
    var query = {'loc': {$near: [lat, lng], $maxDistance: 4000}};

    Doctor.find(query)
        .skip(docSkip)
        .limit(10)
        .select ('_id pageInfo.name pageInfo.slug pageInfo.has_testing ' + 'pageInfo.is_delivery pageInfo.rating pageInfo.reviews_count ' + 'pageInfo.phone_number pageInfo.avatar_url ' + 'pageInfo.city pageInfo.address pageInfo.state pageInfo.zip_code ' + 'loc')
        .exec(function(err, docs){
            if(err){
                console.log(err);
                res.json({success : false});
                return;
            }

            var doctorsWithDistance = getDistance (docs, req.session.locationObj);
            res.json ({userData: req.session.locationObj, docs: doctorsWithDistance});
        })
};
geo.searchVendors = function(req, res){
    "use strict";
    console.log(req)
};
geo.getVendors = function(req, res){
    "use strict";
    console.log(req.cookies.searchOptions);
    console.log(req.session);


    var lat = req.session.locationObj.lat;
    var lng = req.session.locationObj.lng;
    var options = req.cookies.searchOptions;
    var query = {'loc': {$near: [lat, lng], $maxDistance: 4000}};

    Dispensary.find (query).select ('loc -_id').limit (250).exec (function (err, results) {
        if (err) {
            res.json ({failed: true})
        }
        res.json ({dots: results});
    })


};
geo.getDots = function getDots (req, res) {
    "use strict";
    var lat = req.session.locationObj.lat;
    var lng = req.session.locationObj.lng;
    var options = req.session.options;
    var query = {'loc': {$near: [lat, lng], $maxDistance: 4000}};

//    var deliveries = options.deliveries;
//    var retail = options.retailLocations;
//    var testing = options.testing;
//
//    if (deliveries === 'false') {
//        query['pageInfo.is_delivery'] = false;
//    }
//    //intentional casting
//    if (retail === 'false') {
//        query['pageInfo.is_delivery'] = true;
//    }
//    if (testing === 'true') {
//        query['pageInfo.has_testing'] = true;
//    }
    //    var s = new Date();
    Dispensary.find (query).select ('loc').limit (1000).exec (function (err, results) {
            if (err) {
                res.json ({failed: true})
            }
            //            var n = new Date();
            //            console.log(s - n);
            res.json ({dots: results});
        })
};
geo.getDispensaryByLatLng = function getDispensaryByLatLng (req, res) {
    "use strict";
    var lat = req.body.lat;
    var lng = req.body.lng;
    var query = {'loc': {$near: [lat, lng], $maxDistance: 1}};
    Dispensary.findOne (query).select ('_id pageInfo.name pageInfo.slug pageInfo.has_testing ' + 'pageInfo.is_delivery pageInfo.rating pageInfo.reviews_count ' + 'pageInfo.phone_number pageInfo.avatar_url ' + 'pageInfo.city pageInfo.address pageInfo.state pageInfo.zip_code loc ')
        .exec (function (err, result) {
            if (err) {
                res.json ({success: false})
            }
            var vendorWithDistance = getDistance (result, req.session.locationObj);
            res.json ({success: true, d: vendorWithDistance})
        })
};


geo.dispensariesByLocation = function dispensariesByLocation (req, res) {
    var lat = req.session.locationObj.lat;
    var lng = req.session.locationObj.lng;

    console.log(lat, ' : ', lng)

    searchDispensaries (req, res, lat, lng);
};

geo.setSearchHome = function setSearchHome (req, res) {
    if (req.body && req.body.lat && req.body.lng) {
        req.session.locationObj.formatted_address = req.body.formatted_address;
        req.session.locationObj.lat = req.body.lat;
        req.session.locationObj.lng = req.body.lng;

        req.session.locationObj.search.lat = req.body.lat;
        req.session.locationObj.search.lng = req.body.lng;

        console.log('ssh : ', req.session.locationObj.search.lat);

        res.json ({success: true});
    } else {
        res.json ({success: false});
    }
};
geo.setSearchPosition = function setSearchPosition(req, res){
    "use strict";
    if (req.body && req.body.lat && req.body.lng) {
        req.session.locationObj.search.lat = req.body.lat;
        req.session.locationObj.search.lng = req.body.lng;
        res.json ({success: true});
    }else{
        res.json ({success: false});
    }
};

//private
function searchDispensaries (req, res, lat, lng) {
    //todo implement result per page

    console.log('priv sd : ', req.session.locationObj.search.lat);
    console.log(req.body);

    var nResults = req.body.options.resultsPerPage;
    var docSkip = (req.body.options.currPage) ? req.body.options.currPage * nResults : 0;
    var query = {'loc': {$near: [lat, lng]}};

    var deliveries = req.body.options.deliveries;
    var retail = req.body.options.retailLocations;
    var testing = req.body.options.testing;
    var open = req.body.options.open;

    if (deliveries === 'false') {
        query['pageInfo.is_delivery'] = false;
    }
    if (retail === 'false') {
        query['pageInfo.is_delivery'] = true;
    }
    if (testing === 'true') {
        query['pageInfo.has_testing'] = true;
    }
    if(open === 'true'){
        var openOpt = req.body.options.openOptions;
        var day = Number(openOpt.day);
        var mtime = Number(openOpt.mtime);
        console.log(mtime);
        console.log('asdf');
        query['pageInfo.hours'] = {
            '$elemMatch' : {
                day_order : day,
                m_opening : {
                    $lt : mtime
                },
                m_closing : {
                    $gt : mtime
                }
            }
        };

    }

    Dispensary.find (query).select ('_id pageInfo.name pageInfo.slug pageInfo.has_testing ' + 'pageInfo.is_delivery pageInfo.rating pageInfo.reviews_count ' + 'pageInfo.phone_number pageInfo.avatar_url ' + 'pageInfo.city pageInfo.address pageInfo.state pageInfo.zip_code ' + 'loc')
        .skip (docSkip)
        .limit (nResults)
        .exec (function (err, results) {
            if (err) {
                console.log ('err : ', err);
                res.json ({success: false});
                return;
            }
            if (!results) {
                res.json ({success: false});
                return;
            }
            var dispensariesWithDistance = getDistance (results, req.session.locationObj);
            res.json ({userData: req.session.locationObj, dispensaries: dispensariesWithDistance});
        });
}

//distance from user calculation
function getDistance (disp, locationObj) {
    lat1 = locationObj.lat;
    lon1 = locationObj.lng;
    if (disp instanceof Array) {
        for (var i = 0; i < disp.length; i++) {
            disp[i].pageInfo.distance = calcDist (disp[i]);
        }
    } else {
        disp.pageInfo.distance = calcDist (disp);
    }
    return disp;
    function calcDist (dispensary) {
        "use strict";
        var loc = dispensary.loc[0];
        var lat2 = loc.lat;
        var lon2 = loc.lng;
        var R = 5969; // mi
        var φ1 = toRad (lat1);
        var φ2 = toRad (lat2);
        var Δφ = toRad ((lat2 - lat1));
        var Δλ = toRad ((lon2 - lon1));
        var a = Math.sin (Δφ / 2) * Math.sin (Δφ / 2) + Math.cos (φ1) * Math.cos (φ2) * Math.sin (Δλ / 2) * Math.sin (Δλ / 2);
        var c = 2 * Math.atan2 (Math.sqrt (a), Math.sqrt (1 - a));
        var d = R * c;
        var distance = Math.round (d * 100) / 100;
        return distance;
    }

    function toRad (n) {
        return n * Math.PI / 180;
    }
}

module.exports = geo;
