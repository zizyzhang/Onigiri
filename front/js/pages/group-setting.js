/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');


class GroupSettingPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('group-setting', function (page) {
            console.log('group-setting init');
            console.log('group-setting init');
            
            let arrayOfDishIds  = this.arrayOfDishIds = page.query.arrayOfDishIds || this.arrayOfDishIds;
            let metId  = this.arrayOfDishIds = page.query.arrayOfDishIds || this.arrayOfDishIds;

            $$('#btnFinish').on('click', function () {
                let 
                
                tool.loadTemplateFromJsonPromise(ajaxMethod.postGroup(grpHostId,arrayOfDishIds,metId,addr,gorTime)).then(()=>{
                    myApp.alert('开团完成!', function () {
                         mainView.router.loadPage('group.html');
                     });
                });
             });
        });
    }

}

module.exports = GroupSettingPage;
