/**
 * Created by travisraghib on 8/16/14.
 */
//deps
var Dispensary = require ('./db/DispensaryModel');
var responseHolder;
//mod
var editDispensaryModel = {};

editDispensaryModel.editHours = function (req, res) {
    "use strict";
    {
        var currDispensary = req.param ('name');
        var data = req.body;
        var id = data.id;
        var hoursObj = {
            'sunday'   : {
                'hours': {
                    'open' : data.sundayOpen,
                    'close': data.sundayClose
                }
            },
            'monday'   : {
                'hours': {
                    'open' : data.mondayOpen,
                    'close': data.mondayClose
                }
            },
            'tuesday'  : {
                'hours': {
                    'open' : data.tuesdayOpen,
                    'close': data.tuesdayClose
                }
            },
            'wednesday': {
                'hours': {
                    'open' : data.wednesdayOpen,
                    'close': data.wednesdayClose
                }
            },
            'thursday' : {
                'hours': {
                    'open' : data.thursdayOpen,
                    'close': data.thursdayClose
                }
            },
            'friday'   : {
                'hours': {
                    'open' : data.fridayOpen,
                    'close': data.fridayClose
                }
            },
            'saturday' : {
                'hours': {
                    'open' : data.saturdayOpen,
                    'close': data.saturdayClose
                }
            }
        };

        Dispensary.update ({_id: id}, {$set: {hours: hoursObj}}).exec (function (err, results) {
            if (err) {
                console.log (err);
            }
            console.log (results);
            res.redirect ('/edit/dispensary/' + currDispensary);
        })
    }

};
//****************************************************************************
//todo make this action edit contact info instead of phone *******************
//****************************************************************************
editDispensaryModel.editContact = function editContact (req, res) {
    console.log (req.body);
    responseHolder = res;
    var currDispensary = req.param ('name');
    var data = req.body;
    var id = data.id;
    var phone = data.phone;
    var address = data.address;
    var city = data.city;
    var state = data.state;
    var zip = data.zip;

    Dispensary.findOne ({_id: id}).exec (function (err, result) {
        "use strict";
        //seems hacky but actually the cleanest way to pull this off
        //need the entire pageInfo object before making updates to certain parts of it
        //could fix this issue by changing shcema
        var pageInfo = result.pageInfo;
        pageInfo.zip_code = zip;
        pageInfo.state = state.toString ();
        pageInfo.phone_number = phone;
        pageInfo.city = city;
        pageInfo.address = address;
        //update
        Dispensary.update ({_id: id}, {$set: {'pageInfo': pageInfo}}).exec (function (err, results) {
            if (err) {
                console.log (err);
            }
            console.log (results);
            res.redirect ('/edit/dispensary/' + currDispensary);
        });
    });
};

editDispensaryModel.editMenuItem = function (req, res) {
    "use strict";
    responseHolder = res;
    var data = req.body;
    console.log (data.menuItemId);
    var query = {_id: req.body.dispensaryId, 'weedMenu.name': data.name};
    console.log (query);
    var update = {
        'weedMenu.$.name'                 : data.name,
        'weedMenu.$.description'          : data.description,
        'weedMenu.$.menu_item_category_id': data.category,
        'weedMenu.$.price_unit'           : data.unit,
        'weedMenu.$.price_half_gram'      : data.halfGram,
        'weedMenu.$.price_gram'           : data.gram,
        'weedMenu.$.price_eighth'         : data.eighth,
        'weedMenu.$.price_quarter'        : data.quarter,
        'weedMenu.$.price_half_ounce'     : data.halfOunce,
        'weedMenu.$.price_ounce'          : data.oz,
        'weedMenu.$.updated_at'           : Date.now ()
    };
    console.log (update);
    Dispensary.update (query, {'$set': update}).exec (genericQueryHandler);
};

editDispensaryModel.deleteMenuItem = function (req, res) {
    "use strict";
    responseHolder = res;

    var data = req.body;
    var query = {_id: req.body.dispensaryId};
    var deleteObj = {$pull: {weedMenu: {id: Number (data.menuItemId)}}};
    Dispensary.update (query, deleteObj).exec (genericQueryHandler);
};

editDispensaryModel.addMenuItem = function (req, res) {
    "use strict";
    responseHolder = res;
    var data = req.body;
    console.log (data)
    var query = {_id: req.body.dispensaryId};
    var menuObj = {
        name                 : data.name,
        description          : data.description,
        menu_item_category_id: data.category,
        price_unit           : data.unit,
        price_half_gram      : data.halfGram,
        price_gram           : data.gram,
        price_eighth         : data.eighth,
        price_quarter        : data.quarter,
        price_half_ounce     : data.halfOunce,
        price_ounce          : data.oz,
        updated_at           : Date.now ()
    };
    var findQuery = {_id: req.body.dispensaryId, 'weedMenu.name': data.name};
    Dispensary.find (findQuery).exec (function (err, result) {
        console.log (err)
        console.log (result.length);
        if (result.length === 0) {
            Dispensary.update (query, {'$push': {'weedMenu': menuObj}}).exec (genericQueryHandler);
        } else {
            res.json ({success: false, error: 'duplicate name'});
        }
    })

};

//editDispensaryModel

//editDispensaryModel
function genericQueryHandler (err, response) {
    "use strict";
    if (err) {
        console.log ('edit-dispensary-model error : ', err);
    } else {
        console.log ('edit-dispensary-model response : ', response);
        responseHolder.json ({success: true});
    }

}

module.exports = editDispensaryModel;