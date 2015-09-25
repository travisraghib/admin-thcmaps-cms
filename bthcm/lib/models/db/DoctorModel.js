/**
 * Created by travisraghib on 5/18/14.
 */
var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var DoctorSchema = new Schema ({
    _id        : String,
    pageOwner  : String,
    pageInfo   : {
        is_open :Boolean,
        remaining_hours : String,
        distance   : String,
        "id" : Number,
        "name" : String,
        "name_phrase" : String,
        "body" : String,
        "intro_body" : String,
        "published" : Boolean,
        "feature_level" : String,
        "feature_level_raw" : Number,
        "package_level" : String,
        "package_level_raw" : Number,
        "marker" : String,
        "feature_order" : Number,
        "featured_in_zips" : [ ],
        "address" : String,
        "city" : String,
        "city_phrase" : String,
        "state" : String,
        "zip_code" : String,
        "has_gpen" : Boolean,
        "has_handicap_access" : Boolean,
        "has_security_guard" : Boolean,
        "has_lounge" : Boolean,
        "has_weedporn" : Boolean,
        "has_videos" : Boolean,
        "has_testing" : Boolean,
        "has_dixieelixirs" : Boolean,
        "eighteen_plus" : Boolean,
        "twenty_one_plus" : Boolean,
        "accepts_credit_cards" : Boolean,
        "is_delivery" : Boolean,
        "is_recreational" : Boolean,
        "license_type" : String,
        "lat_lon" : String,
        "latitude" : Number,
        "longitude" : Number,
        "sub_region_id" : Number,
        "sub_region_name" : String,
        "sub_region_slug" : String,
        "super_region_id" : Number,
        "super_region_name" : String,
        "super_region_slug" : String,
        "payment_date" : String,
        "slug" : String,
        "cached_hits" : Number,
        "time_zone_identifier" : String,
        "time_zone" : String,
        "avatar_url" : String,
        "rating" : Number,
        "reviews_count" : Number,
        "phone_number" : String,
        "updated_at" : Date,
        "last_update": String,
        "user_id" :Number,
        "video_url" : String,
        "hours" : [
            {
                is_today : Boolean,
                "day_order" : Number,
                "opening_time" : String,
                "closing_time" : String,
                "day_of_the_week" : String
            }
        ]

    },
    loc        : Array,
    hours      : Object,
    weedMenu   : Object,
    avatar     : String,
    rating     : Number,
    reviewCount: Number,
    followed   : [],
    reviews    : [
        {
            userId  : String,
            reviewId: String
        }
    ],
    pictures   : [
        {
            photo: {
                id  : String,
                src : String,
                date: Date
            }
        }
    ]

});

module.exports = mongoose.model ('doctors', DoctorSchema, 'doctors');
