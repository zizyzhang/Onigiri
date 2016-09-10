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
const cookies = require('js-cookie');

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
                //$$('.isChecked').on('touchstart',function(){
                //  });

                $$('#btn-create-menu').on('click', function () {



                    metId = $$('input:checked').dataset().metId;

                    if(!metId){
                        myApp.alert('未選擇商家');
                        return;
                    }

                     mainView.router.loadPage(`./html/create-menu.html?metId=${metId}`); //傳 id
                    cookies.set('selectedMerchantId', metId);

                });

            });
        });
    }


}

module.exports = SelectMerchantPage;
