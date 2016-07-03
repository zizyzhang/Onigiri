/**
 * Created by hsiang1 on 2016/7/1.
 */
'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');
let myApp = null, mainView = null;
const cookies = require('js-cookie');

let comments;

class MessagePage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        let self = this;
        myApp.onPageBeforeInit('message', function (page) {//TODO second
            console.log('before order init message');
                $$('#btnSend').click(function () {
                   console.log("test");
                   comments=$$('#comments').val();
                    mainView.router.load({
                        url:'order.html',
                        query:{comments}
                    });
                });
        });

        myApp.onPageInit('message', (page) => {

            console.log('message Init');
        });
    }

}

module.exports = MessagePage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法