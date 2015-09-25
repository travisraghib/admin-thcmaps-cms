/**
 * Created by travisraghib on 8/16/14.
 */
//deps
var Dispensary = require ('./db/DispensaryModel');
var cloudinary = require ('cloudinary');
var Busboy = require ('busboy');
var fs = require ('fs');
var when = require ('when');
var photoModel = {};

//
//cloudinary.config ({
//    cloud_name: 'thcmaps',
//    api_key   : '561193822645494',
//    api_secret: 'js95o44irG1OQJjp4Cjn7owCP9k'
//});
//

//post new
photoModel.postPhoto = function (req, res)
{
    var fstream;
    var __dirname = 'public/images/uploads/';
    var busboy = new Busboy ({ headers: req.headers });

    req.pipe (busboy);

    busboy.on ('file', function (fieldname, file, filename, encoding, mimetype)
    {
        console.log('filename ', filename);
        fstream = fs.createWriteStream (__dirname + filename);
        fstream.on('error', function(err) { console.log(err); });
        file.pipe (fstream);
        console.log (' file : ', file);
        console.log (' encoding : ', encoding);
        console.log (' mimetype : ', mimetype);

//        upload to cloudinary
//        intentionally nested the asych opperations because we need the result object from the image upload
        var uploader = cloudinary.uploader.upload (__dirname + filename, function (result)
        {
            console.log('asdf');
            console.log(result);
            //delete temp file
            fs.unlink (__dirname + filename, function (err)
            {
                if (err)
                {
                    console.log('err : ', err);
                }
                console.log ('successfully deleted temp file : ', __dirname + filename);
            });
            var update = {$push: {pictures: {photo: {
                id  : result.public_id,
                src : result.url,
                date: result.created_at}}}};
            var query = {_id: req.param ('id')};

            var updater = Dispensary.update (query ,update )
                .exec (function (err, results)
            {
                if (err)
                {
                    console.log (err);
                }
                console.log (results);
                res.json ({success: false});
                //res.render ('editDispensary');
            })
        });
        fstream.on ('close', function ()
        {
            console.log ('closing fstream');
        });
    });
};
//delete
photoModel.deletePhoto = function deletePhoto (req, res)
{
    if (!req.user)
    {
        res.json ({success: false, error: "user not logged in "});
        return;
    }
    var data = req.body;
    var imageToDelete = data.imageToDelete;
    var dispensaryId = data.dispensaryId;
    var photoId = data.photoId;

    //TODO figure out what happens if one fails

    var query = Dispensary.update ({_id: dispensaryId}, {$pull: {pictures: {_id: photoId}}})
        .exec (function (err, result)
    {
        console.log (err);
        console.log (result);

    });
    var destroyer = cloudinary.uploader.destroy (imageToDelete, function (res)
    {
        console.log (res)
    });
    when.all ([query, destroyer])
        .spread (function ()
    {
        "use strict";
        res.json ({success: true});
    })
        .otherwise (function (err)
    {
        "use strict";
        res.json ({success: false});
    });


};
photoModel.makeAvatar = function (req, res)
{
    var data = req.body;
    var avatarimage = data.avatarimage;
    var dispensaryId = data.dispensaryId;

    Dispensary.update ({_id: dispensaryId}, {$set: {avatar: avatarimage}})
        .exec (function (err, result)
    {
        console.log (err);
        console.log (result);
        res.json ({success: true});
    });
};




module.exports = photoModel;