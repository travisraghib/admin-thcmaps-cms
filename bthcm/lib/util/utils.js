/**
 * Created by travisraghib on 6/19/14.
 */
module.exports =
{
    getIp : function returnIp (req){
        if (req.headers["x-forwarded-for"])
        {
            var list = req.headers["x-forwarded-for"].split(",");
            return list[list.length-1];
        }
        else
        {
            return (req.connection.remoteAddress != '127.0.0.1') ? req.connection.remoteAddress : '174.67.230.97';
        }
    },
    formatPhone : function formatPhone(num) {
        var numbers = num.replace(/\D/g, '');
        var char = {0:'(',3:') ',6:' - '};
        var n ='';
        for (var i = 0; i < numbers.length; i++) {
            n += (char[i]||'') + numbers[i];
        }
        return n;
    },
    cloudinaryImages : function cloudinaryImages (a, cloudinary){
        var arry = [];
        for (var i = 0; i < a.length; i++)
        {
            arry[i] = {
                thmb   : cloudinary.url (a[i].photo.id, {
                    height: 100,
                    width: 100,
                    crop  : 'fill'
                }),
                full   : cloudinary.url (a[i].photo.id, {
                    width : 100,
                    height: 150,
                    crop  : 'fill'
                }),
                src    : a[i].photo.src,
                id     : a[i].photo.id,
                date   : a[i].photo.date,
                photoId: a[i]._id
            }

        };
        return arry;
    },
    BasePageData : function BasePageData (req, global) {
        "use strict";
        var obj = {};
        obj.loginStatus = req.user;
        obj.userName = req.user && req.user.userName;
        obj.global = global;
        obj.ip = req.connection.remoteAddress;
        obj.id = req.param ('id');
        return obj;
    }
};