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
let _ = require('lodash');

class ProductDetailPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('proudct-detail', function (page) {//TODO second
            let hostId = cookies.getJSON('user').usrId;
            console.log('proudct-detail page init');

            ajaxMethod.getGrpUsersOrdersByHostIdPromise(hostId,1).then(function (result) {

                console.log('====result' + JSON.stringify(result));
                let groupOrder = new Vue({
                    el: '#grpOrd',
                    data: result
                });

                $$(".paid").click(function () {
                    let grpId = $$(this).dataset().grpId;
                    let usrId = $$(this).dataset().usrId;
                    console.log("====grpid" + grpId + "====usrId" + usrId);
                    //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    let ordStatus = 2;
                    let item = $$('#g' + grpId + 'u' + usrId);
                    item.addClass('completed');
                    item.attr('style', 'text-decoration:line-through; color:DarkGray;');
                    $$('#icong' + grpId + 'u' + usrId).attr('style', 'color:green; display:inline;');

                    let usrOrdIds =
                        result.GrpUsersOrders.find(group => group.group.grpId === grpId).usrOrders.find(o=>o.usrId === usrId).usrOrdIds;
                    console.log(JSON.stringify(usrOrdIds));

                    for (let ord of usrOrdIds) {
                        let ordId = ord.ordId;
                        ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                    }
                });

                $$(".unPaid").click(function () {
                    let grpId = $$(this).dataset().grpId;
                    let usrId = $$(this).dataset().usrId;
                    console.log("====grpid" + grpId + "====usrId" + usrId);

                    //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    let ordStatus = 1;
                    let item = $$('#g' + grpId + 'u' + usrId);
                    item.removeClass('completed');
                    item.removeAttr('style');
                    $$('#icong' + grpId + 'u' + usrId).attr('style', 'color:green; display:none;');
                    let usrOrdIds =
                        result.GrpUsersOrders.find(group => group.group.grpId === grpId).usrOrders.find(o=>o.usrId === usrId).usrOrdIds;
                    console.log(JSON.stringify(usrOrdIds));

                    for (let ord of usrOrdIds) {
                        let ordId = ord.ordId;
                        ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                    }
                });
            });

            ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(function (result) {
                for (let groupedOrders of result.groupedOrders) {
                    for (let order of groupedOrders.orders) {
                        let isChecked = order.ordStatus == 2;

                        if (isChecked) {
                            let item = $$('#g' + order.grpId + 'u' + order.usrId);
                            item.addClass('completed');
                            item.attr('style', 'text-decoration:line-through; color:DarkGray;');
                            item.attr('checked', 'checked');
                            // $$('#icong' + order.grpId + 'u' + order.usrId).removeAttr('style');
                            $$('#icong' + order.grpId + 'u' + order.usrId).attr('style', 'color:green; display:inline;');
                        }
                    }
                }
            });
            // tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId), page, function (result) {
            //     // console.log(JSON.stringify(result));
            //
            //     for (let groupedOrders of result.groupedOrders) {
            //         for (let order of groupedOrders.orders) {
            //             let isChecked = order.ordStatus == 2;
            //
            //             if (isChecked) {
            //                 $$('#ordId-' + order.ordId).addClass('completed');
            //                 $$('#ordId-' + order.ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
            //                 $$('#chbox-' + order.ordId).attr('checked', 'checked');
            //             }
            //         }
            //     }
            //
            //     $$(".paid").click(function () {
            //         let ordId = $$(this).dataset().ordId;
            //         //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
            //         let ordStatus = 2;
            //         $$('#ordId-' + ordId).addClass('completed');
            //         $$('#ordId-' + ordId).attr('style', 'text-decoration:line-through; color:DarkGray;');
            //         ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
            //     });
            //
            // });


        });
    }
}
module.exports = ProductDetailPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法


