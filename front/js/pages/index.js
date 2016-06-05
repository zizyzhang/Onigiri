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


let homejschange = new home();
class IndexPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        $$(document).on('DOMContentLoaded', function () {

            if (!!cookies.getJSON('user') && cookies.get('usrPwd')) {


                $$('#floatLabelName').addClass('not-empty-state')   ;
                $$('#floatLabelPwd').addClass('not-empty-state');
                $$('#txtUsrName').addClass('not-empty-state').parent().css('background','#fff !important') ;
                $$('#txtUsrPwd').addClass('not-empty-state').parent().css('background','#fff !important') ;

                $$('#txtUsrName').val(cookies.getJSON('user').usrName);
                $$('#txtUsrPwd').val(cookies.get('usrPwd'));
            }

            $$('#btnCreateGroup').click(function () {
                mainView.router.loadPage({url: 'group-setting.html'});
            });

            $$('#btnMyGroups').click(function () {

                mainView.router.loadPage({url: 'my-groups.html'});

            });

            $$('#txtUsrName').on('focus', function () {
                $$('.usrName').css('color', 'white !important');
            });


            $$('#btn-sign-up').click(function () {
                myApp.closeModal();
                mainView.router.loadPage({url: 'sign-up.html'});
            });

            $$('#btn-login').click(function () {


                ajaxMethod.userAuth().then(function (result) {
                    cookies.set('user', result.user);
                    cookies.set('usrPwd', $$('#txtUsrPwd').val());

                    myApp.closeModal();
                    mainView.router.loadPage({url: 'home.html'});
                }).catch(function () {
                    myApp.alert('登录失败');
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
