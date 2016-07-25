'use strict';

/**
 * Created by User on 2016/3/24.
 */

require('source-map-support').install();

const isDebug = true;
const fakeAuthCode = true;

const _ = require('lodash');
//let db = require('./mock-db');
const path = require('path');

let JsonDB = require('node-json-db');

//debugger;
let jsonDb = new JsonDB("./onigiri", true, true);
let db = jsonDb.getData('/db');
require('./time.js');

//console.log(__dirname);

//let twilio = require('twilio');
//const twilio = require("./twilio/lib");
//let client = new twilio.RestClient(accountSid, authToken);

let client = require('twilio')("AC7161db8bee36103cc7d6c29fe33404ec", "1c76b95b0c1f28236cb262e6b32ba8ab");

let authCodes = []; //{phone  : String , authCode: String , endTime : Number , triedTimes:Numbers}

//let commemtArrary = [];
//let commentId;

db.pushToJsonDb = function (table, value) {
    jsonDb.push('/db/' + table + '[]', value);
    //    db[table].push(value);
};

db.setValueToJsonDb = function (table, condition, setKey, newValue) {
    let index = db[table].findIndex(condition);
    let oldObj = db[table].find(condition);
    oldObj[setKey] = newValue;

    jsonDb.push('/db/' + table + `[${index}]`, oldObj);
    //    db[table].push(value);
};

//CLEAN GROUP 刪掉超時的
(()=> {
    setInterval(()=> {
        //得到所有沒過期的團
        let availableGroups = _.filter(db.GROUP, grp=>grp.grpStatus === 0 || grp.grpStatus === 1);

        for (let g of availableGroups) {
            let deadLine = new Date(g.grpTime);
            if (deadLine.getTime() - new Date().getTime() < 0) {
                db.setValueToJsonDb('GROUP', row=>row.grpId === g.grpId, 'grpStatus', -1);
            }
        }
    }, 5000);

})();

