var utils = require ('../util/utils');
var ipLocation = require ('../util/ipLocations.js');

module.exports = function(req, res, next){
    "use strict";
    if (!req.session.locationObj) {
        var ip = utils.getIp (req);
        ipLocation.getLocation (ip, function (err, location) {
            if (!err) {
                req.session.locationObj = location;
                req.session.locationObj.search ={};
                //this is because freegeoip uses 'latitude and longitude instead of lat and lng'
                req.session.locationObj.lat = location.latitude;
                req.session.locationObj.lng = location.longitude;
                req.session.locationObj.formatted_address = location.city + ', ' + location.region_code;
                req.session.locationObj.search.lat = location.latitude;
                req.session.locationObj.search.lng = location.longitude;
            } else {
                console.log ('ip location err');
                //this is incase freegeoip fails... and it does that quite often.

                req.session.locationObj = {
                    ip          : ip,
                    country_code: 'US',
                    formatted_address : "Irvine, CA",
                    country_name: 'United States',
                    region_code : 'CA',
                    region_name : 'California',
                    city        : 'Irvine',
                    zipcode     : '92612',
                    search : {
                        lat         : 33.6378,
                        lng         : -117.8095
                    },
                    lat         : 33.6378,
                    lng         : -117.8095,
                    metro_code  : '803',
                    area_code   : '949'
                };
            }
            next();
        });
    }else{
        next();
    }



};
