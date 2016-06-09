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
    bindDishes(){
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
                product.productName= $$(this).val();
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
                            <div class="card-header">商品${products.length+1}</div>
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
                let metPicUrl = '';
                let metId = -1;

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

                    ajaxMethod.postGroup(grpHostId, dishes, metId, addr, gorTime).then(()=> {
                        myApp.alert('開團完成!', function () {
                            mainView.router.loadPage('home.html');
                        });
                    });
                }).catch(e=>myApp.alert('開團失敗' +e.toString()));


            });

            var today = new Date();
            today.setTime(new Date().getTime() + (60 * 60 * 1000));

            var pickerInline = myApp.picker({
                input: '#grpTime',
                //container: '#picker-date-container',
                //toolbar: false,
                rotateEffect: true,

                value: [today.getMonth() + 1, today.getDate(), today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],

                onChange: function (picker, values, displayValues) {
                    var daysInMonth = new Date(picker.value[2], picker.value[0] * 1 + 1, 0).getDate();
                    if (values[1] > daysInMonth) {
                        picker.cols[1].setValue(daysInMonth);
                    }
                },

                formatValue: function (p, values, displayValues) {
                    console.log(displayValues);
                    return `${values[0]}月` + ' ' + values[1] + '日, ' + values[2] + ':' + values[3];
                },

                cols: [
                    // Months
                    {
                        values: ('1 2 3 4 5 6 7 8 9 10 11 12').split(' '),
                        //displayValues: ('1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月').split(' '),
                        textAlign: 'center'
                    },
                    // Space divider
                    {
                        divider: true,
                        content: '月'
                    },
                    // Days
                    {
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
                        textAlign: 'center',

                    },

                    // Space divider
                    {
                        divider: true,
                        content: '日'
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

        });


    }

}

module.exports = GroupSettingPage;
