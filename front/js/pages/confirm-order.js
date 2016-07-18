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
            tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getconfirmOrderPromise(hostId), page, function (result) {
                //console.log(JSON.stringify(result));

                let StatusByGrp = [];

                for (let groupedOrders of result.groupedOrders) {
                    let grpId,
                        ordSts = [];
                    for (let order of groupedOrders.orders) {
                        grpId = order.grpId;
                        ordSts.push(order.ordStatus);
                    }
                    if (ordSts.length!==0) {
                        StatusByGrp.push({'grpId': grpId, 'ordStatus': ordSts});
                    }
                }

                for(let group of StatusByGrp){
                    let checked=true;
                    for(let oSt of group.ordStatus ){
                        if(oSt===0){
                            checked=false;
                        }
                    }
                    isChecked(group.grpId,checked);
                }


                // console.log(JSON.stringify(StatusByGrp));


                $$('.refuse').click(function () {
                    let ordId = $$(this).dataset().ordId;
                    console.log("ordId:" + ordId);

                    ajaxMethod.updateOrdStatusPromise(ordId, -1);
                    mainView.router.refreshPage();
                });

                $$('.accept').click(function () {
                    let ordId = $$(this).dataset().ordId;
                    console.log("ordId:" + ordId);

                    ajaxMethod.updateOrdStatusPromise(ordId, 1);
                    mainView.router.refreshPage();
                });

            });

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
