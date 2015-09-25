'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var apiRoutes = require('./routes/api/index');
var mongoose = require('mongoose');
var passport = require('passport');
var session      = require('express-session');
var configDB = require('config').db;
var namespace = require('./lib/util/namespace.js').create('namespace');
var sessionConf = require('./lib/session/session.js');


var errorLogger = require('./lib/util/logger.js').Logger();
var favicon = require('serve-favicon');
var errHandler = require('./lib/util/error/errorHandler.js');
var loggingConfig = require('config').logging;
var app = express();

//Mongodb
mongoose.connect(configDB.mongo);

//express setup
app.enable('trust proxy');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

//session and auth
app.use(session({ secret: 'pieTheDoberman', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


//favicon
//app.use(favicon('public/favicon/favicon.ico'));


if (app.get('env') !== "production") {
    //docs and public folder setup, only in non production environments
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use('*/public/', express.static(path.join(__dirname, 'public')));
}

/*
 * Setup variables that persist for the request
 * Used in logging and outgoing requests
 */
app.use(function(req, res, next) {
    var time = new Date().getTime();
    var gtid = req.get("X-Transaction-Ref");
    var client = req.get("SSL_CLIENT_S_DN");

    namespace.bindEmitter(req);
    namespace.bindEmitter(res);
    namespace.run(function() {
        namespace.set('reqTracking', {
            gtid: (gtid ? gtid : time + '-' + Math.floor(Math.random() * (99999 - 10000) + 10000)),
            client: (client ? client : req.get("user-agent")),
            remote_address: req.ip
        });
        req.start_timestamp = time;
        req.baseURL = req.protocol + "://" + req.get('Host') + req.path;
        if (req.path !== "/services/v1/health") {
            var json = errorLogger.generateBasicRequestLogData(req);
            json.headers = req.headers;
            errorLogger.debug("Request Received", json);
        }
        next();
    });
});
//routing
app.use('/', sessionConf);
app.use("/api", apiRoutes);

//app.use("/callback/v1", v1CallbackRoutes);
//
//app.use(function(err, req, res, route) {
//    errorLogger.error("THCMAPS.EXCEPTION_ROUTE", { pid: process.pid }, err);
//    var thcmapsErr = errHandler.getError("GENERAL.INTERNAL_SERVER", err.message, null, 500);
//
//    if (loggingConfig.exitOnError) { process.send("disconnect"); }
//    if (!res.headersSent) {
//        res.set("Connection", "close");
//        res.status(thcmapsErr.statusCode).send({ error: thcmapsErr });
//        req.status_code = thcmapsErr.statusCode;
//        errorLogger.logIncomingRequest(req, { error: thcmapsErr });
//    }
//});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    res.status(404).send({error: {message: "Not Found"}});
});


module.exports = app;
