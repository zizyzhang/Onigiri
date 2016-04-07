/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');
let myApp = null, mainView = null;
let dishes = [];
let dihId;
let num;


class OrderPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        myApp.onPageBeforeInit('order', function (page) {
            console.log('before order init');
            let dish = 1;


            this.grpId = page.query.grpId || this.grpId;

            console.log("-----------" + JSON.stringify(this.grpId));

            tool.loadTemplateFromJsonPromise(ajaxMethod.getGroupById(this.grpId), page, ()=> {
                console.log("test");
                //$$('#changeKind').click(function () {
                //
                //    $$('#subtraction').show();
                //    $$('#add').show();
                //    $$('#dish').show();
                //    $$('#dish').show();
                //    $$('#changeKind').hide();
                //
                //});

                $$('.btn-outline').click(function () {
                    dihId = $$(this).dataset().dihId;
                    dishes.push([{dihId: dihId, num: 1}]);
                    //$$('#x'+dihId).html();
                });

                $$('#add').click(function () {
                    //console.log("testAdd");
                    $$('#x' + dihId).html(++dish);
                    console.log("++");
                    //===================//
                    for( let d of dishes){
                        if(d.dihId==dihId){
                            d.num=dish;
                        }
                    }
                });
                $$('#subtraction').click(function () {
                    if ($$('#x' + dihId).html() >= 1) {
                        $$('#x' + dihId).html(--dish);

                        for( let d of dishes){
                            if(d.dihId==dihId ){
                                d.num=dish;
                            }
                        }
                    }
                    console.log("--");

                });


            });


            myApp.onPageInit('order', (page) => {

                console.log('order Init');
            });

            //if($$('#dish').html()!=0){
            //    //this.dishes = page.query.dishes || this.dishes;
            //}


            $$('#joinGroup').click(function () {
               dishes = dishes.filter(function(ele){
                    return ele.num > 0;
                    //遍立搜尋且回傳num 不為0的陣列
                });
                //tool.loadTemplateFromJsonPromise( ajaxMethod.getGroupById(Public.usrId,dishes,this.grpId), page, ()=> {
                //
                //});
            });


        });
    }


}

module.exports = OrderPage;