var Server = function () {

    this.testMode = function () {
        if (isDebug) {
            db.pushToJsonDb = function (table, value) {
                db[table].push(value);
            };
        }
    };

    var express = require('express');
    var bodyParser = require('body-parser');
//var db = require('/batabase.js');

    var app = express();


    var self = this;

    this.db = isDebug ? db : undefined;


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

            req.body = JSON.parse(req.body.data);

            let usrName = req.body.usrName;
            let usrPwd = req.body.usrPwd;
            let usrMobi = req.body.usrMobi;
            let authCode = req.body.authCode;


            if (!usrName || !usrPwd || !usrMobi || !authCode) {
                res.json({success: false, msg: '資料填寫不完整!'});
                return;
            }

            let result = authCodes.find(obj=>obj.phone === usrMobi);
            if (!result) {
                res.json({success: false, msg: '請驗證手機號碼'});
                return;
            } else if (result.authCode !== authCode) {
                result.triedTimes++;
                if (result.triedTimes === 3) {
                    authCodes.splice(authCodes.findIndex(obj=>obj.phone === usrMobi), 1);
                }
                res.json({success: false, msg: '驗證碼輸入錯誤'});
                return;
            } else if (db.USER.find(o=>o.usrName === usrName)) {
                res.json({success: false, msg: '帳號名稱重複'});
                return;
            }


            //console.log(JSON.stringify(req.body));
            self.addUser(usrName, usrPwd, usrMobi, function (result) {
                res.json(result);
            });
        }
    );

    app.post('/merchant', function (req, res) {

            req.body = JSON.parse(req.body.data);

            let metName = req.body.metName;
            let metPhone = req.body.metPhone;
            let metMinPrice = Number(req.body.metMinPrice);
            let metPicUrl = req.body.metPicUrl || '';
            let metType = req.body.metType || '其他';


            if (!(metName && metPhone && metMinPrice && metMinPrice >= 0)) {
                res.json({success: false, msg: '資料輸入錯誤'});
                return;
            }

            self.addMerchantPromise({metName, metPhone, metMinPrice, metPicUrl, metType}).then((merchant)=> {
                res.json({success: true, merchant});
            }).catch(()=>res.json({success: false}));

        }
    );

    app.post('/dishes', function (req, res) {

            req.body = JSON.parse(req.body.data);

            console.log(JSON.stringify(req.body));

            for (let dish of req.body) {
                dish.dihPrice = Number(dish.dihPrice);

                if (!(dish.dihName && dish.dihPrice && dish.metId)) {
                    res.json({success: false, msg: '資料不完整'});
                    return;
                }

                if (dish.dihPrice < 0) {
                    res.json({success: false, msg: '商品價格不正確'});
                    return;
                }
            }

            req.body = req.body.map(row=> {
                row.dihType = row.dihType || '主食';
                return row;
            });


            self.addDishPromise(req.body).then((result)=> {
                res.json({success: true, dishes: result});
            }).catch(()=>res.json({success: false}));

        }
    );

    app.post('/userAuth', function (req, res) {
            var usrName = req.body.usrName;
            var usrPwd = req.body.usrPwd;

            if (!(usrName && usrPwd)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            //console.log(JSON.stringify(req.body));

            self.userAuth(usrName, usrPwd, function (result) {
                res.json(result);
            });

        }
    );

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allAvailableGroup(function (result) {
            res.json(result);
        });
    });

    app.get('/groupById/:id', (req, res)=> {
        self.getGroupById(Number(req.params.id), result=>res.json(result));
    });

    app.get('/unjoinedGroups/:usrId', (req, res)=> {
        self.getUnjoinedGroups(Number(req.params.usrId), result=>res.json(result));
    });

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
            let grpHostId = Number(req.body.grpHostId);
            let dishes = req.body.dishes;
            let metId = Number(req.body.metId);
            let addr = req.body.addr;
            let gorTime = req.body.gorTime;

            //TODO Check Time
            let deadLine = new Date(gorTime.replace(/(\d*)年(\d*)月(\d*)日\,/gi, '$1/$2/$3'));
            gorTime = deadLine.getTime();

            if (gorTime < new Date().getTime()) {
                res.json({success: false, msg: '截止時間不能早於當前時間'});
                return;
            }


            if (!( grpHostId && dishes && metId && addr && gorTime)) {
                res.json({success: false, msg: '資料不完整'});
                return;

            }


            self.postGroup(grpHostId, dishes, metId, addr, gorTime, function (result) {
                res.json(result);
            });

        }
    );

    app.post('/joinGroup', function (req, res) {
            req.body = JSON.parse(req.body.data);
            let usrId = Number(req.body.usrId);
            let dishes = req.body.dishes;
            let grpId = req.body.grpId;
            let comments = req.body.comments;

            if (!(usrId && dishes && dishes.length !== 0 && grpId)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }


            self.joinGroupPromise(usrId, dishes, grpId, comments).then(result=> {
                res.json(result);
            }).catch(e=> {
                console.log(e);
                res.json(e);
            });

        }
    );

    app.post('/groupStatus', function (req, res) {
            req.body = JSON.parse(req.body.data);
            let grpId = Number(req.body.grpId);
            let grpStatus = Number(req.body.grpStatus);
            if (!(grpId && grpStatus)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            self.updateGroupStatusPromise(grpId, grpStatus).then(result=> {
                res.json(result);
            }).catch(e=> {
                res.json(e);
            });

        }
    );

    app.post('/mobiAuth', function (req, res) {
            let usrMobi = req.body.data;
            if (!usrMobi) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            self.getTwilioCode(usrMobi).then(result=> {
                res.json({success: true});
            }).catch(e=> {
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

    app.post('/updateOrdStatus', function (req, res) {
        req.body = JSON.parse(req.body.data);
        let ordId = Number(req.body.ordId);
        let ordStatus = Number(req.body.ordStatus);
        // console.log("ordId:" + ordId + ",ordStatus:" + ordStatus);

        self.updateOrdStatusPromise(ordId, ordStatus).then(result=> {
            res.json(result);
        }).catch(e=> {
            res.json(e);
        });
    });

    app.get('/confirmOrder/:id', function (req, res) {
        let usrId = Number(req.params.id);

        self.confirmOrder(usrId).then(result=>res.json(result));
    });

    app.get('/grpUsersOrdersByHostId/:hostId', function (req, res) {
        let hostId = Number(req.params.hostId);
        let from = Number(req.query.from);
        self.getGrpUsersOrdersByHostIdPromise(hostId, from).then(result=>res.json(result));
    });

    app.post('/getGrpMember', function (req, res) {
        req.body = JSON.parse(req.body.data);
        let gmrId = Number(req.body.gmrId);
        let comStatus = Number(req.body.comStatus);

        self.getComment(gmrId, comStatus).then(result=> {
            res.json(result);
        }).catch(e=> {
            res.json(e);
        });

    });


    app.listen(8080, function () {
        console.log('' +
            'app listening on port 8080!');
    });

    this.addDishPromise = function (dishes) {

        return new Promise((resolve, reject)=> {
            for (let dish of dishes) {
                dish.dihId = _.maxBy(db.DISH, "dihId").dihId + 1;
                db.pushToJsonDb('DISH', dish);
            }
            resolve(dishes);
        });
    };

    this.getTwilioCode = function (userMobi) {
        return new Promise(function (resolve, reject) {
            var min = 100;
            var max = 999;
            var randomAuth = Math.floor(Math.random() * (max - min + 1) + min) + '';
            if (fakeAuthCode) {
                randomAuth = '123';
                resolve('123');
                authCodes.push({
                    phone: userMobi,
                    authCode: randomAuth,
                    endTime: new Date().getTime() + 1000 * 60 * 5,
                    triedTimes: 0
                });

                setTimeout(()=> {
                    let indexOfAuthCode = authCodes.findIndex(obj=>obj.authCode === authCodes);
                    if (indexOfAuthCode) {
                        authCodes.splice(indexOfAuthCode, 1);
                    }
                }, 1000 * 60 * 5);
                return;
            }

            client.messages.create({
                body: '您的販團驗證碼是' + randomAuth,
                to: '+886' + userMobi,  // Text this number
                from: '+13342030485' // From a valid Twilio number
            }, function (err, message) {
                if (err) {
                    console.log(err);
                    reject(randomAuth);
                } else {
                    console.log(message && message.sid);
                    resolve(randomAuth);
                    authCodes.push({
                        phone: userMobi,
                        authCode: randomAuth,
                        endTime: new Date().getTime() + 1000 * 60 * 5,
                        triedTimes: 0
                    });

                    setTimeout(()=> {
                        let indexOfAuthCode = authCodes.findIndex(obj=>obj.authCode === authCodes);
                        if (indexOfAuthCode) {
                            authCodes.splice(indexOfAuthCode, 1);
                        }
                    }, 1000 * 60 * 5);
                }
            });


        });
    };

    this.addUser = function (usrName, usrPwd, usrMobi, callback) {
        var usrId = 0;

        for (let user of db.USER) {
            if (user.usrId > usrId) {
                usrId = user.usrId;
            }
            usrId = Number(usrId) + 1;
        }


        var usrCreateTime = new Date().toString();
        var newUser = {
            usrId: usrId,
            usrName: usrName,
            usrPwd: usrPwd,
            usrCreateTime: usrCreateTime,
            usrMobi: usrMobi
        };


        if (newUser.usrName.length !== 0 && newUser.usrPwd.length !== 0 && newUser.usrMobi.length === 10) {
            db.pushToJsonDb('USER', newUser);
            callback({success: true});
        } else {
            callback({success: false});
        }
    };

    /*
     * 參數
     {metName,
     metPhone,
     metMinPrice,
     metPicUrl,
     metType}
     */

    this.addMerchantPromise = function (merchant) {
        return new Promise((resolve, reject)=> {
            merchant.metId = _.maxBy(db.MERCHANT, 'metId').metId + 1;

            db.pushToJsonDb('MERCHANT', merchant);

            resolve(merchant);

        });
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
                        usrMobi: db.USER[index].usrMobi
                    }
                });
                return;
            }
        }

        if (!isSuccess) {
            callback({success: false, err: '帳號密碼不匹配'});
        }
    };

    //unjoined groups by user id
    this.getUnjoinedGroups = function (usrId, callback) {
        let joinedGroupIds = _.uniqBy(db.ORDER.find(ord=>ord.usrId === usrId), 'grpId').map(ord=>ord.grpId);
        callback(db.GROUP.filter(grp=> !joinedGroupIds.find(grpId=>grpId === grp.grpId)));
    };

    this.allGroup = function (callback) {
        let result = [];

        for (let _group of db.GROUP) {
            let group = this.createClassGroupByGroupId(_group.grpId);
            result.push(group);

        }
        callback(result);
    };

    this.allAvailableGroup = function (callback) {
        let result = [];

        for (let _group of db.GROUP.filter(g=>g.grpStatus === 0 || g.grpStatus === 1)) {
            let group = this.createClassGroupByGroupId(_group.grpId);
            result.push(group);
        }

        callback(_.sortBy(result, row=>-new Date(row.grpTime)));
    };

    this.getGroupById = function (id, callback) {
        let group = this.createClassGroupByGroupId(id);
        callback(group);
    };


    this.allMerchant = function (callback) {
        var result = [];
        for (let _merchant of db.MERCHANT) {
            let merchant = this.createClassMerchantById(_merchant.metId);
            result.push(
                merchant
            );
        }
        callback(result);
    };


    this.getMerchantById = function (id, callback) {
        let merchant = this.createClassMerchantById(id);
        callback(merchant);
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime, callback) {
        let lastGroup = _.maxBy(db.GROUP, 'grpId');
        let grpId = lastGroup ? lastGroup.grpId + 1 : 1;
        db.pushToJsonDb('GROUP', {
            grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime,
            grpStatus: 0,
            grpCreateTime: new Date().getTime(),
            grpAmount: 0

            //minAmount: minAmount
        });
        for (let dihId of dishes) {
            let lastDish = _.maxBy(db.GROUP_DISHES, 'gdeId');
            let gdh = {
                gdeId: lastDish ? lastDish.gdeId + 1 : 1,
                dihId: Number(dihId),
                grpId
            };
            db.pushToJsonDb("GROUP_DISHES", gdh);
        }
        callback({success: 1});
    };

    this.joinGroupPromise = function (usrId, dishes, grpId, comments) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise((resolve, reject)=> {
            //拒絕用戶對同壹個group連續點兩次餐點
            //if (db.ORDER.find(ord=>ord.usrId === usrId && ord.grpId === grpId)) {
            //    reject("重復加團!");
            //    return;
            //}

            //只有0,1状态的团可以团购
            if (!_.includes([0, 1], db.GROUP.find(grp=>grp.grpId === grpId).grpStatus)) {
                reject("團購已經截止!");
                return;
            }
            let usrName = db.USER.find(usr=>usr.usrId === usrId).usrName;

            console.log('usrId, dishes, grpId', usrId, dishes, grpId);

            let orderedDishIds = _.chain(db.ORDER).filter(ord=>ord.usrId === usrId && ord.grpId === grpId).map(ord=>ord.dihId).value();
            console.log('orderedDishIds', orderedDishIds);

            let selectRowByDishId = dihId => row=>row.dihId === dihId;
            for (let {dihId, num} of dishes) {
                if (num === 0 || !_.isNumber(num)) {
                    continue;
                }

                if (_.includes(orderedDishIds, dihId)) {
                    db.setValueToJsonDb('ORDER', selectRowByDishId(dihId), 'ordNum', num + db.ORDER[_.findIndex(db.ORDER, {
                            usrId,
                            dihId
                        })].ordNum);
                    continue;
                }


                let lastOrder = _.maxBy(db.ORDER, 'ordId');

                db.pushToJsonDb("ORDER", {
                    ordId: lastOrder ? lastOrder.ordId + 1 : 1,
                    grpId: grpId,
                    usrId: usrId,
                    usrName: usrName,  //07.03 add
                    dihId: dihId,
                    ordNum: num,
                    ordCreateTime: new Date().getTime(),
                    //TODO ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    ordStatus: 0
                });


            }

            let lastGroupMember = _.maxBy(db.GROUP_MEMBER, gmr=>gmr.gmrId);
            if (!comments) {
                console.log("commentscomments=" + comments);
                comments = "";
            }
            db.pushToJsonDb("GROUP_MEMBER", {
                gmrId: lastGroupMember ? lastGroupMember.gmrId + 1 : 1,
                usrId: usrId,
                usrName: usrName,  //07.03 add
                grpId: grpId,
                // comStatus: 0,
                comments: comments
            });

            //最小外送金額
            let g = db.GROUP.find(g=>g.grpId === grpId);
            let metId = g.metId;
            let hostId = g.grpHostId;
            let metMinPrice = db.MERCHANT.find(m=>m.metId === metId).metMinPrice;
            let amount = 0;

            self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(result=> {
                // console.log("result.groupedOrderSums"+JSON.stringify(result.groupedOrderSums));
                let groupOrderSum = result.groupedOrderSums.find(orderSum=>orderSum.group.grpId === grpId);
                console.log("groupOrderSum", groupOrderSum);

                //TODO
                if (groupOrderSum) {
                    for (let orderSum of groupOrderSum.orderSums) {
                        let price = orderSum.dish.dihPrice;
                        let num = orderSum.ordNum;
                        let total = price * num;
                        amount += total;
                    }
                    db.setValueToJsonDb("GROUP", row=>row.grpId === grpId, "grpAmount", amount);

                    if (amount >= metMinPrice) {
                        db.setValueToJsonDb("GROUP", row=>row.grpId === grpId, "grpStatus", 1);
                    }
                }
                resolve({success: 1});
            }).catch(e=>console.log(e));

        });
    };

    this.convertOrdersToGroupedOrders = function (orders) {
        let groupedOrders = [];

        for (let order of orders) {
            if (order.ordStatus > 0) {
                // console.log("ordStatus:" + order.ordStatus);
                let tOrder = groupedOrders.find(gor=>gor.group.grpId === order.grpId);
                if (tOrder) {
                    tOrder.orders.push(order);
                } else {

                    let group = this.createClassGroupByGroupId(order.grpId);
                    // console.log("====group" + JSON.stringify(group));

                    groupedOrders.push({group: group, orders: [order]});
                }
            }
        }
        return _.sortBy(groupedOrders, row=>-new Date(row.group.grpTime));
    };

    this.convertOrdersToGroupedOrdersUsr = function (orders) {
        let groupedOrders = [];
        for (let order of orders) {
            let tOrder = groupedOrders.find(gor=>gor.group.grpId === order.grpId);
            if (tOrder) {
                tOrder.orders.push(order);
            } else {
                let group = this.createClassGroupByGroupId(order.grpId);
                groupedOrders.push({group: group, orders: [order]});
            }
        }
        return _.sortBy(groupedOrders, row=>-new Date(row.group.grpTime));
    };


    this.getGroupedOrdersByUserId = function (usrId, callback) {
        let orders = _.sortBy(db.ORDER.filter(ord=>ord.usrId === usrId), obj=>-obj.ordCreateTime).map(ord=> {
            let newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                usrName: ord.usrName,   //07.03 add
                dish: db.DISH.find(d=>d.dihId === ord.dihId),
                ordNum: ord.ordNum,
                ordStatus: ord.ordStatus,    //07.03 add
                ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
            };
            return newOrd;
        });

        let groupedOrders =
            self.convertOrdersToGroupedOrdersUsr(orders);
        callback(groupedOrders);
    };

    this.getGroupedOrdersAndSumsByHostIdPromise = function (hostId) {
        let that = this;

        return new Promise(resolve=> {
            let groupedOrders = [];
            let groupedOrderSums = [];


            let groupIds = db.GROUP.filter(grp=>grp.grpHostId === hostId);
            let orders = db.ORDER.filter(ord=> {
                //ord.grpId === groupId

                return db.GROUP.find(grp=>grp.grpId === ord.grpId).grpHostId === hostId;
            }).map(ord=> {

                let newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    usrName: ord.usrName,   //07.03 add
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus,    //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                };
                return newOrd;
            });

            //console.log('group',db.GROUP,'groupedOrders', orders);

            groupedOrders =
                self.convertOrdersToGroupedOrders(orders);

            // console.log("ordersordersordersorders:" + JSON.stringify(orders));
            // console.log("groupedOrdersgroupedOrdersgroupedOrders:" + JSON.stringify(groupedOrders));

            self.formatOrders(groupedOrders, (result)=> {
                groupedOrderSums = result;
            });

            //處理空白團
            let emptyGroups = db.GROUP.filter(grp=> grp.grpHostId === hostId && !db.ORDER.find(ord=>ord.grpId === grp.grpId));
            if (emptyGroups) {
                emptyGroups.map(eptGroup=> {
                    let group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({group, orders: []});
                    groupedOrderSums.push({group, orderSums: []});
                });
            }

            // console.log("groupedOrderSumsgroupedOrderSums:" + JSON.stringify(groupedOrderSums));

            resolve({
                groupedOrders: _.orderBy(groupedOrders, obj=>obj.group.grpCreateTime, 'desc'),
                // groupedOrderSums: _.sortBy(groupedOrderSums, obj=>obj.group.grpCreateTime)
                groupedOrderSums: _.orderBy(groupedOrderSums, obj=>obj.group.grpCreateTime, 'desc')
                // groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.confirmOrder = function (hostId) {
        let that = this;

        return new Promise(resolve=> {
            let groupedOrders = [];
            let groupedOrderSums = [];

            let groupIds = db.GROUP.filter(grp=>grp.grpHostId === hostId);
            let orders = db.ORDER.filter(ord=> {

                return db.GROUP.find(grp=>grp.grpId === ord.grpId).grpHostId === hostId;
            }).map(ord=> {

                let newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    usrName: ord.usrName,   //07.03 add
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus,    //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                };
                return newOrd;
            });

            groupedOrders =
                self.convertOrdersToGroupedOrdersUsr(orders);

            self.formatOrders(groupedOrders, (result)=> {
                groupedOrderSums = result;
            });

            //處理空白團
            let emptyGroups = db.GROUP.filter(grp=> grp.grpHostId === hostId && !db.ORDER.find(ord=>ord.grpId === grp.grpId));
            if (emptyGroups) {
                emptyGroups.map(eptGroup=> {
                    let group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({group, orders: []});
                    groupedOrderSums.push({group, orderSums: []});
                });
            }
            resolve({
                groupedOrders,
                groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        let groupedOrderSums = [];
        //console.log('groups',db.GROUP);
        //console.log('groupedOrdersgroupedOrdersgroupedOrders:', JSON.stringify(groupedOrders));

        for (let {group, orders} of groupedOrders) {
            let orderSums = [];

            for (let {ordId, group, usrId, dish, ordNum, ordStatus} of orders) {
                //如果存在直接加
                let order = orderSums.find(orm=>orm.dish.dihId === dish.dihId);

                if (order) {
                    order.ordNum += ordNum;
                } else {
                    orderSums.push({group, dish, ordNum});
                }
            }

            switch (group.grpStatus) {
                case 0:
                    group.grpStatusCh = "未達外送金額";
                    group.btnChangeStatusName = "未開團";
                    group.grpNextStatus = 1;

                    group.btnChangeStatusDisable = true;
                    break;
                case 1:
                    group.grpStatusCh = "已開團";
                    group.btnChangeStatusName = "確認已送達";
                    group.grpNextStatus = 2;

                    break;
                case 2:
                    group.grpStatusCh = "已送達";
                    group.btnChangeStatusName = "確認訂單已完成";
                    group.grpNextStatus = 3;
                    break;
                case 3:
                    group.grpStatusCh = "已完成";
                    group.btnChangeStatusName = "重新開團";
                    group.grpNextStatus = 4;
                    break;
                case -1:
                    group.grpStatusCh = "開團失敗";
                    group.btnChangeStatusName = "";
                    group.btnChangeStatusDisable = true;
                    group.grpNextStatus = -2;
                    break;
            }

            groupedOrderSums.push({group, orderSums});
        }


        callback(groupedOrderSums);
    };

    this.createClassMerchantById = function (metId) {
        let result = _.cloneDeep(db.MERCHANT.find(merchant=>merchant.metId === metId));
        result.menu = _.filter(db.DISH, (dish)=>dish.metId === metId);
        return result;
    };

    this.createClassGroupByGroupId = function (grpId) {
        let that = this;
        let group = db.GROUP.find(g=>g.grpId === grpId);

        if (!group) {
            return null;
        }

        let menu = [];
        let grpComments = [];
        let grpDishes = _.filter(db.GROUP_DISHES, grh => grh.grpId === group.grpId).map(grh=> {
                let grpDish = {};
                grpDish.dish = _.find(db.DISH, dish=> dish.dihId === grh.dihId);
                _.assign(grpDish, grh);
                return grpDish;
            }) || [];
        grpDishes.map(grpDish=> {

            //檢查是否已經存在DISH的分類.
            let dihGroup = menu.find(dgp => dgp.dihType === grpDish.dish.dihType);
            if (dihGroup) {
                //已經有了就加入壹筆
                dihGroup.dishes.push(grpDish.dish);
            } else {
                //如果沒有加入新的分類,和壹筆DISH
                menu.push({dihType: grpDish.dish.dihType, dishes: [grpDish.dish]});
            }
        });

        let merchant = db.MERCHANT.find(merchant => merchant.metId === group.metId);

        // grpComments.push(db.GROUP_MEMBER.filter(g=>g.grpId === grpId));


        let grpCom = db.GROUP_MEMBER.filter(g=>g.grpId === grpId);

        for (let gc of grpCom) {
            if (gc.comments) {
                grpComments.push({
                    gmrId: gc.gmrId,
                    usrId: gc.usrId,
                    usrName: gc.usrName,
                    comStatus: gc.comStatus,
                    comments: gc.comments
                });
            }
        }


        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: new Date(group.grpTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpHostName: (db.USER.find(user => user.usrId === group.grpHostId)).usrName,
            merchant: merchant,
            grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId === group.grpId) || [],
            grpDishes: grpDishes,
            grpHost: that.createUserByUserId(group.grpHostId),
            grpStatus: group.grpStatus,
            menu: menu,
            grpCreateTime: new Date(group.grpCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpAmount: group.grpAmount || 0,
            grpReachRatePercent: 100 * ((group.grpAmount || 0) / merchant.metMinPrice > 1 ? 1 : (group.grpAmount || 0) / merchant.metMinPrice),
            grpComments: grpComments
        };

        return group;
    };

    this.createUserByUserId = function (usrId) {
        let _usr = db.USER.find(usr=>usr.usrId === usrId);
        let user = {
            usrId: _usr.usrId,
            usrName: _usr.usrName,
            usrMobi: _usr.usrMobi
        };

        return user;
    };

    this.updateGroupStatusPromise = function (grpId, grpStatus) {
        return new Promise((resolve, reject)=> {
            let group = db.GROUP.find(s=>grpId === s.grpId);

            if (group.grpStatus >= 0 && group.grpStatus <= 2) {
                db.setValueToJsonDb('GROUP', row=>row.grpId === group.grpId, 'grpStatus', grpStatus);
                //group.grpStatus = grpStatus;

                resolve({success: 1});
            }
            else {
                reject({success: 0});
            }
        });

    };

    this.cleanGroup = function () {
        let today = new Date();

        this.allGroup(function (result) {
            //let timing = result[0].grpTime.replace(/月/,"/");
            console.log(result[0].grpTime);
            console.log(JSON.stringify(result));
        });


        //let t = setTimeout('Timer()', 500);
    };

    this.getStatus = function (grpId) {
        return new Promise(resolve=> {
            let status = db.GROUP.find(g=>grpId === g.grpId).grpStatus;
            resolve(status);
        });
    };

    this.getComment = function (gmrId, comStatus) {
        return new Promise(resolve=> {
            //TODO
            let comments = db.GROUP_MEMBER.find(g=>g.grpId === grpId && g.usrId === usrId).comments;
            resolve(comments);
        });
    };

    this.updateOrdStatusPromise = function (ordId, ordStatus) {
        //一次只能修改一個ordId的ordStatus
        return new Promise((resolve, reject)=> {
            let order = db.ORDER.find(s=>ordId === s.ordId);

            if (order.ordStatus != -1) {
                db.setValueToJsonDb('ORDER', row=>row.ordId === order.ordId, 'ordStatus', ordStatus);
                //group.grpStatus = grpStatus;
                resolve({success: 1});

            }
            else {
                reject({success: 0});
            }
        });
    };

    this.getGrpUsersOrdersByHostIdPromise = function (hostId, from) {
        //from :  0=> confirmOrder  , 1=>productDetail
        return new Promise(resolve=> {
            switch (from) {
                case 0:
                {
                    self.confirmOrder(hostId).then(result=> {
                        console.log('switch 0');
                        let GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders(result).GrpUsersOrders.filter(function (guo) {
                            guo.usrOrders = guo.usrOrders.filter(uo=>uo.ordStatus === 0);
                            // console.log('====guo.usrOrders:' + JSON.stringify(guo.usrOrders));
                            return guo.usrOrders.length!==0;
                        });
                        // GrpUsersOrders.GrpUsersOrders.filter(function (guo) {
                        //     guo.usrOrders = guo.usrOrders.filter(uo=>uo.ordStatus===0);
                        //         console.log('====guo.usrOrders:' + JSON.stringify(guo.usrOrders));
                        //     return guo;
                        // });
                        console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
                        resolve({GrpUsersOrders:GrpUsersOrders});
                    });
                    break;
                }
                case 1:
                {
                    self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(result=> {
                        console.log('switch 1');
                        let GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders(result);
                        resolve(GrpUsersOrders);
                    });
                    break;
                }
            }
        });
    };

    this.convertGroupedOrdersToGrpUsrOrders = function (result) {
        let GrpUsersOrders = {
            GrpUsersOrders: []
        };

        for (let grpOrd of result.groupedOrders) {
            let neGUO = {};
            let uos = [];
            let grpComments = grpOrd.group.grpComments;

            for (let order of grpOrd.orders) {
                order.dish.ordNum = order.ordNum;
                let uosobj = uos.find(u=>u.usrId === order.usrId);
                if (!uosobj) {
                    uos.push({
                        usrId: order.usrId,
                        usrName: order.usrName,
                        usrAmount: order.dish.ordNum * order.dish.dihPrice,
                        ordStatus: order.ordStatus,
                        usrDishes: [order.dish],
                        usrComments: _.filter(grpComments, (com) => com.usrId === order.usrId),
                        usrOrdIds: [{ordId: order.ordId}]
                    });
                } else {
                    uosobj.usrAmount = uosobj.usrAmount + order.dish.ordNum * order.dish.dihPrice;
                    uosobj.usrDishes.push(order.dish);
                    uosobj.usrOrdIds.push({ordId: order.ordId});
                }
            }
            neGUO = {
                group: grpOrd.group,
                usrOrders: uos
            };
            GrpUsersOrders.GrpUsersOrders.push(neGUO);
        }

        // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
        return GrpUsersOrders;
    };

    ///////////////////後臺

    //給資料表新增壹個row
    app.post('/:adminPwd/table/:tableName', function (req, res) {
        if (req.params.adminPwd !== 'fHfKJp3iSAfhvd9fjn23Z5KMA6Sd') {
            res.json({success: false});
        }

        try {
            req.body = JSON.parse(req.body.data);
            let rows = req.body.rows;
            for (let row of rows) {
                db.pushToJsonDb(req.params.tableName, row);
            }
            res.json({success: true});
        } catch (e) {

            res.json({success: false});
        }


    });


}


module.exports = new Server();
