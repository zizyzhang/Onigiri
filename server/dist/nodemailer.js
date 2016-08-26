/**
 * Created by nai on 2016/8/26.
 */

'use strict';

var nodemailer = require('nodemailer');

var mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'o.grpbuy@gmail.com',
        pass: 'asd1q2w3e'
    }
});

var sendMail = function sendMail(usrMail, subject, html) {

    if (usrMail && subject && html) {
        mailTransport.sendMail({
            from: 'o.grpbuy@gmail.com',
            to: usrMail,
            subject: subject,
            html: html
        }, function (err) {
            if (err) {
                console.log('Unable to send email: ' + err);
            }
        });
    }
};
//# sourceMappingURL=nodemailer.js.map
