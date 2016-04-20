/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let Public = require('../public.js');
const cookies = require('js-cookie');

class GroupSettingPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {
        myApp.onPageBeforeInit('group-setting', function (page) {
            console.log('group-setting init');


            $$('#btnFinish').on('click', function () {

                let dishes = this.arrayOfSelectedDishIds = page.query.arrayOfSelectedDishIds || this.arrayOfSelectedDishIds;
                let grpHostId = cookies.getJSON('user').usrId;
                let metId = cookies.getJSON('selectedMerchantId');
                let addr = $$('#grpAdr').val();
                let gorTime = $$('#grpTime').val();

                 ajaxMethod.postGroup(grpHostId, dishes, metId, addr, gorTime).then(()=> {
                    myApp.alert('开团完成!', function () {
                        mainView.router.loadPage('home.html');
                    });
                });

            });

            var today = new Date();

            var pickerInline = myApp.picker({
                input: '#grpTime',
                //container: '#picker-date-container',
                //toolbar: false,
                rotateEffect: true,

                value: [today.getMonth()+1, today.getDate(),   today.getHours(), (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())],

                onChange: function (picker, values, displayValues) {
                    var daysInMonth = new Date(picker.value[2], picker.value[0]*1 + 1, 0).getDate();
                    if (values[1] > daysInMonth) {
                        picker.cols[1].setValue(daysInMonth);
                    }
                },

                formatValue: function (p, values, displayValues) {
                    console.log(displayValues);
                    return `${values[0]}月` + ' ' + values[1] + '日, ' + values[2] + ':' + values[3] ;
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
                        values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
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
                            for (var i = 0; i <= 23; i++) { arr.push(i); }
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
                            for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                            return arr;
                        })(),
                    }
                ]
            });

        });


    }

}

module.exports = GroupSettingPage;
