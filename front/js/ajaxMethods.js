// POST 方法需要传入的参数是JSON.stringify之后的String.

var $$ = Dom7;
var SERVER_ADS = "http://localhost:3000";

var AjaxMethods = function () {
    'use strict';
    this.addUser = function () {
        var subname = $$('#subAccount').val();
        var subpwd = $$('#subPwd').val();
        var submobile = $$('#subMobile').val();
        $$.post(SERVER_ADS + "/addUser", {usrName: subname, usrPwd: subpwd, usrMobi: submobile}, function (result) {
            if (result) {

            }
        });
    };

    this.userAuth = function () {
        return new Promise(function (resolve, reject) {
            var usrName = $$('#txtUsrName').val();


            var usrPwd = $$('#txtUsrPwd').val();


            $$.post(SERVER_ADS + "/userAuth", {usrName: usrName, usrPwd: usrPwd}, function (result) {
                if (JSON.parse(result).success === 1) {
                    console.log('login success');

                    resolve(JSON.parse(result));
                } else {
                    reject();
                }
            });
        });


    };

    this.getAllGroup = function () {
        return new Promise(function (resolve) {
            $$.getJSON(SERVER_ADS + "/allGroup", function (data) {
                resolve(data);
            });
        });
    };

    this.getMerchantById = function (id) {
        return new Promise(resolve => {
            $$.getJSON(SERVER_ADS + "/merchantById/" + id, function (data) {

                resolve(data);
            });
        });
    };


    this.allMerchant = function () {
        return new Promise(function (resolve) {
            $$.getJSON(SERVER_ADS + "/allMerchant", function (data) {
                console.log(data);
                resolve(data);
            });
        });
    };

    this.getGroupById = function (id) {
        return new Promise((resolve)=> {
            $$.getJSON(SERVER_ADS + "/groupById/" + id, function (data) {
                resolve(data);
            });
        });

    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime) {
        console.log('ajax post Group ', grpHostId, dishes, metId, addr, gorTime);

        return new Promise(resolve=> {

            $$.post(SERVER_ADS + "/group", {
                data: JSON.stringify({
                    grpHostId,
                    dishes,
                    metId,
                    addr,
                    gorTime
                })
            }, function (data) {
                data = JSON.parse(data);
                console.log(data);
                if (data.success === 1) {
                    resolve();
                }
            });
        });
    };

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/joinGroup",
                {
                    data: JSON.stringify({usrId, dishes, grpId})
                }, function (data) {
                    data = JSON.parse(data);
                    if (data.success === 1) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                });
        });
    };

    this.getOrderByUserIdPromise = function (usrId) {
        return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/ordersByUserId/"+usrId,
                function (jsonData) {
                    resolve(jsonData);
                });
        });
    };

    this.getHomePageDataPromise = (usrId) => {
        let groups;
        return new Promise(resolve=>{
            this.getAllGroup().then(groups=>{
                return this.getOrderByUserIdPromise(usrId);
            }).then(orders=>{
                let groupOrders= [];
                for(let order of orders) {
                    let tOrder = groupOrders.find(gor=>gor.grpId === order.group.grpId);
                    if(tOrder){
                        tOrder.orders.push(order);
                    }else{
                        tOrder.push({grpId:order.group.grpId,orders:[order]});
                    }
                }
                resolve({groups, groupOrders});
            });
        });
    };

};

var ajaxMethods = new AjaxMethods();
module.exports = ajaxMethods;

