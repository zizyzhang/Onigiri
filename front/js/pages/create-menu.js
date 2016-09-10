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


class CreateMenuPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        myApp.onPageBeforeInit('create-menu', function (page) {//TODO second

            let metId = Number(cookies.get('selectedMerchantId'));
            console.log('onPageBeforeInit : create-menu');


            tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getMerchantById(metId), page, ()=> {

                $$('#selectAll').click(function () {
                    myApp.showIndicator();
                    setTimeout(()=> {
                        $$('.dih-checkbox').click();
                        myApp.hideIndicator();
                    }, 200);

                });

                $$('#btnGoToGroupSetting').click(function () {


                    let arrayOfSelectedDishIds = [];
                    let checkedCheckBoxes = _.filter(Array.from($$('.dih-checkbox')), el=>$$(el).prop('checked') === true);
                    for (let checkbox of checkedCheckBoxes) {
                         arrayOfSelectedDishIds.push($$(checkbox).dataset().dihId);
                    }

                    if(arrayOfSelectedDishIds.length===0){
                        myApp.alert('未選擇商品');
                    }


                    mainView.router.loadPage({url: './html/group-setting-simple.html', query: {arrayOfSelectedDishIds,date:new Date()}});
                });


            });
        });
    }

}

module.exports = CreateMenuPage;////TODO third
