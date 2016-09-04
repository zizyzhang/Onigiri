'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Vue = require('vue');
let cookies = require('js-cookie');
var SHA256 = require("crypto-js/sha256");


class userModify { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('userModify', function (page) {//TODO second
            let usrCookie = cookies.getJSON('user');
            let mailWhenJoin = usrCookie.mailWhenJoin;
            let mailWhenRefused = usrCookie.mailWhenRefused;
            console.log(usrCookie);
            $$('#UsrName').val(usrCookie.usrName);
            $$('#UsrMobi').val(usrCookie.usrMobi);
            $$('#UsrMail').val(usrCookie.usrMail);

            if (!mailWhenJoin) {
                $$('#mailWhenJoin').removeAttr('checked');
            }
            if (!mailWhenRefused) {
                $$('#mailWhenRefused').removeAttr('checked');
            }

            $$('#mailWhenJoin').change(function () {
                mailWhenJoin = !mailWhenJoin;
                // console.log('mailWhenJoin change' ,usrCookie.mailWhenJoin);
                ajaxMethod.chamgeMailNotify(usrCookie.usrId, 'mailWhenJoin', mailWhenJoin);
            });

            $$('#mailWhenRefused').change(function () {
                mailWhenRefused = !mailWhenRefused;
                // console.log('mailWhenRefused change' ,usrCookie.mailWhenRefused);
                ajaxMethod.chamgeMailNotify(usrCookie.usrId, 'mailWhenRefused', mailWhenRefused);
            });

            $$('#btnSave').click(function () {
                if ($$('#UsrMail').val()) {
                    if ($$('#UsrMail').val() === usrCookie.usrMail) {
                        return;
                    }
                    myApp.alert('設定信箱為:' + $$('#UsrMail').val());
                    ajaxMethod.updateUsrmail(usrCookie.usrId, $$('#UsrMail').val());
                }
            });


        });
    }

}

module.exports = userModify;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法