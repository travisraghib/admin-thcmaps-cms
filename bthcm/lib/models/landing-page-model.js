/**
 * Created by travisraghib on 8/16/14.
 */

module.exports = function(req, utils, global){
    var loginStatus = req.isAuthenticated ();
    console.log(loginStatus);
    var ipAddr = utils.getIp (req);
    var loginStatus = req.user;
    var obj = {
        ip         : ipAddr,
        isMap      : true,
        isSearch   : true,
        global     : global,
        loginStatus: loginStatus
    };
    return obj;
};