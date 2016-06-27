'use strict';
/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
const cookies = require('js-cookie');
let Vue = require('vue');
let _ = require('lodash');


class Home { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        let that = this;
        myApp.onPageBeforeInit('home', function (page) {//TODO second


            if (page.query.ajaxResult) {
                window.homeAjaxResult = page.query.ajaxResult;
             } else {
                page.query.ajaxResult =window.homeAjaxResult;
            }
            let ajaxRequest =_.cloneDeep(page.query.ajaxResult);//不變的

            let vueGroups = new Vue({
                el: '#tabGroups',
                data: page.query.ajaxResult,
            });

            let vueMyOrders = new Vue({
                el: '#tabMyOrders',
                data: page.query.ajaxResult
            });

            let vuePopoverFilter = new Vue({
                el:'#popoverFilter',
                computed:{
                    merchantTypes:function(){
                        return _.chain(ajaxRequest.groups.map(o=>o.merchant.metType)).clone().uniq().value();
                    }
                },
                methods:{
                    filter : function(typeName){
                        console.log(typeName);
                        vueGroups.$set('groups', _.filter(_.clone(ajaxRequest.groups), row=>row.merchant.metType===typeName));
                    },
                    allTypes : function(){
                        vueGroups.$set('groups',_.clone(ajaxRequest.groups));

                    }
                }

            });

            let vuePopoverOrder = new Vue({
                el: "#popoverOrder",
                methods: {
                    popNewGroup: function () {
                        vueGroups.$set('groups', _.sortBy(vueGroups.$data.groups, row=>-Number(new Date(row.grpCreateTime).getTime())));
                        myApp.closeModal(this.el);
                    },
                    popCloseDeadline: function () {
                        vueGroups.$set('groups', _.sortBy(vueGroups.$data.groups, row=>Number(new Date(row.grpTime).getTime())));
                        myApp.closeModal(this.el);
                    },
                    popFarDeadline: function () {
                        vueGroups.$set('groups', _.sortBy(vueGroups.$data.groups, row=>-Number(new Date(row.grpTime).getTime())));
                        myApp.closeModal(this.el);
                    },
                    popOldGroup: function () {
                        vueGroups.$set('groups', _.sortBy(vueGroups.$data.groups, row=>Number(new Date(row.grpCreateTime).getTime())));
                        myApp.closeModal(this.el);
                    }
                },

            });

            $$('.btn-join-in-group-page').on('click', function () {

                let grpId = $$(this).dataset().grpId;
                console.log(`grpId   : ${grpId}`);

                cookies.set('selectedGroupId', grpId);
                mainView.router.loadPage(`order.html?grpId=${grpId}`);


            });


            $$('.js-btn-contact-host').click(function () {
                window.location.href = 'tel:' + $$(this).data('grp-host-mobi');
            });

            $$('.btn-group-detail').on('click', function () {

                let grpId = $$(this).dataset().grpId;
                console.log(`grpId : ${grpId}`);

                cookies.set('selectedGroupId', grpId);

                mainView.router.loadPage(`group-detail.html?grpId=${grpId}`);

            });
            $$('.card-img').on('click', function () {

                let grpId = $$(this).dataset().grpId;
                console.log(`grpId : ${grpId}`);

                cookies.set('selectedGroupId', grpId);

                mainView.router.loadPage(`group-detail.html?grpId=${grpId}`);
            });
            $$('.orderDetail').on('click', function () {

                let grpId = $$(this).dataset().grpId;
                mainView.router.loadPage({url: `order-detail.html?grpId=${grpId}`});

            });

        });

    }

    changeTabGroup() {
        //console.log("asdfasdfas");
        myApp.showTab("#tabGroups");

    }

    changeTabOrder() {
        myApp.showTab('#tabMyOrders');
    }
}


module.exports = Home;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法