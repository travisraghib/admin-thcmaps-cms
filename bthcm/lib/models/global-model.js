/**
 * Created by travisraghib on 8/16/14.
 */
var m = {};
var Recaptcha = require ('recaptcha').Recaptcha;
var recaptcha_PUBLIC_KEY = '6Ldpz_gSAAAAAOOIEAhTlkKK4ViyUTh2HFWpKcir';
var recaptcha_PRIVATE_KEY = '6Ldpz_gSAAAAAJC3S4QbYXPBrqYSqxvE98Z1_H25';


var recaptcha = new Recaptcha (recaptcha_PUBLIC_KEY, recaptcha_PRIVATE_KEY);


m.recaptcha = recaptcha;

module.exports = m;