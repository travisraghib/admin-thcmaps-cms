/**
 * Created by travisraghib on 6/9/14.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
    user : {
        id : String,
        name : String

    },
    dispensary : {
        id: String,
        name : String,
        slug : String
    },

    review :
            {
                date    : {
                    type   : Date,
                    default: Date.now ()
                },
                overall : Number,
                quality : Number,
                price   : Number,
                staff   : Number,
                location: Number,
                title   : String,
                body    : String,
                replies : [{
                    replyBody : String,
                    replyUsername : String,
                    replyUserId : String
                }]
            }
});

module.exports = mongoose.model('reviews', ReviewSchema );
