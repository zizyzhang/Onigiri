'use strict';
let isDebug = true;

let ajaxMethod = require('./ajaxMethods.js'),
    tool = require('./tool.js'),
    GroupPage = require('./pages/group.js'),
    GroupDetailPage = require('./pages/group-detail.js'),
    OrderPage = require('./pages/order.js'),
    GroupSettingPage = require('./pages/group-setting.js'),
    SelectMerchantPage = require('./pages/select-merchant.js'),
    IndexPage = require('./pages/index.js'),
    CreateMenuPage = require('./pages/create-menu.js'),
    cookies = require('js-cookie'),
    Public = require('./public.js');


// Initialize app
let myApp = new Framework7({
    modalTitle: 'Onigiri',
    //template7Pages: true,
    // Enable Material theme
    material: true,

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

//加载page,绑定page的event
let pageEventBind = function () {
    let groupPage = new GroupPage(myApp, mainView);
    let groupDetailPage = new GroupDetailPage(myApp, mainView);
    let orderPage = new OrderPage(myApp, mainView);
    let selectMerchantPage = new SelectMerchantPage(myApp, mainView);
    let groupSettingPage = new GroupSettingPage(myApp, mainView);
    let indexPage = new IndexPage(myApp, mainView);
    let createMenuPage = new CreateMenuPage(myApp, mainView);

    groupPage.bind();
    groupDetailPage.bind();
    orderPage.bind();
    selectMerchantPage.bind();
    groupSettingPage.bind();
    indexPage.bind();
    createMenuPage.bind();
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


// TODO CHEAT
(() => {
    if (isDebug) {
        myApp.closeModal();

        mainView.router.loadPage({url: 'my-groups.html'});

        cookies.set('user',{usrId:1,usrName:'firstUser'});
        cookies.set('selectedGroupId',1);

        console.log('cheat');
    }
})();
