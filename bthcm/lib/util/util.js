'use strict';

/*
 * Returns true if json object contains
 * one of the array elements as an index
 */
exports.containsSome = function(json, array) {
	return array.some(function(element, index, array) {
		return json[element] !== null;
	});
};

/*
 * Copy json object to new object
 */
exports.cloneJson = function(json) {
	return JSON.parse(JSON.stringify(json));
}

/*
 * Combines json objects
 * Cycles through second array and sets it on the first
 */
exports.joinJson = function(json1, json2) {
	if (json2 && json1) {
		for (var i in json2) {
			json1[i] = json2[i];
		}
	}
}

/*
 * filters json object
 */
exports.filterJson = function(json, isString) {
	var jsonString = JSON.stringify(json, function(key, value) {
		if (!value) { return undefined; }
		return value;
	});
	return isString ? jsonString : JSON.parse(jsonString);
}

/*
 * traverses json
 * @param path: path through json to find return value
 */
exports.traverseJson = function(json, path) {
	try {
		path.split('.').forEach(function(index) {
			json = json[index];
		});
	} catch(e) {
		return null;
	}
	return json;
}

/*
 * Compares 2 json objects as strings
 */
exports.areJsonObjectsEqual = function(json1, json2) {
	return JSON.stringify(json1) === JSON.stringify(json2);
}

/*
 * Finds an element in array, see Array.prototype.find(), which isn't supported by Chrome yet
 */
exports.arrayFind = function(searchArray, callback) {
	if (!searchArray) { return null; }
	var length = searchArray.length;
	for (var i = 0; i < length; i++) {
		if (callback(searchArray[i])) {
			return searchArray[i];
		}
	}
	return null;
};

/*
 * Forces json value to be an array
 */
exports.forceArray = function(json) {
	if (!json) { return []; }
	if (!json.length) return [json];
	return json;
}

/*
 * Returns current timestamp
 */
exports.getCurrentTime = function getCurrentTime() {
	var date = new Date();
	return date.getTime();
}

/*
 * jsonIndexToXmlTag is a json object mapping the a json index to an xml tag
 * xmlNodes are the xml builder objects to add children to with xml tag
 * json is the json object being converted to xml, we will search for json index
 * returns any children of jsonIndexToXmlTag where json index wasn't in json
 */
exports.convertJsonToXml = function(jsonIndexToXmlTag, xmlNodes, json) {
	var missingChildren = {};
	for (var jsonIndex in jsonIndexToXmlTag) {
		var xmlTagName = jsonIndexToXmlTag[jsonIndex];
		if (json[jsonIndex]) {
			xmlNodes.forEach(function(xmlNode) {
				xmlNode.ele(xmlTagName, json[jsonIndex]);
			});
		} else {
			missingChildren[jsonIndex] = xmlTagName;
		}
	}
	return missingChildren;
}
