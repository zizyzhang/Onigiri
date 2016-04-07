'use strict';

let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');


class createMenuPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp =_myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('create-menu', function (page) {//TODO second
            console.log('create-menu before init');
            this.metId = page.query.metId || this.metId;

            tool.loadTemplateFromJsonPromise(ajaxMethod.getMerchantById(this.metId), page, ()=> {

                //函数绑定要在完成template之后
                $$('.btn-join-in-group-page').on('click', function () {

                    let grpId= $$(this).dataset().grpId;
                    console.log(`grpId   : ${grpId}`);

                    mainView.router.loadPage(`order.html?grpId=${grpId}`);

                });
            });



        });
    }

}

module.exports = createMenuPage;////TODO third

