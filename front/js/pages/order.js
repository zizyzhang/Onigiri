/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let tool = require('../tool.js');
let myApp = null, mainView = null;
const cookies = require('js-cookie');

//创建一个Map: {dihId : dihNum}

class OrderPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;
    }

    bind() {
        let self = this;
        myApp.onPageBeforeInit('order', function (page) {
            console.log('before order init');
            let selectedGroupId = Number(cookies.get('selectedGroupId'));
            self.ordersMap = new Map();

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(selectedGroupId), page, (group)=> {
                self.dishes = group.grpDishes.map(gdh=>gdh.dish);

                console.log(group.grpHost.usrName);
                let grpId = Number(cookies.get('selectedGroupId'));
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

                    for (let [odrDishId,odrDishNum] of self.ordersMap.entries()) {
                        if(odrDishNum===0) {
                            continue;
                        }
                        dishes.push({dihId: odrDishId, num: odrDishNum});
                    }

                    if(dishes.length===0){
                        myApp.alert('未選擇商品');
                        return;
                    }



                    let usrId = cookies.getJSON('user').usrId;
                    console.log(JSON.stringify({usrId, dishes, grpId}));

                    ajaxMethod.joinGroupPromise(usrId, dishes, grpId).then((data)=> {
                        myApp.alert('加入成功', function () {
                            tool.loadPage('home.html',mainView, ajaxMethod.getHomePageDataPromise(usrId));
                        });
                    }).catch(e=> myApp.alert(JSON.stringify(e)+'加入失敗!'));


                });
                $$('#btnNote').click(function () {
                    let grpHost = group.grpHost.usrName;

                    mainView.router.load({
                        url:'message.html',
                        query:{grpHost,grpId}
                    });
                });

            });


        });


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
