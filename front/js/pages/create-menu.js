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

            let metId =Number(cookies.get('selectedMerchantId'));
            console.log('onPageBeforeInit : create-menu');


            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getMerchantById(metId), page, ()=> {
                console.log();

                $$('.dih-checkbox').change(function () {
                    console.log('dihId:', $$(this).dataset().dihId);
                });

                $$('#btnGoToGroupSetting').click(function () {


                    let arrayOfSelectedDishIds = [];
                    let checkedCheckBoxes = _.filter(Array.from($$('.dih-checkbox')), el=>$$(el).prop('checked') === true);
                    for (let checkbox of checkedCheckBoxes) {

                        arrayOfSelectedDishIds.push($$(checkbox).dataset().dihId);
                    }

                    console.log(arrayOfSelectedDishIds);

                    mainView.router.loadPage({url: 'group-setting.html', query: {arrayOfSelectedDishIds}});
                });


            });
        });
    }

}

module.exports = CreateMenuPage;////TODO third
