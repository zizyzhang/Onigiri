'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Vue = require('vue');


class Page { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('', function (page) {//TODO second

        });
    }

}

module.exports = Page;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法