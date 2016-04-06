/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');


class OrderPage {
    constructor(myApp, mainView) {
        this.myApp=myApp;
        this.mainView=mainView;
    }

    bind(){
        this.myApp.onPageBeforeInit('order',function (page) {
            console.log('before order init');


            $$('#add').click(function () {
                //$$('#dish').html(++dish);
                //console.log("++");

            });
            $$('#subtraction').click(function () {
                //if ($$('#dish').html() >= 1) {
                //    $$('#dish').html(--dish);
                //
                //}
                //console.log("--");

            });
        });
    }


}

module.exports = OrderPage;
