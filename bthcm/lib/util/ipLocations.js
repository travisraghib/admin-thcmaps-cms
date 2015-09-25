/**
 * Created by travisraghib on 5/12/14.
 */
var request = require('request');
var serverUrl = "http://freegeoip.net/json/";

exports.setUrl = function(u) {
    serverUrl = u;
};

exports.getUrl = function() {
    return serverUrl;
};
exports.request = function(){
    return request;
};

exports.getLocation = function(ip, callback) {
    request.get({
        url: serverUrl + ip,
        json: true,
        timeout: 1000
    }, function(err, r, loc) {
        if (err) {
            console.log(err);
            loc = { ip: '174.67.230.97',
                country_code: 'US',
                country_name: 'United States',
                region_code: 'CA',
                region_name: 'California',
                city: 'Irvine',
                zipcode: '92612',
                latitude: 33.6378,
                longitude: -117.8095,
                metro_code: '803',
                area_code: '949' };

            return callback(err, loc);
        }
        if (r.statusCode != 200) {
            console.log('200');
            return callback("ipLocation : r.statusCode != 200 most likely throttled");
        }
        return callback(null, loc);
    });
};




