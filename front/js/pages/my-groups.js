'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let cookies = require('js-cookie');


class MyGroups { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {

        myApp.onPageBeforeInit('my-groups', function (page) {//TODO second
            let hostId = cookies.getJSON('user').usrId;

            tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupedOrdersAndSumsByHostIdPromise(hostId), page, function (result) {

                //let grpStatus = this.arrayOfSelectedDishIds = page.query.arrayOfSelectedDishIds || this.arrayOfSelectedDishIds;
                console.log(page.query + "567");

                $$('.btn-contact-merchant').click(function () {
                    console.log("asp");
                    window.location.href = 'tel:' + $$(this).data('met-phone');
                });

                $$('.btn-group-detail').click(function () {
                    let grpNextStatus = $$(this).dataset().grpNextStatus;
                    let grpId = $$(this).dataset().grpId;

                    console.log("grpNextStatus",grpNextStatus);
                    ajaxMethod.updateGroupStatusPromise(grpId,grpNextStatus).then(result=>{
                        mainView.router.refreshPage();
                    });

                });

            });

            //console.log(document.getElementById("a").innerHTML==" ");
            //if(mainView.getElementById(a).innerHTML=="已送達"){
            //    console.log("出現吧!!");
            //}
            //    console.log("asdfasdf"+"為");
            //    $$('.statusa').html("未達到開團金額") ;
            //
            //}

        });


    }

}

module.exports = MyGroups;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法