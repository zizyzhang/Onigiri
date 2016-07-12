'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let cookies = require('js-cookie');
let Vue = require('vue');


class ProductDetailPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('proudct-detail', function (page) {//TODO second
            let hostId = cookies.getJSON('user').usrId;
            // console.log('proudct-detail page init');

            tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId), page, function (result) {

                for (let group of result.groupedOrders) {
                    for (let order of group.orders) {
                        let isChecked = order.ordStatus == 2;

                        if (isChecked) {
                            $$('#ordId-' + order.ordId).addClass('completed');
                            $$('#ordId-' + order.ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
                            $$('#chbox-' + order.ordId).attr('checked', 'checked');
                        }
                    }
                }

                // $$(".item-content").click(function () {
                //     let ordId = $$(this).dataset().ordId;
                //     if ($$('#ordId-' + ordId).hasClass('completed')) {
                //         // console.log("hasClass completed");
                //         $$('#ordId-' + ordId).removeClass('completed');
                //         $$('#ordId-' + ordId).removeAttr("style");
                //         ajaxMethod.updateOrdStatusPromise(ordId);
                //         // mainView.router.refreshPage();
                //     } else {
                //         $$('#ordId-' + ordId).addClass('completed');
                //         $$('#ordId-' + ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
                //         ajaxMethod.updateOrdStatusPromise(ordId);
                //     }
                // });

                $$(".paid").click(function () {
                    let ordId = $$(this).dataset().ordId;
                    $$('#ordId-' + ordId).addClass('completed');
                    $$('#ordId-' + ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
                    ajaxMethod.updateOrdStatusPromise(ordId);
                });

            });
        });
    }
}

module.exports = ProductDetailPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法


