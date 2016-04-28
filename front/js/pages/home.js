'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
const cookies = require('js-cookie');



class Home  { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('home', function (page) {//TODO second
            console.log('user',cookies.getJSON('user'));
            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getHomePageDataPromise(cookies.getJSON('user').usrId),page,result=>{
                $$('.btn-join-in-group-page').on('click', function () {

                    let grpId = $$(this).dataset().grpId;
                    console.log(`grpId   : ${grpId}`);

                    cookies.set('selectedGroupId', grpId);
                    mainView.router.loadPage(`order.html?grpId=${grpId}`);


                });

                $$('.js-btn-contact-host').click(function () {
                    window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
                });

                $$('.btn-group-detail').on('click', function () {

                    let grpId = $$(this).dataset().grpId;
                    console.log(`grpId : ${grpId}`);

                    cookies.set('selectedGroupId', grpId);

                    mainView.router.loadPage(`group-detail.html?grpId=${grpId}`);

                });


            });


        });
    }

}

module.exports = Home  ;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法