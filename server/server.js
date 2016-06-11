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
//console.log(__dirname);

//let twilio = require('twilio');
//const twilio = require("./twilio/lib");
//let client = new twilio.RestClient(accountSid, authToken);

let client = require('twilio')("AC7161db8bee36103cc7d6c29fe33404ec", "1c76b95b0c1f28236cb262e6b32ba8ab");

let authCodes = []; //{phone  : String , authCode: String , endTime : Number , triedTimes:Numbers}


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

//CLEAN GROUP 删掉超时的
(()=> {
    setInterval(()=> {
        //得到所有没过期的团
        let availableGroups = _.filter(db.GROUP, grp=>grp.grpStatus === 0 || grp.grpStatus === 1);

        for (let g of availableGroups) {
            let deadLine = new Date(g.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016'));
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
            }else if(db.USER.find(o=>o.usrId===usrName)){
                res.json({success: false, msg: '賬號名稱重複'});
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
            let metMinPrice = req.body.metMinPrice;
            let metPicUrl = req.body.metPicUrl || '';

            if (!(metName && metPhone && metMinPrice && metPhone.length === 10)) {
                res.json({success: false, msg: '資料輸入错误'});
                return;
            }

            self.addMerchantPromise({metName, metPhone, metMinPrice, metPicUrl}).then((merchant)=> {
                res.json({success: true, merchant});
            }).catch(()=>res.json({success: false}));

        }
    );

    app.post('/dishes', function (req, res) {

            req.body = JSON.parse(req.body.data);

            console.log(JSON.stringify(req.body));

            for (let dish of req.body) {
                if (!(dish.dihName && dish.dihPrice && dish.metId)) {
                    res.json({success: false, msg: '資料不完整'});
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
            let grpHostId = req.body.grpHostId;
            let dishes = req.body.dishes;
            let metId = req.body.metId;
            let addr = req.body.addr;
            let gorTime = req.body.gorTime;

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

            if (!(usrId && dishes && dishes.length !== 0 && grpId)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }


            self.joinGroupPromise(usrId, dishes, grpId).then(result=> {
                res.json(result);
            }).catch(e=> {
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
                body: '您的飯糰驗證碼是' + randomAuth,
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
     * 参数
     {metName,
     metPhone,
     metMinPrice,
     metPicUrl}
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
                        usrMobi: db.USER[index].usrMobi,

                    }
                });
                return;
            }
        }

        if (!isSuccess) {
            callback({success: false,err:'賬號密碼不匹配'});
        }
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
        callback(result);
    };

    this.getGroupById = function (id, callback) {
        let group = this.createClassGroupByGroupId(id);
        callback(group);
    };


    this.allMerchant = function (callback) {
        var result = [];
        for (let _merchant of db.MERCHANT) {
            let merchant = _.cloneDeep(_merchant);
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
        let lastGroup = _.maxBy(db.GROUP, 'grpId');
        let grpId = lastGroup ? lastGroup.grpId + 1 : 1;
        db.pushToJsonDb('GROUP', {
            grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime,
            grpStatus: 0

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

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise((resolve, reject)=> {
            //拒绝用户对同一个group连续点两次餐点
            if (db.ORDER.find(ord=>ord.usrId === usrId && ord.grpId === grpId)) {
                reject("重复加团!");
                return;
            }

            for (let {dihId,num} of dishes) {
                if (num === 0 || !_.isNumber(num)) {
                    continue;
                }
                let lastOrder = _.maxBy(db.ORDER, 'ordId');
                db.pushToJsonDb("ORDER", {
                    ordId: lastOrder ? lastOrder.ordId + 1 : 1,
                    grpId: grpId,
                    usrId: usrId,
                    dihId: dihId,
                    ordNum: num
                });

            }

            let lastGroupMember = _.maxBy(db.GROUP_MEMBER, gmr=>gmr.gmrId);
            db.pushToJsonDb("GROUP_MEMBER", {
                gmrId: lastGroupMember ? lastGroupMember.gmrId + 1 : 1,
                usrId: usrId,
                grpId: grpId
            });

            //最小外送金額
            let g = db.GROUP.find(g=>g.grpId === grpId);
            let metId = g.metId;
            let hostId = g.grpHostId;
            let metMinPrice = db.MERCHANT.find(m=>m.metId === metId).metMinPrice;
            let amount = 0;

            this.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(result=> {
                //console.log(result.groupedOrderSums);
                let groupOrderSum = result.groupedOrderSums.find(orderSum=>orderSum.group.grpId === grpId);
                console.log("groupOrderSum", groupOrderSum);

                for (let orderSum of groupOrderSum.orderSums) {
                    let price = orderSum.dish.dihPrice;
                    let num = orderSum.ordNum;
                    let total = price * num;
                    amount += total;
                }

                if (amount >= metMinPrice) {
                    g.grpStatus = 1;
                    db.setValueToJsonDb("GROUP", row=>row.grpId === grpId, "grpStatus", 1);
                }
                resolve({success: 1});
            }).catch(e=>console.log(e));


        });
    };


    this.convertOrdersToGroupedOrders = function (orders) {
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
         return _.sortBy(groupedOrders,row=>-new Date(row.group.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016')).getTime());
    };


    this.getGroupedOrdersByUserId = function (usrId, callback) {
        let orders = db.ORDER.filter(ord=>ord.usrId === usrId).map(ord=> {
            let newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                dish: db.DISH.find(d=>d.dihId === ord.dihId),
                ordNum: ord.ordNum
            };
            return newOrd;
        });

        let groupedOrders =
            self.convertOrdersToGroupedOrders(orders);

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
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum
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
            if (emptyGroups) {
                emptyGroups.map(eptGroup=> {
                    let group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({group, orders: []});
                    groupedOrderSums.push({group, orderSums: []});
                });
            }

            resolve({groupedOrders, groupedOrderSums:_.sortBy(groupedOrderSums,obj=>-new Date(obj.group.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016')).getTime())});
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

    this.createClassGroupByGroupId = function (grpId) {
        let that = this;
        let group = db.GROUP.find(g=>g.grpId === grpId);

        if (!group) {
            return null;
        }

        let menu = [];
        let grpDishes = _.filter(db.GROUP_DISHES, grh => grh.grpId === group.grpId).map(grh=> {
                let grpDish = {};
                grpDish.dish = _.find(db.DISH, dish=> dish.dihId === grh.dihId);
                _.assign(grpDish, grh);
                return grpDish;
            }) || [];
        grpDishes.map(grpDish=> {

            //检查是否已经存在DISH的分类.
            let dihGroup = menu.find(dgp => dgp.dihType === grpDish.dish.dihType);
            if (dihGroup) {
                //已经有了就加入一笔
                dihGroup.dishes.push(grpDish.dish);
            } else {
                //如果没有加入新的分类,和一笔DISH
                menu.push({dihType: grpDish.dish.dihType, dishes: [grpDish.dish]});
            }
        });

        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: group.grpTime,
            grpHostName: (db.USER.find(user => user.usrId === group.grpHostId)).usrName,
            merchant: db.MERCHANT.find(merchant => merchant.metId === group.metId),
            grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId === group.grpId) || [],
            grpDishes: grpDishes,
            grpHost: that.createUserByUserId(group.grpHostId),

            grpStatus: group.grpStatus,
            menu: menu
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
    }

    this.getStatus = function (grpId) {
        return new Promise(resolve=> {
            let status = db.GROUP.find(g=>grpId === g.grpId).grpStatus;
            resolve(status);
        });
    };


    ///////////////////后台

    //给资料表新增一个row
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


};


module.exports = new Server();

