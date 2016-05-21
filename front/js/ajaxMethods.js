// POST 方法需要传入的参数是JSON.stringify之后的String.

var $$ = Dom7;
var SERVER_ADS = "http://localhost:8080";

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

    this.getGroupedOrdersByUserId = function (usrId) {
        return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/groupedOrdersByUserId/" + usrId,
                function (jsonData) {
                    resolve(jsonData);
                });
        });
    };

    this.getHomePageDataPromise = (usrId) => {
        let groups;
        return new Promise(resolve=> {
            this.getAllGroup().then(_groups=> {
                groups = _groups;
                return this.getGroupedOrdersByUserId(usrId);
            }).then(groupedOrders=> {
                resolve({groups, groupedOrders});
            });
        });
    };

    this.getGroupedOrdersAndSumsByHostIdPromise = function (hostId) {
        return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/groupedOrdersAndSumsByHostId/" + hostId,
                function (jsonData) {
                    resolve(jsonData);
                    for (let a = 0; jsonData.groupedOrderSums.length; a++) {
                        switch (jsonData.groupedOrderSums[a].group.grpStatus) {
                            case 0:
                                jsonData.groupedOrderSums[a].group.grpStatusCh = "未達外送金額";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusName = "未開團";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusDisable = true;
                                break;
                            case 1:
                                jsonData.groupedOrderSums[a].group.grpStatusCh = "已開團";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusName = "確認已開團";
                                break;
                            case 2:
                                jsonData.groupedOrderSums[a].group.grpStatusCh = "已送達";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusName = "確認訂單已完成";
                                break;
                            case 3:
                                jsonData.groupedOrderSums[a].group.grpStatusCh = "已完成";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusName = "";
                                break;
                            case -1:
                                jsonData.groupedOrderSums[a].group.grpStatusCh = "開團失敗";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusName = "";
                                jsonData.groupedOrderSums[a].group.btnChangeStatusDisable = true;
                                break;
                        }
                    }
                });
        });
    };

    this.updateGroupStatusPromise = function (grpId, grpStatus) {
        return new Promise((resolve, reject)=> {
             $$.post(SERVER_ADS + "/groupStatus", {data: JSON.stringify({grpId, grpStatus})},
                function (result) {
                    resolve(result);
                });
        });
    };

};

var ajaxMethods = new AjaxMethods();
module.exports = ajaxMethods;

