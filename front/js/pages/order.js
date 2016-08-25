/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');
let myApp = null, mainView = null;
let Vue = require('vue');
let _ = require('lodash');
const cookies = require('js-cookie');


//创建一个Map: {dihId : dihNum}
let comments;
class OrderPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }
    
    bind() {
        let self = this;
        myApp.onPageBeforeInit('order', function (page) {
            console.log('before order init');
            let usrId = cookies.getJSON('user').usrId;

            let grpId = Number(cookies.get('selectedGroupId'));
            //let comments = page.query.comments;


            let selectedGroupId = Number(cookies.get('selectedGroupId'));
            self.ordersMap = new Map();

            //tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(selectedGroupId), page, (group)=> {


            if (page.query.ajaxResult) {
                window.orderAjaxResult = page.query.ajaxResult;
            } else {
                page.query.ajaxResult = window.orderAjaxResult;
            }

                //console.log(group.grpHost.usrName);


            console.log('orderPage Query', page.query);

            let vuePage = new Vue({
                el: '#order',
                data:  page.query.ajaxResult,
                computed:{
                    isExtraOrder:()=>!!page.query.isExtraOrder
                }

            });



            let group = page.query.ajaxResult;

            self.dishes = group.grpDishes.map(gdh=>gdh.dish);




            for (let groupDish of group.grpDishes) {

                self.ordersMap.set(groupDish.dish.dihId, 0);
            }
            //console.log('map', self.ordersMap);


            $$('.btn-dish-price').click(function () {
                let dihId = $$(this).dataset().dihId;
                self.onOrderNumberChange(dihId, 1);
            });

            $$('.btn-add').click(function () {
                let dihId = $$(this).dataset().dihId;
                self.onOrderNumberChange(dihId, 1);
            });

            $$('.btn-subtraction').click(function () {
                let dihId = $$(this).dataset().dihId;
                self.onOrderNumberChange(dihId, -1);
            });

            $$('#btnJoinGroup').click(()=> {
                let dishes = [];
                comments=window.comments;
                for (let [odrDishId,odrDishNum] of self.ordersMap.entries()) {
                    if (odrDishNum === 0) {
                        continue;
                    }
                    dishes.push({dihId: odrDishId, num: odrDishNum});
                }

                if (dishes.length === 0) {
                    myApp.alert('未選擇商品');
                    return;
                }



                    console.log(JSON.stringify({usrId, dishes, grpId,comments}));

                    ajaxMethod.joinGroupPromise(usrId, dishes, grpId,comments).then((data)=> {
                        myApp.alert('加購成功', function () {
                            tool.loadPage('home.html',mainView, ajaxMethod.getHomePageDataPromise(usrId));
                        });
                    }).catch(e=> myApp.alert(JSON.stringify(e)+'加購失敗!'));


                    window.comments = "";


                });

                $$('#btnNote').on('click', function () {
                    myApp.popup('.popup-message');
                });



        });


        //});


    }

    //加为1,减为-1
    onOrderNumberChange(dihId, plusOrReduce) {

        let dihNum = Number(this.ordersMap.get(dihId)) + plusOrReduce;
        console.log(dihId, plusOrReduce, this.ordersMap, dihNum);

        this.ordersMap.set(dihId, Number(dihNum));

        if (dihNum <= 0) {
            $$(`.dish-price[data-dih-id="${dihId}"]`).css('display', 'block');
            $$(`.dish-option[data-dih-id="${dihId}"]`).css('display', 'none');
        } else {
            $$(`.dish-price[data-dih-id="${dihId}"]`).css('display', 'none');
            $$(`.dish-option[data-dih-id="${dihId}"]`).css('display', 'block');
        }

        $$(`.dish-num[data-dih-id="${dihId}"]`).text(dihNum);
        this.calcPrice();


    }

    calcPrice() {
        let totalPrice = 0;
        for (let [odrDishId,odrDishNum] of this.ordersMap.entries()) {
            //console.log(odrDishId, odrDishNum);
            totalPrice += odrDishNum * this.dishes.find(d=>d.dihId === odrDishId).dihPrice;
        }

        $$('#total-price').text(`$${totalPrice}`);

    }


}

module.exports = OrderPage;
