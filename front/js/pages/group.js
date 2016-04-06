/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');


class GroupPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {

        myApp.onPageBeforeInit('group', (page) => {
            console.log('group before init');

            tool.loadTemplateFromJsonPromise(ajaxMethod.getAllGroup, page, ()=> {
                 //函数绑定要在完成template之后
                $$('.btn-join-in-group-page').on('click', function () {

                    let metId = $$(this).dataset().metId;
                    console.log(`metId : ${metId}`);

                    mainView.router.loadPage(`order.html?metId=${metId}`);

                });

                $$('.btn-group-detail').on('click', function () {

                    let metId = $$(this).dataset().metId;
                    console.log(`metId : ${metId}`);


                    mainView.router.loadPage(`group-detail.html?metId=${metId}`);

                });
            });
        });
    }


}

module.exports = GroupPage;
