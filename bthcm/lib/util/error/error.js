'use strict';

function Error(code, message, logLevel) { this.init(code, message, logLevel); }
Error.prototype = {
		init: function(code, message, logLevel) {
			this.code = code;
			this.message = message;
			this.logLevel = logLevel ? logLevel : "debug";
		}
}

var errInfo = {
		GENERAL: {

		}
}

exports.getError = function getError(indexString, msgInput) {
		var indexes = indexString.split('.');
		var err = errInfo;
		try {
			indexes.forEach(function(index) {
				err = err[index];
				if (!err) { throw new Error("Invalid Error Index: " + indexString); }
			});
		} catch (x) {
			err = errInfo.GENERAL.GENERIC;
		}
		var error = new Error(err[0], err[1], err[2]);
		
		
		if (msgInput === null) { msgInput = ''; }
		if (typeof msgInput === "object") {
			var innerMsg = '';
			if (msgInput.msg) {
				innerMsg = msgInput.msg + ": ";
				msgInput = msgInput.params;
			}
			msgInput = innerMsg + JSON.stringify(msgInput, function(key, value) { 
				return (key === "query" && (!value || Object.keys(value).length === 0)) ? undefined : value; 
			}).replace(/\"/g, '');
		}
		
		error.message = error.message.replace("%s", msgInput);
		error.type = indexString;
		return error;
}

exports.getErrorInfo = function getErrorInfo() {
	return errInfo;
}

exports.getErrors = function getErrors(parentErrInfo, parentErrIndex) {
	if (!parentErrInfo) { parentErrInfo = errInfo; }
	var errs = [];
	for (var i in parentErrInfo) {
		var errIndex = parentErrIndex ? parentErrIndex + "." + i : i;
		var childErrInfo = parentErrInfo[i];
		if (childErrInfo.length) {
			err = new Error(childErrInfo[0], childErrInfo[1]);
			err.type = errIndex;
			errs.push(err);
		} else {
			errs = errs.concat(this.getErrors(childErrInfo, errIndex));
		}
	}
	return errs;
}