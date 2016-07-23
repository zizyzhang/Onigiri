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


            ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(function (result) {

                // let groupOrder = new Vue({
                //     el: '#grpOrd',
                //     data: result
                // });
                
                
                let GrpUsersOrders = {
                    GrpUsersOrders:[]
                };

                for (let grpOrd of result.groupedOrders) {
                    let neGUO = {};
                    let uos = [];
                    let grpComments = grpOrd.group.grpComments;

                    for (let order of grpOrd.orders) {
                        order.dish.ordNum = order.ordNum;
                        let uosobj=uos.find(u=>u.usrId === order.usrId);

                        if ( !uosobj ) {
                            uos.push({
                                usrId: order.usrId,
                                usrName: order.usrName,
                                usrAmount: 0,
                                usrDishes: [order.dish],
                                usrComments: _.filter(grpComments,(com) => com.usrId === order.usrId),
                                usrOrdIds:[{ordId:order.ordId}]
                            });
                            // console.log("====uos" + JSON.stringify(uos));
                        }else{
                            uosobj.usrDishes.push(order.dish);
                            uosobj.usrOrdIds.push({ordId:order.ordId});
                        }
                    }
                    // console.log("====uos" + JSON.stringify(uos));

                    neGUO.group = grpOrd.group;
                    neGUO.usrOrders = uos;
                    GrpUsersOrders.GrpUsersOrders.push(neGUO);
                }
                // console.log("====result.groupedOrders" + JSON.stringify(result.groupedOrders));
                console.log("====GrpUsersOrders" + JSON.stringify(GrpUsersOrders));


                let groupOrder = new Vue({
                    el: '#grpOrd',
                    data: GrpUsersOrders
                });


                
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

                $$(".unPaid").click(function () {
                    let ordId = $$(this).dataset().ordId;
                    //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    let ordStatus = 1;
                    $$('#ordId-' + ordId).removeClass('completed');
                    $$('#ordId-' + ordId).removeAttr('style');
                    ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                });
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


