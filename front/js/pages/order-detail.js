'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');


class OrderDetailPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('order-detail', function (page) {//TODO second
            this.grpId = page.query.grpId || this.grpId;

            console.log(this.grpId);

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(this.grpId), page, ()=> {

                $$('.js-btn-contact-host').click(function () {
                    console.log("1");
                    window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
                });

            });




        });

        myApp.onPageInit('order-detail', (page) => {

            console.log('order-detail Init');
        });
    }

}

module.exports = OrderDetailPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法