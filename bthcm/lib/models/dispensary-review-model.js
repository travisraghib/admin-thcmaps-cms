/**
 * Created by travisraghib on 8/16/14.
 */
//deps
var Dispensary = require ('./db/DispensaryModel');
var Review = require ('./db/ReviewModel');
var User = require ('./db/UserModel');

//mod
var dispensaryReview = {};


dispensaryReview.review = function review (req, res){
    console.log('review sbumit');
    if (!req.user)
    {
        //todo make this an object
        res.json ({success: false, error: 'Please login to post a review'});
        console.log ('User not logged in');
        return;
    }
    var user = req.user;
    var postData = req.body;
    //store users _id
    var userId = user._id;
    var userName = user.username;
    //compose review
    var quality = Number (postData.quality);
    var price = Number (postData.price);
    var staff = Number (postData.staff);
    var location = Number (postData.location);

    var overall = (quality + price + staff + location ) / 4;
    var title = postData.title;
    var body = postData.body;
    var dispensaryId = postData.dispensaryId;
    var dispensaryName = postData.dispensaryName;
    var dispensarySlug = postData.slug;

    var review = new Review ();
    //user | dispensary - info
    review.user.id = userId;
    review.user.name = userName;
    review.dispensary.name = dispensaryName;
    review.dispensary.id = dispensaryId;
    review.dispensary.slug = dispensarySlug;
    //rating
    review.review.overall = overall;
    review.review.quality = quality;
    review.review.price = price;
    review.review.staff = staff;
    review.review.location = location;
    //actual review
    review.review.title = title;
    review.review.body = body;
    console.log(review);
    review.save (function (err, rev)
    {
        console.log('save..');
        if (err){
            res.json({success:false});
            console.log (err);
            return;
        }

        res.json ({success: true});

        var userReview = {$inc: {reviewCount: 1, rating: overall}, $push: {reviews: {reviewId: rev._id}}};
        //update user
        User.update ({_id: userId}, userReview)
            .exec (function (err, updateReviewArrayResults)
        {
            console.log ('err : ', err);
            console.log ('user results : ', updateReviewArrayResults);
        });
        //add property to increment the dispensary rating score (performance increase? one les lhr)

        var dispReview = {$inc: {'pageInfo.reviews_count': 1, rating: overall}, $push: {reviews: {reviewId: rev._id}}};
        //update dispensary

        Dispensary.findOne ({_id: dispensaryId })
            .select('reviews pageInfo')
            .exec (function (err, dis)
            {
                if(err){
                    console.log(err);
                    return;
                }

                var tScore = (dis.pageInfo.rating * dis.pageInfo.reviews_count) +overall;;
                dis.pageInfo.reviews_count ++;
                dis.pageInfo.rating = tScore/dis.pageInfo.reviews_count;
                dis.reviews.push({reviewId: rev._id});
                dis.save(function(err){
                    if(err){
                        console.log(err);
                    }
                });

        })


    });
};
dispensaryReview.deleteReview = function (req, res){
    "use strict";
    //if no user do nothing
    if (!req.user || req.user._id != req.body.userId)
    {
        console.log ('error deleting review');
        res.json ({success: false, error: 'User not logged in!'});
        return;
    }
    console.log (req.body);
    console.log (req.headers);

    //data
    var data = req.body;
    var userId = data.userId;
    var reviewId = data.reviewId;
    var dispensaryId = data.dispensaryId;
    var overAllScore = Number (data.overAllScore);
    var cmdCount = 0;
    var updateObj = {
        $inc : {
            rating     : (overAllScore * -1),
            reviewCount: -1
        },
        $pull: {
            reviews: {reviewId: reviewId}
        }
    };

    //mongo updates/remove
    var rev = Review.remove ({_id: reviewId})
    var revProm = rev.exec (function (err, result)
    {
        console.log ('err : ', err);
        console.log ('result : ', result);
        res.json ({success: true});
    });

    var dis = Dispensary.update ({_id: dispensaryId}, updateObj)
    var disProm = dis.exec (function (err, result)
    {
        console.log ('err : ', err);
        console.log ('result : ', result);
    });
    var usr = User.update ({_id: userId}, updateObj)
    var usrProm = usr.exec (function (err, result)
    {
        console.log ('err : ', err);
        console.log ('result : ', result);
    });


};
dispensaryReview.reply = function (req, res){
    if (!req.user)
    {
        //todo make this an object
        res.json ({success: false, error: 'Please login to post a review'});
        console.log ('User not logged in');
        return;
    }
    else
    {
        var reviewId = req.body.reviewId;
        var reviewUserId = req.body.userId;
        var replyBody = req.body.replyBody;
        var replyUsername = req.user.username;
        var replyUserId = req.user._id;

        var revieReplywObj = {
            replyBody    : replyBody,
            replyUsername: replyUsername,
            replyUserId  : replyUserId
        };

        Review.update ({_id: reviewId}, {$push: {'review.replies': revieReplywObj}})
            .exec (function (err, updateRes)
        {
            return res.json ({success: true});
        });
    }
};

module.exports = dispensaryReview;