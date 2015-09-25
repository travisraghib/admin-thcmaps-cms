'use strict';

var createNamespace = require('continuation-local-storage').createNamespace;
var getNamespace = require('continuation-local-storage').getNamespace;

exports.create = function create(name) { return createNamespace(name); }
exports.get = function get(name) { return getNamespace(name); }
exports.getStoredInfo = function getStoredInfo(namespaceName, varName) {
	var ns = this.get(namespaceName);
	return ns ? ns.get(varName) : null;
}