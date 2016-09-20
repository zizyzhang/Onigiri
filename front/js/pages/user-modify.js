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
            window.location.hash = "#user-modify";
            let usrCookie = cookies.getJSON('user');
            let mailWhenJoin = usrCookie.mailWhenJoin;
            let mailWhenRefused = usrCookie.mailWhenRefused;
            let usrMail = $$('#UsrMail');
            console.log(usrCookie);
            // $$('#UsrName').val(usrCookie.usrName);
            // $$('#UsrMobi').val(usrCookie.usrMobi);
            // $$('#UsrMail').val(usrCookie.usrMail);
            usrMail.val(usrCookie.usrMail);

            if (!mailWhenJoin) {
                $$('#mailWhenJoin').removeAttr('checked');
            }
            if (!mailWhenRefused) {
                $$('#mailWhenRefused').removeAttr('checked');
            }

            $$('#mailWhenJoin').change(function () {
                mailWhenJoin = !mailWhenJoin;
                // console.log('mailWhenJoin change' ,usrCookie.mailWhenJoin);
                usrCookie.mailWhenJoin = mailWhenJoin;
                cookies.set('user', usrCookie);
                ajaxMethod.chamgeMailNotify(usrCookie.usrId, 'mailWhenJoin', mailWhenJoin);
            });

            $$('#mailWhenRefused').change(function () {
                mailWhenRefused = !mailWhenRefused;
                // console.log('mailWhenRefused change' ,usrCookie.mailWhenRefused);
                usrCookie.mailWhenRefused = mailWhenRefused;
                cookies.set('user', usrCookie);
                ajaxMethod.chamgeMailNotify(usrCookie.usrId, 'mailWhenRefused', mailWhenRefused);
            });

            $$('#btnSave').click(function () {
                if ($$('#UsrPwd').val() && $$('#NewUsrPwd').val() && $$('#NewUsrPwdConfirm').val()) {
                    if ($$('#NewUsrPwd').val() !== $$('#NewUsrPwdConfirm').val()) {
                        myApp.alert('兩次密碼不一致');
                        return;
                    }

                    ajaxMethod.updatePwd(usrCookie.usrId, SHA256($$('#UsrPwd').val()).toString(), SHA256($$('#NewUsrPwd').val()).toString()).then(function (result) {
                        myApp.alert('密碼已修改，請使用新密碼登入');
                        cookies.set('usrPwdSha', SHA256($$('#NewUsrPwd').val()).toString());
                        // mainView.router.loadPage({url: './html/home.html'});
                    }).catch(function (e) {
                        myApp.alert('密碼錯誤:' + e);
                    });

                }
                if (usrMail.val()) {
                    if (usrMail.val() === usrCookie.usrMail) {
                        return;
                    }
                    myApp.alert('新信箱:' + usrMail.val());
                    ajaxMethod.updateUsrmail(usrCookie.usrId, usrMail.val());
                    usrCookie.usrMail = usrMail.val();
                    cookies.set('user', usrCookie);
                    // mainView.router.loadPage({url: './html/home.html'});
                    tool.loadPage('./html/home.html',mainView, ajaxMethod.getHomePageDataPromise(cookies.getJSON('user').usrId));
                }
            });


        });
    }
}

module.exports = userModify;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法