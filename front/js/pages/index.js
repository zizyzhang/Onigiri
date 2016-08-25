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
window.comments = "";

let homejschange = new home();
class IndexPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        $$(document).on('DOMContentLoaded', function () {

            // var json={time:new Date().getTime()};
            // window.history.replaceState("#");
            // window.history.pushState(json,"","/Onigiri/front/html/index.html");
            // window.history.pushState(json,"","#");
            //控制返回鍵
            window.location.hash = "no-back-button";
            window.location.hash = "Again-No-back-button";//again because google chrome don't insert first hash into history
            window.onhashchange = function () {
                window.location.hash = "no-back-button";
            };

            if (!!cookies.getJSON('user') && cookies.get('usrPwdSha')) {

                $$('#floatLabelName').addClass('not-empty-state');
                $$('#floatLabelPwd').addClass('not-empty-state');
                $$('#txtUsrName').addClass('not-empty-state').parent().css('background', '#fff !important');
                $$('#txtUsrPwd').addClass('not-empty-state').parent().css('background', '#fff !important');

                $$('#txtUsrName').val(cookies.getJSON('user').usrName);
                $$('#txtUsrPwd').val(cookies.get('usrPwdSha'));
                setTimeout(()=>$$('#btn-login').click(), 100);
            }

            $$('#btnCreateGroup').click(function () {
                mainView.router.loadPage({url: 'how-to-create.html'});
            });

            $$('#btnMyGroups').click(function () {

                mainView.router.loadPage({url: 'my-groups.html'});
            });

            $$('#btnConfirm').click(function () {

                mainView.router.loadPage({url: 'confirm-order.html'});
            });

            $$('#txtUsrName').on('focus', function () {
                $$('.usrName').css('color', 'white !important');
                setTimeout(()=>$$('.login-screen-content').scrollTop(1000), 500);
            });

            $$('#txtUsrPwd').on('click', function () {
                setTimeout(()=>$$('.login-screen-content').scrollTop(1000), 500);
            });

            $$('#btn-sign-up').click(function () {
                myApp.closeModal();
                mainView.router.loadPage({url: 'sign-up.html'});
            });

            $$('#txtUsrPwd').on('keyup', function () {
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
                    tool.loadPage('home.html', mainView, ajaxMethod.getHomePageDataPromise(result.user.usrId));
                    //mainView.router.loadPage({url: 'home.html'});
                }).catch(function (e) {
                    myApp.alert('登入失敗:' + e);
                });

            });

            $$('#tabNearGroups').click(function () {
                homejschange.changeTabGroup();
            });
            $$('#tabOrders').click(function () {

                homejschange.changeTabOrder();
                //changeTabGroup();
            });
            $$('#btnSend').click(function () {
                window.comments = $$('#comments').val();
                $$('#comments').val("");
            });

            $$('#btnLogout').click(function () {
                location.reload();

                // $$('#txtUsrPwd').val("");
            });

        });


    }

}

module.exports = IndexPage;
