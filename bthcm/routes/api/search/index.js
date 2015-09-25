'use strict';

var express = require('express');
var router = express.Router();
var service = require('./service');

//get
router.get ('/location', service.clientLocation);
router.get ('/simpleVendors', service.simpleVendors);
router.get ('/infowindowdata', service.infoWindowData);
router.get ('/filteredvendors', service.filteredVendors);
router.get ('/filteredvendorlist', service.filteredVendors);

//post
router.post ('/setsearchhome', service.setSearchHome);
router.post ('/setsearchaddress', service.setSearchAddress);

module.exports = router;