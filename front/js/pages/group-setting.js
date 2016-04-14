/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Public = require('../public.js');
const cookies = require('js-cookie');

class GroupSettingPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('group-setting', function (page) {
            console.log('group-setting init');


            $$('#btnFinish').on('click', function () {

                let dishes = this.arrayOfSelectedDishIds = page.query.arrayOfSelectedDishIds || this.arrayOfSelectedDishIds;
                let grpHostId = cookies.getJSON('user').usrId;
                let metId = cookies.getJSON('selectedMerchantId');
                let addr = $$('#txtGrpAddr').text();
                let gorTime = $$('#txtGrpTime').text();

                 ajaxMethod.postGroup(grpHostId, dishes, metId, addr, gorTime).then(()=> {
                    myApp.alert('开团完成!', function () {
                        mainView.router.loadPage('group.html');
                    });
                });

            });
        });
    }

}

module.exports = GroupSettingPage;
