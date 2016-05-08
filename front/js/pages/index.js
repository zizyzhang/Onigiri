'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let home = require('./home.js');

const Public = require('../public.js');
const cookies = require('js-cookie');

class IndexPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        $$(document).on('DOMContentLoaded',function(){
            $$('#btnCreateGroup').click(function () {
                mainView.router.loadPage({url: 'select-merchant.html'});

            });

            $$('#btnMyGroups').click(function () {

                mainView.router.loadPage({url: 'my-groups.html'});

            });

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
                    cookies.set('user', result.user);

                    myApp.closeModal();
                    mainView.router.loadPage({url: 'home.html'});
                }).catch(function () {
                    myApp.alert('登录失败');
                });

            });

            $$('.tabNearGroups').click(function () {


            });
            $$('.tabOrders').click(function () {


            });

        });


    }

}

module.exports = IndexPage;
