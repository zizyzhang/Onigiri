/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');
let myApp = null, mainView = null;


class OrderPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind(){
        myApp.onPageBeforeInit('order',function (page) {
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
