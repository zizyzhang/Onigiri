// POST 方法需要传入的参数是JSON.stringify之后的String.

var $$ = Dom7;
var SERVER_ADS = "http://localhost:8080";

var AjaxMethods = function () {
    'use strict';


    this.addUserPromise = function (usrName, usrPwd, usrMobi, authCode) {
        return new Promise((resolve, reject)=> {
            let data = JSON.stringify({usrName, usrPwd, usrMobi, authCode});
            $$.post(SERVER_ADS + "/addUser", {data}, function (result) {
                if (JSON.parse(result).success) {
                    resolve(!!result);
                } else {
                    reject(JSON.parse(result).msg);
                }
            });
        });

    };

    this.mobiAuth = function (usrMobi) {
        return new Promise((resolve, reject)=> {

            let data = usrMobi;

            $$.post(SERVER_ADS + "/mobiAuth", {data}, function (result) {
                if (JSON.parse(result).success) {
                    resolve();
                } else {
                    reject();
                }
            });
        });

    };

    this.userAuth = function (usrName, usrPwdSha) {
        return new Promise(function (resolve, reject) {


            $$.post(SERVER_ADS + "/userAuth", {usrName: usrName, usrPwd: usrPwdSha}, function (result) {
                if (JSON.parse(result).success === 1) {
                    console.log('login success');

                    resolve(JSON.parse(result));
                } else {
                    reject(JSON.parse(result).err);
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

    this.getUnjoinedGroups = function (usrId) {
        return new Promise(function (resolve) {
            $$.getJSON(SERVER_ADS + "/unjoinedGroups/" + usrId, function (data) {
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

    this.postMerchantPromise = function (merchant) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/merchant", {data: JSON.stringify(merchant)}, function (data) {
                if (JSON.parse(data).msg) {
                    reject(JSON.parse(data).msg);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    };

    this.postDishPromise = function (dishes) {

        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/dishes", {data: JSON.stringify(dishes)}, function (data) {
                if (JSON.parse(data).msg) {
                    reject(JSON.parse(data).msg);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime,grpAmountLimit) {
        console.log('ajax post Group ', grpHostId, dishes, metId, addr, gorTime,grpAmountLimit);

        return new Promise((resolve, reject)=> {

            $$.post(SERVER_ADS + "/group", {
                data: JSON.stringify({
                    grpHostId,
                    dishes,
                    metId,
                    addr,
                    gorTime,
                    grpAmountLimit
                })
            }, function (data) {
                data = JSON.parse(data);
                console.log(data);
                if (data.msg) {
                    reject(data.msg);
                } else {
                    resolve(data);
                }
            });
        });
    };

    this.joinGroupPromise = function (usrId, dishes, grpId, comments) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/joinGroup",
                {
                    data: JSON.stringify({usrId, dishes, grpId, comments})
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

                });
        });
    };

    this.getconfirmOrderPromise = function (hostId) {
        return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/confirmOrder/" + hostId,
                function (jsonData) {
                    resolve(jsonData);
                });
        });
    };

    this.updateGroupStatusPromise = function (grpId, grpStatus) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/groupStatus?date=" + new Date(), {data: JSON.stringify({grpId, grpStatus})},
                function (result) {
                    resolve(result);
                });
        });
    };

    this.updateOrdStatusPromise = function (ordId, ordStatus) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/updateOrdStatus", {data: JSON.stringify({ordId, ordStatus})},
                function (result) {
                    resolve(result);
                });
        });
    };

    this.getGrpUsersOrdersByHostIdPromise = function (hostId, from) {
        console.log(hostId + ',' + from);
        return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/grpUsersOrdersByHostId/" + hostId + '?from=' + from,
                function (result) {
                    resolve(result);
                });
        });
    };

    this.cancelOrderPromise = function (grpId,usrId) {
         return new Promise((resolve, reject)=> {
            $$.getJSON(SERVER_ADS + "/cancelOrder/" + grpId + '/'+usrId,
                function (result) {
                    if(result.success) {
                        resolve(result);
                    }else{
                        reject(result.err);
                    }
                });
        });
    };



    this.getComment = function (gmrId, comStatus) {
        return new Promise((resolve, reject)=> {
            $$.post(SERVER_ADS + "/getGrpMember", {data: JSON.stringify({gmrId, comStatus})},
                function (result) {
                    resolve(result);
                });
        });
    };


};

var ajaxMethods = new AjaxMethods();
module.exports = ajaxMethods;

