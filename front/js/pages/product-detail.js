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
            console.log('proudct-detail page init');


            tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId), page, function (result) {
                // console.log(JSON.stringify(result));

                for (let groupedOrders of result.groupedOrders) {
                    for (let order of groupedOrders.orders) {
                        let isChecked = order.ordStatus == 2;

                        if (isChecked) {
                            $$('#ordId-' + order.ordId).addClass('completed');
                            $$('#ordId-' + order.ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
                            $$('#chbox-' + order.ordId).attr('checked', 'checked');
                        }
                    }
                }

                $$(".paid").click(function () {
                    let ordId = $$(this).dataset().ordId;
                    //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    let ordStatus = 2;
                    $$('#ordId-' + ordId).addClass('completed');
                    $$('#ordId-' + ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
                    ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                });

            });
            

        });
    }
}
module.exports = ProductDetailPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法


