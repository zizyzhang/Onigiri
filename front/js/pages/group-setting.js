/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Public = require('../public.js');
const cookies = require('js-cookie');
const _ = require('lodash');

let products;//產品們 productId: Integer productName : String , productPrice : Integer


class GroupSettingPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bindDishes() {
        $$('.js-dishPrice').on('keyup', function () {
            let product = _.find(products, row=>row.productId === Number($$(this).dataset().id));

            if (product) {
                product.productPrice = $$(this).val();
            }
            console.log(products);


        });

        $$('.js-dishName').on('keyup', function () {
            let product = _.find(products, row=>row.productId === Number($$(this).dataset().id));

            if (product) {
                product.productName = $$(this).val();
            }
            console.log(products);

        });
    }

    bind() {

        let that = this;
        myApp.onPageBeforeInit('group-setting', function (page) {
            console.log('group-setting init');


            products = [{productId: 0, productName: "", productPrice: 0}];
            $$('#addProduct').on('click', function () {


                $$('#products').append(`
                    <div class="card ">
                            <div class="card-header">商品${products.length + 1}</div>
                            <div class="card-content">
                                <div class="card-content-inner">
                                    <div class="list-block">
                                        <ul class="group-setting-dishes">
                                            <li>
                                                <div class="item-content">
                                                    <!--<div class="item-media"><i class="icon icon-form-name"></i></div>-->

                                                    <div class="item-inner">

                                                        <div class="item-title label">商品名稱</div>


                                                        <div class="item-input item-input-field">
                                                            <input type="text" placeholder="商品名稱"   data-id="${products.length}" class="js-dishName">
                                                        </div>
                                                    </div>
                                                </div>

                                            </li>
                                            <li>
                                                <div class="item-content">

                                                    <div class="item-inner">

                                                        <div class="item-title label">商品價格</div>
                                                         <div class="item-input item-input-field">
                                                            <input type="text" placeholder="商品價格"   data-id="${products.length}" class="js-dishPrice">
                                                        </div>
                                                    </div>
                                                </div>

                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                `);
                products.push({productId: products.length, productName: "", productPrice: 0});

                that.bindDishes();

            });

            that.bindDishes();

            $$('#btnFinish').on('click', function () {

                //let dishes = this.arrayOfSelectedDishIds = page.query.arrayOfSelectedDishIds || this.arrayOfSelectedDishIds;


                let grpHostId = cookies.getJSON('user').usrId;
                let addr = $$('#grpAdr').val();
                let gorTime = $$('#grpTime').val();

                let metName = $$('#merchantName').val();
                let metPhone = $$('#merchantMob').val();
                let metMinPrice = $$('#minPrice').val();
                let metPicUrl = 'http://i.imgur.com/SoiypRh.jpg';
                let metId = -1;

                if (!(addr && gorTime && metName && metPhone && metMinPrice)) {
                    myApp.alert('資料填寫不完整');
                    return;
                }


                for (let i = 0; i < products.length; i++) {
                    if (!(products[i].productPrice && products[i].productName )) {
                        myApp.alert('商品資訊填寫不完整');
                        return;
                    }
                    if (!tool.isNumeric(products[i].productPrice)) {
                        myApp.alert('商品資訊錯誤');
                        return;
                    }
                }

                if (!tool.isNumeric(metMinPrice)) {
                    myApp.alert('資料錯誤');
                    return;
                }


                //  Check Time
                let deadLine = new Date(gorTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016'));
                if (deadLine.getTime() < new Date().getTime()) {
                    myApp.alert('時間輸入錯誤');
                    return;
                }


                //新增商家
                ajaxMethod.postMerchantPromise({metName, metPhone, metMinPrice, metPicUrl}).then((result)=> {
                    //新增DISH
                    console.log(result);
                    metId = result.merchant.metId;
                    let dishes = products.map(row=> {
                        return {
                            dihName: row.productName,
                            dihPrice: row.productPrice,
                            metId: metId,
                        };
                    });


                    return ajaxMethod.postDishPromise(dishes);
                }).then(result=> {
                    //新增團
                    let dishes = result.dishes.map(row=>row.dihId);

                    return ajaxMethod.postGroup(grpHostId, dishes, metId, addr, gorTime);
                }).then(()=> {
                    //完成新增
                    myApp.alert('開團完成!', function () {
                        tool.loadPage('home.html',mainView, ajaxMethod.getHomePageDataPromise(cookies.getJSON('user').usrId));
                    });
                }).catch(e=>myApp.alert('開團失敗: ' + e.toString()));


            });

            var today = new Date();
            today.setTime(new Date().getTime() + (60 * 60 * 1000));

            let futureDays = new Date();
            let futureDaysArr = [[], []];
            for (let b = 0; b < 60; b++) {
                futureDaysArr[0].push( (futureDays.getYear() + 1900)+'年'+(futureDays.getMonth() + 1) + '月' + futureDays.getDate() + '日' );
                futureDaysArr[1].push(b);
                futureDays.setTime(futureDays.getTime() + 1000 * 3600 * 24);

            }


            var pickerInline = myApp.picker({
                input: '#grpTime',
                //container: '#picker-date-container',
                //toolbar: false,
                rotateEffect: true,

                value: [0, today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],

                onChange: function (picker, values, displayValues) {
                    //var daysInMonth = new Date(picker.value[2], picker.value[0] * 1 + 1, 0).getDate();
                    //if (values[1] > daysInMonth) {
                    //    picker.cols[1].setValue(daysInMonth);
                    //}
                },

                formatValue: function (p, values, displayValues) {
                    console.log(displayValues);
                    return `${displayValues[0]}, ` + values[1] + ':' + values[2];
                },

                cols: [
                    // Days
                    {
                        values: futureDaysArr[1],
                        displayValues: futureDaysArr[0],
                        textAlign: 'center'
                    },


                    // Space divider
                    {
                        divider: true,
                        content: ' '
                    },
                    // Hours
                    {
                        values: (function () {
                            var arr = [];
                            for (var i = 0; i <= 23; i++) {
                                arr.push(i);
                            }
                            return arr;
                        })(),
                    },
                    // Divider
                    {
                        divider: true,
                        content: ':'
                    },
                    // Minutes
                    {
                        values: (function () {
                            var arr = [];
                            for (var i = 0; i <= 59; i++) {
                                arr.push(i < 10 ? '0' + i : i);
                            }
                            return arr;
                        })(),
                    }
                ]
            });
            $$('#grpTime').val('');

            //If group passed =>
            if (page.query.group) {
                let group = page.query.group;
                let merchant = group.merchant;
                let menu = group.menu;

                let grpHostId = cookies.getJSON('user').usrId;
                $$('#grpAdr').val(group.grpAddr);
                //$$('#grpTime').val('');

                $$('#merchantName').val(merchant.metName);
                $$('#merchantMob').val(merchant.metPhone);
                $$('#minPrice').val(merchant.metMinPrice);

                let dishIndex = 0;

                let dishes = [];
                menu.map(obj=> {
                    obj.dishes.map(obj2=>dishes.push(obj2));
                });

                for (let dish of dishes) {
                    $$(`.js-dishName[data-id="${dishIndex}"]`).val(dish.dihName);
                    $$(`.js-dishPrice[data-id="${dishIndex}"]`).val(dish.dihPrice);
                    products[dishIndex].productName = dish.dihName;
                    products[dishIndex].productPrice = dish.dihPrice;


                    dishIndex++;

                    if (dishIndex < dishes.length) {
                        $$('#addProduct').trigger('click');
                    }


                }
            }
        });


    }

}

module.exports = GroupSettingPage;
