'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let home = require('./home.js');
var SHA256 = require("crypto-js/sha256");

const Public = require('../public.js');
const cookies = require('js-cookie');


let homejschange = new home();
class IndexPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        $$(document).on('DOMContentLoaded', function () {

            if (!!cookies.getJSON('user') && cookies.get('usrPwdSha')) {


                $$('#floatLabelName').addClass('not-empty-state');
                $$('#floatLabelPwd').addClass('not-empty-state');
                $$('#txtUsrName').addClass('not-empty-state').parent().css('background', '#fff !important');
                $$('#txtUsrPwd').addClass('not-empty-state').parent().css('background', '#fff !important');

                $$('#txtUsrName').val(cookies.getJSON('user').usrName);
                $$('#txtUsrPwd').val(cookies.get('usrPwdSha'));
            }

            $$('#btnCreateGroup').click(function () {
                mainView.router.loadPage({url: 'how-to-create.html'});
            });

            $$('#btnMyGroups').click(function () {

                mainView.router.loadPage({url: 'my-groups.html'});

            });

            $$('#txtUsrName').on('focus', function () {
                $$('.usrName').css('color', 'white !important');
                setTimeout(()=>$$('.login-screen-content').scrollTop(1000),500);
            });


            $$('#txtUsrPwd').on('click', function () {
                setTimeout(()=>$$('.login-screen-content').scrollTop(1000),500);
            });

            $$('#btn-sign-up').click(function () {
                myApp.closeModal();
                mainView.router.loadPage({url: 'sign-up.html'});
            });

            $$('#txtUsrPwd').on('keyup',function(){
                cookies.remove('usrPwdSha');
            });

            $$('#btn-login').click(function () {

                let usrName = $$('#txtUsrName').val();


                //let usrPwd = $$('#txtUsrPwd').val();
                let usrPwdSha = cookies.get('usrPwdSha');

                ajaxMethod.userAuth(usrName, usrPwdSha ? usrPwdSha : SHA256($$('#txtUsrPwd').val()).toString()).then(function (result) {

                    cookies.set('user', result.user);
                    if (!usrPwdSha) {
                        cookies.set('usrPwdSha', SHA256($$('#txtUsrPwd').val()).toString());
                    }

                    myApp.closeModal();
                    tool.loadPage('home.html',mainView, ajaxMethod.getHomePageDataPromise(result.usrId));
                    //mainView.router.loadPage({url: 'home.html'});
                }).catch(function (e) {
                    myApp.alert('登录失败:' + e);
                });

            });

            $$('#tabNearGroups').click(function () {
                homejschange.changeTabGroup();
            });
            $$('#tabOrders').click(function () {

                homejschange.changeTabOrder();
                //changeTabGroup();
            });

        });


    }

}

module.exports = IndexPage;
