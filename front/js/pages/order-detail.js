'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let cookies = require('js-cookie');


class OrderDetailPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('order-detail', function (page) {//TODO second
            let grpId = page.query.grpId || this.grpId;
            let usrId = cookies.getJSON('user').usrId;

            console.log(grpId);

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(grpId), page, ()=> {

                $$('.js-btn-contact-host').click(function () {
                    console.log("1");
                    window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
                });

                $$('.js-btn-cancel-order').click(function () {
                    ajaxMethod.cancelOrderPromise(grpId, usrId).then(()=>{
                        myApp.alert('取消成功','販團',()=>{
                            tool.loadPage('./html/home.html', mainView, ajaxMethod.getHomePageDataPromise(usrId));
                        });

                    }).catch(e=>{
                        myApp.alert(e);
                    });
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