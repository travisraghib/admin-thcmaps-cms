/**
 * Created by travisraghib on 5/28/14.
 */
// app/models/user.js
// load the things we need
var mongoose = require ('mongoose');
var bcrypt = require ('bcrypt-nodejs');

//==============================================================================
// Schema for user model
//==============================================================================
var userSchema = mongoose.Schema ({
    username: String,
    reviewCount : Number,
    rating : Number,
    following : [],
    reviews : [{
        vendorId : String,
        reviewId : String
    }],
    signUpDate    : {
        type: Date,
        default: Date.now ()
    },

    local   : {
        email   : String,
        password: String
    },
    privileges : {
        slug : String
    },
    dispensaries : [{
        dispensaryId : String,
        name : String,
        slug : String,
        brainTreeId : String,
        isCurrent : Boolean

    }],
    //strictly for creating new dispensaries

    dispensaryCredits : Number


});
//==============================================================================
// methods ======================
//==============================================================================
// generating a hash
userSchema.methods.generateHash = function (password)
{
    return bcrypt.hashSync (password, bcrypt.genSaltSync (8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password)
{
    return bcrypt.compareSync (password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model ('users', userSchema);