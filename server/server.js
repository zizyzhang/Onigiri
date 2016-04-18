/**
 * Created by User on 2016/3/24.
 */

'use strict';
const isDebug = true;

const _ = require('lodash');
require('source-map-support').install();
const standardClassFactory = require('./standard-class-factory.js');

var Server = function () {

    var express = require('express');
    var bodyParser = require('body-parser');
//var db = require('/batabase.js');

    var app = express();

    var db = require('./mock-db');

    var self = this;
//
//var group1 = [
//    {
//        grpHostId: 'c',
//        dishes: '111',
//        metId: '567',
//        addr:"qqqqq",
//        gorTime:"00:0",
//        minAmount:"9999"
//    }
//
//]

    var joinGroup1 = [
        {
            usrId: 'd',
            dishes: '0.1',
            grpId: '6666'
        }

    ];


    var allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };


    app.use(allowCrossDomain);//CORS middleware
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/db', function (req, res) {
        if (isDebug) {
            res.json(db);
        }
    });

    app.post('/addUser', function (req, res) {


            var usrName = req.body.usrName;
            var usrPwd = req.body.usrPwd;
            var usrMobi = req.body.usrMobi;
            //console.log(JSON.stringify(req.body));
            addUser(usrName, usrPwd, usrMobi, function (result) {

            });
        }
    );


    app.post('/userAuth', function (req, res) {
            var usrName = req.body.usrName;
            var usrPwd = req.body.usrPwd;

            //console.log(JSON.stringify(req.body));

            self.userAuth(usrName, usrPwd, function (result) {
                res.json(result);
            });

        }
    );

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allGroup(function (result) {
            res.json(result);
        });
    });

    app.get('/groupById/:id', (req, res)=> {
        self.getGroupById(Number(req.params.id), result=>res.json(result));
    })

    app.get('/allMerchant', function (req, res) {
        // Pass to next layer of middleware
        self.allMerchant(function (result) {
            res.json(result);
        });
    });

    app.get('/merchantById/:id', function (req, res) {
        // Pass to next layer of middleware
        self.getMerchantById(Number(req.params.id), function (result) {
            res.json(result);
        });
    });

    app.post('/group', function (req, res) {

            //console.log(req.body);

            req.body = JSON.parse(req.body.data);
            var grpHostId = req.body.grpHostId;
            var dishes = req.body.dishes;
            var metId = req.body.metId;
            var addr = req.body.addr;
            var gorTime = req.body.gorTime;
            var minAmount = req.body.minAmount;


            self.postGroup(grpHostId, dishes, metId, addr, gorTime, function (result) {
                res.json(result);
            });

        }
    );

    app.post('/joinGroup', function (req, res) {
            req.body = JSON.parse(req.body.data);
            var usrId = Number(req.body.usrId);
            var dishes = req.body.dishes;
            var grpId = req.body.grpId;


            //console.log(JSON.stringify(req.body));

            self.joinGroupPromise(usrId, dishes, grpId).then(result=> {
                res.json(result);
            }).catch(e=>{
                res.json(e);
            });

        }
    );

    app.get('/groupedOrdersByUserId/:id', function (req, res) {
            var usrId = Number(req.params.id);
            self.getGroupedOrdersByUserId(usrId, result=> {
                //console.log(result);
                res.json(result);
            });
        }
    );

    app.get('/groupedOrdersAndSumsByHostId/:id', function (req, res) {
            var usrId = Number(req.params.id);

            self.getGroupedOrdersAndSumsByHostIdPromise(usrId).then(result=>res.json(result));
        }
    );

    app.listen(8080, function () {
        console.log('' +
            'app listening on port 8080!');
    });


    this.addUser = function (usrName, usrPwd, usrMobi, callback) {
        var usrId = 0;

        for (let user of db.USER) {
            if (user.usrId > usrId) {
                usrId = user.usrId;
            }
            usrId = Number(usrId) + 1;
        }


        var usrCreateTime = new Date();
        var newUser = {usrId: usrId, usrName: usrName, usrPwd: usrPwd, usrCreateTime: usrCreateTime, usrMobi: usrMobi};


        if (newUser.usrName.length !== 0 || newUser.usrPwd.length != 0 || newUser.usrMobi.length != 0) {
            db.USER.push(newUser);
            callback({success: 1});
            return;
        } else {
            callback({success: 0});
        }
    };


    this.userAuth = function (usrName, usrPwd, callback) {
        var isSuccess = false;
        for (var index in db.USER) {
            if (db.USER[index].usrName == usrName && db.USER[index].usrPwd == usrPwd) {
                callback({
                    success: 1,
                    user: {
                        usrName: db.USER[index].usrName,
                        usrId: db.USER[index].usrId,
                        usrMobi: db.USER[index].usrMobi,

                    }
                });
                return;
            }
        }

        if (!isSuccess) {
            callback({success: 0});
        }
    };


    this.allGroup = function (callback) {
        let result = [];
        for (let _group of db.GROUP) {
            let group = standardClassFactory.createClassGroupByGroupId(_group.grpId);
            result.push(group);

        }
        callback(result);
    };

    this.getGroupById = function (id, callback) {
        let group = standardClassFactory.createClassGroupByGroupId(id);
        callback(group);
    };


    this.allMerchant = function (callback) {
        var result = [];
        for (let merchant of db.MERCHANT) {
            merchant.menu = _.filter(db.DISH, (dish)=>dish.metId === merchant.metId);
            result.push(
                merchant
            );
        }
        callback(result);
    };


    this.getMerchantById = function (id, callback) {
        let result = db.MERCHANT.find(merchant=>merchant.metId === id);
        result.menu = _.filter(db.DISH, (dish)=>dish.metId === id);
        callback(result);
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime, callback) {
        let grpId = _.maxBy(db.GROUP, 'grpId').grpId + 1;
        db.GROUP.push({
            grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime
            //minAmount: minAmount
        });
        for (let dihId of dishes) {
            let gdh = {
                gdeId: _.maxBy(db.GROUP_DISHES, 'gdeId').gdeId + 1,
                dihId: Number(dihId),
                grpId
            };
            db.GROUP_DISHES.push(gdh);
        }
        callback({success: 1});
    };

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise((resolve, reject)=> {
            //拒绝用户对同一个group连续点两次餐点
            if (db.ORDER.find(ord=>ord.usrId === usrId && ord.grpId === grpId)) {
                reject("重复加团!");
                return;
            }

            for (let {dihId,num} of dishes) {
                db.ORDER.push({
                    ordId: _.maxBy(db.ORDER, 'ordId').ordId + 1,
                    grpId: grpId,
                    usrId: usrId,
                    dihId: dihId,
                    ordNum: num
                });

            }

            db.GROUP_MEMBER.push({
                gmrId: _.maxBy(db.GROUP_MEMBER, gmr=>gmr.gmrId).gmrId + 1,
                usrId: usrId,
                grpId: grpId
            });

            resolve({success: 1});
        });
    };


    this.convertOrdersToGroupedOrders = function (orders) {
         let groupedOrders = [];
        for (let order of orders) {
            let tOrder = groupedOrders.find(gor=>gor.group.grpId === order.grpId);
            if (tOrder) {
                tOrder.orders.push(order);
            } else {

                let group = standardClassFactory.createClassGroupByGroupId(order.grpId);
                groupedOrders.push({group: group, orders: [order]});
            }
        }
        return groupedOrders;
    };



    this.getGroupedOrdersByUserId = function (usrId, callback) {
        let orders = db.ORDER.filter(ord=>ord.usrId === usrId).map(ord=> {
            let newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                dish: db.DISH.find(d=>d.dihId === ord.dihId),
                ordNum: ord.ordNum,
            };
            return newOrd;
        });

        let groupedOrders =
            self.convertOrdersToGroupedOrders(orders);

        callback(groupedOrders);
    };

    this.getGroupedOrdersAndSumsByHostIdPromise = function (hostId) {
         return new Promise(resolve=> {
            let groupedOrders = [];
            let groupedOrderSums = [];


            let groupIds = db.GROUP.filter(grp=>grp.grpHostId === hostId);
             let orders = db.ORDER.filter(ord=>{
                 //ord.grpId === groupId

                 return db.GROUP.find(grp=>grp.grpId === ord.grpId).grpHostId === hostId;
             }).map(ord=> {

                    let newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum,
                };
                return newOrd;
            });

             //console.log('group',db.GROUP,'groupedOrders', orders);

            groupedOrders =
                self.convertOrdersToGroupedOrders(orders);

            self.formatOrders(groupedOrders, (result)=> {
                groupedOrderSums = result;
            });

             //处理空白团
             let emptyGroups = db.GROUP.filter(grp=> grp.grpHostId === hostId && !db.ORDER.find(ord=>ord.grpId === grp.grpId));
             if(emptyGroups) {
                 emptyGroups.map(eptGroup=>{
                     let group = standardClassFactory.createClassGroupByGroupId(eptGroup.grpId);
                     groupedOrders.push({group, orders:[]});
                     groupedOrderSums.push({group,orderSums:[]});
                 });
             }

            resolve({groupedOrders, groupedOrderSums});
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        let groupedOrderSums = [];
        //console.log('groups',db.GROUP);

        for (let {group,orders} of groupedOrders) {
            let orderSums = [];

            for (let {ordId,group,usrId,dish,ordNum} of orders) {
                //如果存在直接加
                let order = orderSums.find(orm=>orm.dish.dihId === dish.dihId);
                if (order) {
                    order.ordNum += ordNum;
                } else {
                    orderSums.push({group, dish, ordNum});
                }
            }
            groupedOrderSums.push({group, orderSums});
        }

        callback(groupedOrderSums);
    };


};
module.exports = new Server();
//console.log( new Date());