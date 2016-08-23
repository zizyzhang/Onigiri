/**
 * Created by hsiang1 on 2016/7/17.
 */
'use strict';
/**
 * Created by Zizy on 4/7/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
const _ = require('lodash');
let tool = require('../tool.js');
let Public = require('../public.js');
const cookies = require('js-cookie');
let Vue = require('vue');


class ConfirmPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        myApp.onPageBeforeInit('confirm', function (page) {//TODO second

            let hostId = cookies.getJSON('user').usrId;
            //let metId = Number(cookies.get('selectedMerchantId'));

            console.log('onPageBeforeInit : confirm');

            ajaxMethod.getGrpUsersOrdersByHostIdPromise(hostId, 0).then(function (result) {
                // console.log('====result:' + JSON.stringify(result));

                let confirmOrder = new Vue({
                    el: '#confirmOrder',
                    data: result
                });
                
                $$('.accept').click(function () {
                    let dataset =$$(this).dataset();
                    let grpId = dataset.grpId;
                    let usrId = dataset.usrId;
                    
                    //ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    let ordStatus = 1;
                    
                    console.log("====g" + grpId + "u" + usrId);
                    $$('#g' + grpId + 'u' + usrId).attr('style', 'display:none;');

                    let usrOrdIds =
                        result.GrpUsersOrders.find(group => group.group.grpId === grpId).usrOrders.find(o=>o.usrId === usrId).usrOrdIds;
                    console.log(JSON.stringify(usrOrdIds));

                    for (let ord of usrOrdIds) {
                        let ordId = ord.ordId;
                        ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                    }
                    // mainView.router.refreshPage();
                });
                
                $$('.refuse').click(function () {
                    let dataset =$$(this).dataset();
                    let grpId = dataset.grpId;
                    let usrId = dataset.usrId;
                    let ordStatus = -1;

                    console.log("====g" + grpId + "u" + usrId);
                    $$('#g' + grpId + 'u' + usrId).attr('style', 'display:none;');

                    let usrOrdIds =
                        result.GrpUsersOrders.find(group => group.group.grpId === grpId).usrOrders.find(o=>o.usrId === usrId).usrOrdIds;
                    console.log(JSON.stringify(usrOrdIds));
                    
                    for (let ord of usrOrdIds) {
                        let ordId = ord.ordId;
                        ajaxMethod.updateOrdStatusPromise(ordId, ordStatus);
                    }

                    ajaxMethod.alertMailFromRefuseOrder(usrId, grpId);
                    // mainView.router.refreshPage();
                });
                
            });

            // tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getconfirmOrderPromise(hostId), page, function (result) {
            //     //console.log(JSON.stringify(result));
            //
            //     let StatusByGrp = [];
            //
            //     for (let groupedOrders of result.groupedOrders) {
            //         let grpId,
            //             ordSts = [];
            //         for (let order of groupedOrders.orders) {
            //             grpId = order.grpId;
            //             ordSts.push(order.ordStatus);
            //         }
            //         if (ordSts.length!==0) {
            //             StatusByGrp.push({'grpId': grpId, 'ordStatus': ordSts});
            //         }
            //     }
            //
            //     for(let group of StatusByGrp){
            //         let checked=true;
            //         for(let oSt of group.ordStatus ){
            //             if(oSt===0){
            //                 checked=false;
            //             }
            //         }
            //         isChecked(group.grpId,checked);
            //     }
            //
            //
            //     // console.log(JSON.stringify(StatusByGrp));
            //
            //
            //     $$('.refuse').click(function () {
            //         let ordId = $$(this).dataset().ordId;
            //         // let gmrId = $$(this).dataset().gmrId;
            //
            //         console.log("ordId:" + ordId);
            //
            //         ajaxMethod.updateOrdStatusPromise(ordId, -1);
            //         // ajaxMethod.getComment(gmrId, -1);
            //         mainView.router.refreshPage();
            //     });
            //
            //     $$('.accept').click(function () {
            //         let ordId = $$(this).dataset().ordId;
            //         console.log("ordId:" + ordId);
            //
            //         ajaxMethod.updateOrdStatusPromise(ordId, 1);
            //         mainView.router.refreshPage();
            //     });
            //
            // });

            let isChecked = function (grpId, checked) {
                if (checked) {
                    //let grpId = group.orders.find(obj => obj.ordStatus !== 0).grpId;
                    //console.log("grpId:" + grpId);
                    $$('#grpId-' + grpId).remove();
                }
            }
        });
    }

}

module.exports = ConfirmPage;////TODO third
