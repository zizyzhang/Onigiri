'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let randomMobiAuth;

class SignUpPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('sign-up', function (page) {//TODO second
            $$('#btnSignUp').click(function () {
                if($$('#signUsrPwd').val()!==$$('#signUsrPwdConfirm').val()){
                    myApp.alert('兩次密碼不一致');
                    return;
                }else if($$('#signUsrMobi').val().length !==10 ){
                    myApp.alert('手機號碼輸入錯誤');
                    return;
                }
                if($$('#signTwilio').val()!==randomMobiAuth){
                    myApp.alert('驗證碼輸入錯誤');
                    return;
                }

                ajaxMethod.addUserPromise($$('#signUsrName').val(), $$('#signUsrPwd').val(), $$('#signUsrMobi').val()).then(result=> {
                    myApp.alert('註冊成功', function () {
                        myApp.loginScreen();
                    });
                }).catch(e=> {
                    myApp.alert('註冊失敗');
                });
            });

            $$('#returnSignIn').click(function () {
                myApp.loginScreen();
            });

            $$('#btnTwilio').click(function () {
                console.log($$('#signUsrMobi').val());
                ajaxMethod.mobiAuth($$('#signUsrMobi').val()).then(result=> {
                    //myApp.alert('註冊成功', function () {
                    //    myApp.loginScreen();
                    //});

                    randomMobiAuth = result;

                }).catch(e=> {

                    //myApp.alert('註冊失敗');
                });
            });

        });
    }

}

module.exports = SignUpPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法,
//TODO fifth : 修改HTML 里的page名字