'use strict';

/*
 * Default rounding is ROUND_HALF_UP
 */
var config = require('config').math;
var Decimal = require('decimal.js');
Decimal.config({ ounding: Decimal[config.roundMode] });

/*
 * Returns a decimal num
 * If we want to round after txn set base to null otherwise set base to 10 to trigger rounding now
 */
exports.decimal = function(num, forceRound) {
	var decimal = new Decimal(num);
	return !forceRound && config.roundAfterTxn ? decimal : decimal.toDecimalPlaces(config.decimalPoints);
}

/*
 * Return string with fixed decimal points
 */
exports.toFixed = function(decimal) { return decimal.toFixed(config.decimalPoints); }

/*
 * Round to 2 decimals
 * TODO: Handle all currency rounding
 */
exports.round = function round(num) { return this.toFixed(this.decimal(num, true)); }

exports.add = function(num1, num2) { return this.toFixed(this.decimal(num1).plus(this.decimal(num2))); }

exports.mul = function(num1, num2) { return this.toFixed(this.decimal(num1).times(this.decimal(num2))); }

exports.div = function(num1, num2) { return this.toFixed(this.decimal(num1).dividedBy(this.decimal(num2))); }

exports.sub = function(num1, num2) { return this.toFixed(this.decimal(num1).minus(this.decimal(num2))); }