'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Vue = require('vue');

class HowToCreate { //TODO first



    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;


    }

    bind() {
        let that = this;

        myApp.onPageBeforeInit('how-to-create', function (page) {//TODO second
             let vuePage = new Vue({
                el: '#how-to-create',
                data: {
                    items: [{
                        content: '手動輸入商家/商品資訊',
                        url:'./html/group-setting.html'

                    }, {
                        content: '選擇已有的商家/商品資訊',
                        url:'./html/select-merchant.html'
                    }]
                },
                methods: {}
            });


        });
    }


}

module.exports = HowToCreate;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法