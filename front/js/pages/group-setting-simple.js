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

class GroupSettingSimple { //TODO first
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        let that = this;


        myApp.onPageBeforeInit('group-setting-simple', function (page) {//TODO second
            that.initTimePicker();

            let vuePage = new Vue({
                el:'#group-setting-simple',

                data:{
                    dishes : page.query.arrayOfSelectedDishIds
                },
                methods: {
                    simpleSettingFinish: function () {
                        let that = this;
                        let grpHostId = cookies.getJSON('user').usrId;
                        let addr = $$('#grpAdrSimple').val();
                        let gorTime = $$('#grpTimeSimple').val();
                        let metId = cookies.get('selectedMerchantId');

                        if (!(addr && gorTime )) {
                            myApp.alert('資料填寫不完整');
                            return;
                        }


                        //  Check Time
                        let deadLine = new Date(gorTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016'));
                        if (deadLine.getTime() < new Date().getTime()) {
                            myApp.alert('時間輸入錯誤');
                            return;
                        }

                        ajaxMethod.postGroup(grpHostId, that.dishes, metId, addr, gorTime).then(()=> {
                            //完成新增
                            myApp.alert('開團完成!', function () {
                                tool.loadPage('home.html',mainView, ajaxMethod.getHomePageDataPromise(cookies.getJSON('user').usrId));
                            });
                        }).catch(e=>myApp.alert('開團失敗: ' + e.toString()));


                    }
                }
            });
        });
    }
    initTimePicker(){
        var today = new Date();
        today.setTime(new Date().getTime() + (60 * 60 * 1000));

        let futureDays = new Date();
        let futureDaysArr = [[], []];
        for (let b = 0; b < 60; b++) {
            futureDaysArr[0].push( (futureDays.getYear() + 1900)+'年'+(futureDays.getMonth() + 1) + '月' + futureDays.getDate() + '日' );
            futureDaysArr[1].push(b);
            futureDays.setTime(futureDays.getTime() + 1000 * 3600 * 24);
        }

        console.log('today'+today);
        console.log('futureDays.getHours()'+futureDays.getHours());
        let nhour = futureDays.getHours()==23 ? 1 : 0;
        console.log('nhour'+nhour);

        var pickerInline = myApp.picker({
            input: '#grpTimeSimple',
            //container: '#picker-date-container',
            //toolbar: false,
            rotateEffect: true,

            // value: [0, today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],
            value: [nhour, today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],

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
        $$('#grpTimeSimple').val('');
    }
}

module.exports = GroupSettingSimple;////TODO third
//TODO fourth : 加入到Main.js里面注册bind方法