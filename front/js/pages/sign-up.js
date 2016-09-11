'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
const cookies = require('js-cookie');
var SHA256 = require("crypto-js/sha256");
let randomMobiAuth;

class SignUpPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('sign-up', function (page) {//TODO second

            $$('#btnSignUp').click(function () {

                if(!( $$('#signUsrName').val()&& $$('#signUsrPwd').val()&& $$('#signUsrMobi').val()&&$$('#signTwilio').val())){
                    myApp.alert('資料填寫不完整');
                    return;
                }

                if ($$('#signUsrPwd').val() !== $$('#signUsrPwdConfirm').val()) {
                    myApp.alert('兩次密碼不一致');
                    return;
                } else if ($$('#signUsrMobi').val().length !== 10) {
                    myApp.alert('手機號碼輸入錯誤');
                    return;
                }


                ajaxMethod.addUserPromise($$('#signUsrName').val(), SHA256($$('#signUsrPwd').val()).toString(), $$('#signUsrMail').val(), $$('#signUsrMobi').val(),$$('#signTwilio').val()).then(result=> {
                    myApp.alert('註冊成功', function () {
                        cookies.set('user', {
                            usrName: $$('#signUsrName').val(),
                            usrMobi: $$('#signUsrMobi').val(),
                            usrMail: $$('#signUsrMail').val(),
                        });
                        cookies.set('usrPwdSha', SHA256($$('#signUsrPwd').val()).toString());

                        $$('#signUsrName').val("");
                        $$('#signUsrPwd').val("");
                        $$('#signUsrPwdConfirm').val("");
                        $$('#signUsrMail').val("");
                        $$('#signUsrMobi').val("");
                        $$('#signTwilio').val("");

                        // mainView.router.loadPage({url: '../index.html'});
                        // mainView.router.refreshPage();
                        location.reload();
                        // myApp.loginScreen();
                    });
                }).catch(e=> {
                    myApp.alert('註冊失敗:'+e);
                });
            });

            $$('#returnSignIn').click(function () {
                myApp.loginScreen();
            });

            $$('#btnTwilio').click(function () {
                let that = this;

                if ($$('#signUsrMobi').val().length !== 10) {
                    myApp.alert('請正確填寫手機號碼!');
                    return;
                }

                $$(this).attr('disabled', true);
                let timeTick = 60;
                $$(that ).text(`重發(${timeTick})`);
                let authInterval = setInterval(function(){
                    timeTick -= 1;
                    $$(that ).text(`重發(${timeTick})`);
                    if(timeTick===0){
                        clearInterval(authInterval);
                        $$(that ).removeAttr('disabled');
                        $$(that ).text('重新發送');
                    }
                }, 1000);

                ajaxMethod.mobiAuth($$('#signUsrMobi').val()).then(result=> {
                    let notificationSent = myApp.addNotification({
                        message: '已發送(測試階段,驗證碼請填寫123)',
                        button: {
                            text: '關閉',
                        }
                    });

                    setTimeout(()=>myApp.closeNotification(notificationSent),3000);
                }).catch(e=> {
                    myApp.alert('請正確填寫手機號碼!'+e);

                });
            });

        });
    }

}

module.exports = SignUpPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法,
//TODO fifth : 修改HTML 里的page名字