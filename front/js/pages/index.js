'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
const Public = require('../public.js');
const cookies = require('js-cookie');

class IndexPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {

        $$('#txtUsrName').on('focus', function () {
            $$('.usrName').css('color', 'white !important');
        });


        $$('#btn-sign-up').click(function () {
            if ($$('#subPwd').val() === $$('#confirmPwd').val()) {
                ajaxMethod.addUser();
            }
            else {
                console.log("error subSignUp");
            }
        });

        $$('#btn-login').click(function () {


            ajaxMethod.userAuth().then(function (result) {
                cookies.set('user',result.user);

                myApp.closeModal();
                mainView.router.loadPage({url: 'my-groups.html'});
            }).catch(function () {
                myApp.alert('登录失败');
            });

        });


    }

}

module.exports = IndexPage;
