/**
 * Created by Zizy on 4/6/16.
 */
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7; // jshint ignore:line
let myApp = null, mainView = null;
let tool = require('../tool.js');


class SelectMerchantPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        myApp.onPageBeforeInit('select-merchant', function (page) {
            console.log('select-merchant before init');
        });
    }


}

module.exports = SelectMerchantPage;
