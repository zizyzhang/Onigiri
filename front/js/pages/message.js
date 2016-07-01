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


class MessagePage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        let self = this;
        myApp.onPageBeforeInit('message', function (page) {//TODO second
            console.log('before order init message');

            self.grpId = page.query.grpId || self.grpId;

            console.log(self.grpId);
            console.log(page.query.grpHost);

            //tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupById(self.grpId), page, ()=> {

                $$('#btnSend').click(function () {
                   console.log("test");
                    let comments=$$('#comments').val();
                    //console.log("comments"+comments);

                    tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.postComment(self.grpId,comments), page, (comment)=> {
                        console.log("call back:"+comment);
                    });

                });

            //});

        });

        myApp.onPageInit('message', (page) => {

            console.log('message Init');
        });
    }

}

module.exports = MessagePage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法