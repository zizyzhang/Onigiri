'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Vue = require('vue');
let cookies = require('js-cookie');


class OrderDetailPage { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('order-detail', function (page) {//TODO second
            let grpId = page.query.grpId || this.grpId;
            let usrId = cookies.getJSON('user').usrId;

            // console.log(grpId);

            ajaxMethod.getGroupById(grpId).then(function (result) {

                // console.log('order-detail result before', JSON.stringify(result));
                result.grpComments = result.grpComments.filter(uc=>uc.usrId === usrId);
                console.log('order-detail result after', JSON.stringify(result));
                // console.log('order-detail result grpComments', JSON.stringify(result.grpComments));
                
                let vueOrderDteail = new Vue({
                    el: '#orderDteail',
                    data: result
                });

                $$('.js-btn-contact-host').click(function () {
                    console.log("1");
                    window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
                });

                $$('.js-btn-cancel-order').click(function () {
                    /*ajaxMethod.cancelOrderPromise(grpId, usrId).then(()=> {
                        myApp.alert('取消成功', '販團', ()=> {
                            tool.loadPage('./html/home.html', mainView, ajaxMethod.getHomePageDataPromise(usrId));
                        });

                    }).catch(e=> {
                        myApp.alert(e);
                    });*/
					
					myApp.alert('正在取消', '販團', ()=> {
                            tool.loadPage('./html/home.html', mainView, ajaxMethod.getHomePageDataPromise(usrId));
                        });
                });
                

            });

            // tool.loadTemplateFromJsonPromise(myApp, ajaxMethod.getGroupById(grpId), page, ()=> {
            //     // console.log('order-detail page',page);
            //
            //     $$('.js-btn-contact-host').click(function () {
            //         console.log("1");
            //         window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
            //     });
            //
            //     $$('.js-btn-cancel-order').click(function () {
            //         ajaxMethod.cancelOrderPromise(grpId, usrId).then(()=> {
            //             myApp.alert('取消成功', '販團', ()=> {
            //                 tool.loadPage('./html/home.html', mainView, ajaxMethod.getHomePageDataPromise(usrId));
            //             });
            //
            //         }).catch(e=> {
            //             myApp.alert(e);
            //         });
            //     });
            //
            // });


        });

    }

}

module.exports = OrderDetailPage;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法