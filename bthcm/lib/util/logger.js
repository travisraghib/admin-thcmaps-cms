'use strict';

var winston = require('winston');
var loggingConfig = require('config').logging;
var util = require('./util.js');
var namespace = require('./namespace.js');
var uuid = require('node-uuid');

exports.Logger = function() { return new Logger(); }

var getTransports = function(logPath) {
	var transports = [new winston.transports.DailyRotateFile({ filename: logPath, level: loggingConfig.level, maxsize: loggingConfig.maxFileSize })];
	if (loggingConfig.showInConsole) { transports.push(new winston.transports.Console({ level: 'error' })); }
	return transports;
};

var getLogger = function(logName) {
	if (!logName) { return false; }
	var logger = new winston.Logger({ transports: getTransports(loggingConfig.directory_path + logName) });
	logger.emitErrs = false;
	return logger;
}

function Logger() { this.init(); }
Logger.prototype = {
		init: function() {
			this.applicationLogger = getLogger(loggingConfig.application_log);
			this.payloadLogger = getLogger(loggingConfig.payload_log);
			this.callTimingLogger = getLogger(loggingConfig.call_timing_log);

			this.skipLogging = loggingConfig.skipLogging || process.env.NODE_ENV === "test";
		},
		generateLogTemplate: function() {
			var reqTracking = namespace.getStoredInfo('namespace', 'reqTracking');
			return reqTracking ? util.cloneJson(reqTracking) : {};
		},
		generateEventId: function(logData) { logData.eid = uuid.v1(); },
		setDuration: function(logData) {
			if (logData.start_timestamp) {
				if (!logData.end_timestamp) { logData.end_timestamp = util.getCurrentTime(); }
				logData.duration = logData.end_timestamp - logData.start_timestamp;
			}
		},
		logCallTiming: function(logData) {
			//Log call timing if logData has type which implies it's logData is from payload info
			if (this.callTimingLogger && logData.duration && logData.type) {
				this.callTimingLogger.log("info", "Call Timing", {gtid: logData.gtid, type: logData.type, method: logData.method, endpoint: logData.endpoint, duration: logData.duration });
			}
		},
		log: function(msg, json, logger, logType) {
			if (!this.skipLogging && logger !== false) {
				if (!logger) { logger = this.applicationLogger; }
				if (!logType) { logType = "info"; }
				var logData = this.generateLogTemplate();
				logData.subject = msg;
				util.joinJson(logData, json);
				this.setDuration(logData);
				this.generateEventId(logData);
				logger.log(logType, msg, logData);
				this.logCallTiming(logData);
			}
		},
		debug: function(msg, json) { this.log(msg, json, null, "debug"); },
		info: function(msg, json) { this.log(msg, json); },
		error: function(msg, json, error) {
			if (!error) { error = { message: "Unknown Error", code: "0" } }
			var err = {
					errormessage: error.message,
					errorcode: error.code,
					errorstack: error.stack
			};
			if (json) {
				util.joinJson(json, err);
			} else {
				json = err;
			}
			this.log(msg, json, null, "error");
		},
		generateBasicRequestLogData: function(req) {
			var logData = req.logTemplate ? req.logTemplate : {};
			logData.endpoint = req.baseURL;
			logData.method = req.method;
			logData.status_code = req.status_code;
			logData.start_timestamp = req.start_timestamp;
			return logData;
		},
		addPayloadRequestLogDataToJson: function(json, req, requestType, response) {
			json.type = requestType;
			json.query_string = req.query;
			json.retried = req.retried;
			json.request_body = req.body;
			json.response_body = response && typeof response === "string" ? response.replace(/(\r\n|\n|\r)/gm,'') : response;
            json.timeout = req.timeout;
            json.socket_wait_time = req.socketWaitTime || 0;
			return json;
		},
		logIncomingRequest: function(req, response) {
			var json = this.generateBasicRequestLogData(req);
			var logType = req.status_code.toString().match(/^2\d+/) ? "info" : "error";
			this.log(req.subject || "Request", json, null, logType);
			this.addPayloadRequestLogDataToJson(json, req, "INCOMING", response);
			this.log(req.subject || "Request", json, this.payloadLogger, logType);
		},
		logOutgoingRequest: function(req, res, isValidStatusCode) {
			req.status_code = res.statusCode;
			var json = this.generateBasicRequestLogData(req);
			this.addPayloadRequestLogDataToJson(json, req, "OUTGOING", res.body || res.error);
			json.response_headers = res.headers;
			var logType = isValidStatusCode ? "info" : "error";
			this.log(req.subject || "API Request", json, this.payloadLogger, logType);
		}
}
