/**
 * Created by Zizy on 4/6/16.
 */
/**
 * Created by Zizy on 4/6/16.
 */
'use strict';
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7; // jshint ignore:line
let myApp = null, mainView = null;
let tool = require('../tool.js');
let metId=0;

class SelectMerchantPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {


        myApp.onPageBeforeInit('select-merchant',  function (page){
            console.log('select-merchant before init');

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.allMerchant(), page, ()=> {
                //函数绑定要在完成template之后
                $$('.isChecked').on('click',function(){
                    metId = $$(this).dataset().metId;
                    console.log(`radio-metId : ${metId}`);

                });
                $$('#btn-create-menu').on('click', function () {
                    //let metId = $$(this).dataset().metId;
                    //let metId = $$('').dataset().metId;

                    console.log(`metId : ${metId}`);
                    mainView.router.loadPage(`create-menu.html?metId=${metId}`); //傳 id



                });

            });
        });
    }


}

module.exports = SelectMerchantPage;
