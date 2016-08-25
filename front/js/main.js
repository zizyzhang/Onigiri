'use strict';
require('babel-polyfill');

let isDebug = false;

let ajaxMethod = require('./ajaxMethods.js'),
    tool = require('./tool.js'),
    GroupDetailPage = require('./pages/group-detail.js'),
    OrderPage = require('./pages/order.js'),
    GroupSettingPage = require('./pages/group-setting.js'),
    SelectMerchantPage = require('./pages/select-merchant.js'),
    IndexPage = require('./pages/index.js'),
    CreateMenuPage = require('./pages/create-menu.js'),
    cookies = require('js-cookie'),
    Home = require('./pages/home.js'),
    MyGroups = require('./pages/my-groups.js'),
    Public = require('./public.js'),
    OrderDetailPage = require('./pages/order-detail.js'),
    SignUpPage = require('./pages/sign-up.js'),
    HowToCreate = require('./pages/how-to-create.js'),
    GroupSettingSimple = require('./pages/group-setting-simple.js');
    //Dom7 = require('dom7');

// Initialize app
let myApp = new Framework7({
    modalTitle: '販團',
    //template7Pages: true,
    // Enable Material theme
    material: true,
    debug: true

});


// If we need to use custom DOM library, let's save it to $$ letiable:
let $$ = Dom7;
let dish = 1;
// Add view
let mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    //dynamicNavbar: true,
    contentCache: true
});

// TODO CHEAT
(() => {
    if (isDebug) {
        cookies.set('user', {usrId: 1, usrName: 'firstUser'});
        cookies.set('selectedGroupId', 1);
        myApp.closeModal();


        //mainView.router.loadPage('home.html');
        //tool.loadPage('group-setting.html',mainView);

        //mainView.router.loadPage({url: 'group-setting.html', query: {arrayOfSelectedDishIds:[1,2]}});
        console.log('cheat');
    }
})();


//加载page,绑定page的event
let pageEventBind = function () {
    let groupDetailPage = new GroupDetailPage(myApp, mainView);
    let orderPage = new OrderPage(myApp, mainView);
    let selectMerchantPage = new SelectMerchantPage(myApp, mainView);
    let groupSettingPage = new GroupSettingPage(myApp, mainView);
    let indexPage = new IndexPage(myApp, mainView);
    let createMenuPage = new CreateMenuPage(myApp, mainView);
    let home = new Home(myApp, mainView);
    let myGoups = new MyGroups(myApp, mainView);
    let orderDetailPage = new OrderDetailPage(myApp, mainView);
    let signUpPage = new SignUpPage(myApp, mainView);
    let howToCreate = new HowToCreate(myApp,mainView);
    let groupSettingSimple = new GroupSettingSimple(myApp, mainView);



    groupDetailPage.bind();
    orderPage.bind();
    selectMerchantPage.bind();
    groupSettingPage.bind();
    createMenuPage.bind();
    home.bind();
    indexPage.bind();
    myGoups.bind();
    orderDetailPage.bind();
    signUpPage.bind();
    howToCreate.bind();
    groupSettingSimple.bind();

}();


// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.showIndicator();
});


$$(document).on('ajaxComplete', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.hideIndicator();
});



