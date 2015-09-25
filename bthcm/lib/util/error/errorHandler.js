'use strict';

var util = require('../util.js');
var error = require('./error.js');
var logger = require('../logger.js').Logger();
var self = this;

function PaymentServiceError(errIndex, msgInput, statusCode) {
	this.init(errIndex, msgInput, statusCode);
}
PaymentServiceError.prototype = {
		init: function(errIndex, msgInput, statusCode) {
			var err = error.getError(errIndex, msgInput);
			this.message = err.message;
			this.code = err.code;
			this.type = err.type;
			this.logLevel = err.logLevel;
			this.statusCode = statusCode;
			this.previousErrors = [];
		},
		addPrevErr: function(prevErr) {
			if (!prevErr) { return; }
			if (prevErr.isDeclineError()) { this.code = prevErr.code; }
			if (prevErr.previousErrors.length) {
				if (!this.previousErrors.length) {
					this.previousErrors = prevErr.previousErrors;
				} else {
					prevErr.previousErrors.forEach(function(err) {
						this.previousErrors.push(err);
					}, this);
				}
				delete prevErr.previousErrors;
			}
			this.previousErrors.push(prevErr);
			if (!this.statusCode) { this.statusCode = prevErr.statusCode; }
		},
		getPrevErr: function() {
			var numPrevErrors = this.previousErrors.length;
			return numPrevErrors ? this.previousErrors[numPrevErrors-1] : null;
		},
		getPrevErrType: function() {
			var prevErr = this.getPrevErr();
			return prevErr ? prevErr.type : null;
		},
		isDeclineError: function() {
			return this.code.toString().indexOf("51") === 0;
		},
		getAPIError: function() {
			if (this.previousErrors) {
				this.previousErrors.forEach(function(err) {
					if (err.apiError) { return err.apiError; }
				});
			}
			return null;
		}
}

exports.getError = function getError(errIndex, msgInput, prevErr, statusCode) {
	var err = new PaymentServiceError(errIndex, msgInput, statusCode);
	if (prevErr) { err.addPrevErr(prevErr); }
	if (err.logLevel === "error") {
		logger.error("Generating " + err.type + " Error", null, err);
	} else {
		logger.debug("Generating " + err.type + " Error", {code: err.code, errormessage: err.message});
	}
	
	return err;
};

exports.getInvalidInputError = function getInvalidInputError(errIndex, msgInput) {
	var err = this.getError(errIndex, msgInput, null, 400);
	if (err.code.toString().indexOf("13") === 0) { return err; }
	return this.getError("GENERAL.INVALID.FIELD", msgInput, null, 400);
};

exports.getHealthcheckError = function getHealthcheckError(prevErr) {
	var errIndex = "GENERAL.HEALTH.";
	errIndex += prevErr.statusCode === 504 ? "TIMEOUT" : "RESPONSE";
	var msgInput = prevErr.apiError ? { msg: prevErr.message, params: prevErr.apiError } : prevErr.message;
	return this.getError(errIndex, msgInput, prevErr);
}

exports.getAPIError = function getAPIError(message, prevErr, statusCode) {
	var error = this.getError("API.GENERIC", message, null, statusCode);
	if (prevErr) { error.apiError = prevErr; } else { error.apiError = {message: "Unknown API Error", code: "0"}; }
	logger.error("API Error", null, prevErr);
	return error;
}
