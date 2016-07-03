/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');

class GroupDetailPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {

        myApp.onPageBeforeInit('group-detail', (page) => {
            this.grpId = page.query.grpId || this.grpId;
            let that = this;

            console.log('group-detail onPageBeforeInit');

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(this.grpId), page, ()=> {
                $$('#btnJoin').on('click', function () {

                    tool.loadPage('order.html', mainView, ajaxMethod.getGroupById(that .grpId));
                });

            });
        });

        myApp.onPageInit('group-detail', (page) => {

            console.log('group-detail Init');
        });
    }

}

module.exports = GroupDetailPage;
