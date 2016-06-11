'use strict';

/**
 * Created by User on 2016/3/24.
 */

require('source-map-support').install();

var isDebug = true;
var fakeAuthCode = true;

var _ = require('lodash');
//let db = require('./mock-db');
var path = require('path');

var JsonDB = require('node-json-db');

//debugger;
var jsonDb = new JsonDB("./onigiri", true, true);
var db = jsonDb.getData('/db');
//console.log(__dirname);

//let twilio = require('twilio');
//const twilio = require("./twilio/lib");
//let client = new twilio.RestClient(accountSid, authToken);

var client = require('twilio')("AC7161db8bee36103cc7d6c29fe33404ec", "1c76b95b0c1f28236cb262e6b32ba8ab");

var authCodes = []; //{phone  : String , authCode: String , endTime : Number , triedTimes:Numbers}

db.pushToJsonDb = function (table, value) {
    jsonDb.push('/db/' + table + '[]', value);
    //    db[table].push(value);
};

db.setValueToJsonDb = function (table, condition, setKey, newValue) {
    var index = db[table].findIndex(condition);
    var oldObj = db[table].find(condition);
    oldObj[setKey] = newValue;

    jsonDb.push('/db/' + table + ('[' + index + ']'), oldObj);
    //    db[table].push(value);
};

//CLEAN GROUP 删掉超时的
(function () {
    setInterval(function () {
        //得到所有没过期的团
        var availableGroups = _.filter(db.GROUP, function (grp) {
            return grp.grpStatus === 0 || grp.grpStatus === 1;
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function _loop() {
                var g = _step.value;

                var deadLine = new Date(g.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016'));
                if (deadLine.getTime() - new Date().getTime() < 0) {
                    db.setValueToJsonDb('GROUP', function (row) {
                        return row.grpId === g.grpId;
                    }, 'grpStatus', -1);
                }
            };

            for (var _iterator = availableGroups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }, 5000);
})();

var Server = function Server() {

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

    var allowCrossDomain = function allowCrossDomain(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };

    app.use(allowCrossDomain); //CORS middleware
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('/db', function (req, res) {
        if (isDebug) {
            res.json(db);
        }
    });

    app.post('/addUser', function (req, res) {

        req.body = JSON.parse(req.body.data);

        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;
        var usrMobi = req.body.usrMobi;
        var authCode = req.body.authCode;

        if (!usrName || !usrPwd || !usrMobi || !authCode) {
            res.json({ success: false, msg: '資料填寫不完整!' });
            return;
        }

        var result = authCodes.find(function (obj) {
            return obj.phone === usrMobi;
        });
        if (!result) {
            res.json({ success: false, msg: '請驗證手機號碼' });
            return;
        } else if (result.authCode !== authCode) {
            result.triedTimes++;
            if (result.triedTimes === 3) {
                authCodes.splice(authCodes.findIndex(function (obj) {
                    return obj.phone === usrMobi;
                }), 1);
            }
            res.json({ success: false, msg: '驗證碼輸入錯誤' });
            return;
        }

        //console.log(JSON.stringify(req.body));
        self.addUser(usrName, usrPwd, usrMobi, function (result) {
            res.json(result);
        });
    });

    app.post('/merchant', function (req, res) {

        req.body = JSON.parse(req.body.data);

        var metName = req.body.metName;
        var metPhone = req.body.metPhone;
        var metMinPrice = req.body.metMinPrice;
        var metPicUrl = req.body.metPicUrl || '';

        if (!(metName && metPhone && metMinPrice && metPhone.length === 10)) {
            res.json({ success: false, msg: '資料輸入错误' });
            return;
        }

        self.addMerchantPromise({ metName: metName, metPhone: metPhone, metMinPrice: metMinPrice, metPicUrl: metPicUrl }).then(function (merchant) {
            res.json({ success: true, merchant: merchant });
        }).catch(function () {
            return res.json({ success: false });
        });
    });

    app.post('/dishes', function (req, res) {

        req.body = JSON.parse(req.body.data);

        console.log(JSON.stringify(req.body));

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = req.body[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var dish = _step2.value;

                if (!(dish.dihName && dish.dihPrice && dish.metId)) {
                    res.json({ success: false, msg: '資料不完整' });
                    return;
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        req.body = req.body.map(function (row) {
            row.dihType = row.dihType || '主食';
            return row;
        });

        self.addDishPromise(req.body).then(function (result) {
            res.json({ success: true, dishes: result });
        }).catch(function () {
            return res.json({ success: false });
        });
    });

    app.post('/userAuth', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;

        if (!(usrName && usrPwd)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        //console.log(JSON.stringify(req.body));

        self.userAuth(usrName, usrPwd, function (result) {
            res.json(result);
        });
    });

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allAvailableGroup(function (result) {
            res.json(result);
        });
    });

    app.get('/groupById/:id', function (req, res) {
        self.getGroupById(Number(req.params.id), function (result) {
            return res.json(result);
        });
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
        var grpHostId = req.body.grpHostId;
        var dishes = req.body.dishes;
        var metId = req.body.metId;
        var addr = req.body.addr;
        var gorTime = req.body.gorTime;

        if (!(grpHostId && dishes && metId && addr && gorTime)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.postGroup(grpHostId, dishes, metId, addr, gorTime, function (result) {
            res.json(result);
        });
    });

    app.post('/joinGroup', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var usrId = Number(req.body.usrId);
        var dishes = req.body.dishes;
        var grpId = req.body.grpId;

        if (!(usrId && dishes && dishes.length !== 0 && grpId)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.joinGroupPromise(usrId, dishes, grpId).then(function (result) {
            res.json(result);
        }).catch(function (e) {
            res.json(e);
        });
    });

    app.post('/groupStatus', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var grpId = Number(req.body.grpId);
        var grpStatus = Number(req.body.grpStatus);
        if (!(grpId && grpStatus)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.updateGroupStatusPromise(grpId, grpStatus).then(function (result) {
            res.json(result);
        }).catch(function (e) {
            res.json(e);
        });
    });

    app.post('/mobiAuth', function (req, res) {
        var usrMobi = req.body.data;
        if (!usrMobi) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.getTwilioCode(usrMobi).then(function (result) {
            res.json({ success: true });
        }).catch(function (e) {
            res.json(e);
        });
    });

    app.get('/groupedOrdersByUserId/:id', function (req, res) {
        var usrId = Number(req.params.id);
        self.getGroupedOrdersByUserId(usrId, function (result) {
            //console.log(result);
            res.json(result);
        });
    });

    app.get('/groupedOrdersAndSumsByHostId/:id', function (req, res) {
        var usrId = Number(req.params.id);

        self.getGroupedOrdersAndSumsByHostIdPromise(usrId).then(function (result) {
            return res.json(result);
        });
    });

    app.listen(8080, function () {
        console.log('' + 'app listening on port 8080!');
    });

    this.addDishPromise = function (dishes) {

        return new Promise(function (resolve, reject) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = dishes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var dish = _step3.value;

                    dish.dihId = _.maxBy(db.DISH, "dihId").dihId + 1;
                    db.pushToJsonDb('DISH', dish);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
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

                setTimeout(function () {
                    var indexOfAuthCode = authCodes.findIndex(function (obj) {
                        return obj.authCode === authCodes;
                    });
                    if (indexOfAuthCode) {
                        authCodes.splice(indexOfAuthCode, 1);
                    }
                }, 1000 * 60 * 5);
                return;
            }

            client.messages.create({
                body: '您的飯糰驗證碼是' + randomAuth,
                to: '+886' + userMobi, // Text this number
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

                    setTimeout(function () {
                        var indexOfAuthCode = authCodes.findIndex(function (obj) {
                            return obj.authCode === authCodes;
                        });
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

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = db.USER[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var user = _step4.value;

                if (user.usrId > usrId) {
                    usrId = user.usrId;
                }
                usrId = Number(usrId) + 1;
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
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
            callback({ success: true });
        } else {
            callback({ success: false });
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
        return new Promise(function (resolve, reject) {
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
            callback({ success: 0 });
        }
    };

    this.allGroup = function (callback) {
        var result = [];

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = db.GROUP[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _group = _step5.value;

                var group = this.createClassGroupByGroupId(_group.grpId);
                result.push(group);
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
                }
            }
        }

        callback(result);
    };

    this.allAvailableGroup = function (callback) {
        var result = [];

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = db.GROUP.filter(function (g) {
                return g.grpStatus === 0 || g.grpStatus === 1;
            })[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var _group = _step6.value;

                var group = this.createClassGroupByGroupId(_group.grpId);
                result.push(group);
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }

        callback(result);
    };

    this.getGroupById = function (id, callback) {
        var group = this.createClassGroupByGroupId(id);
        callback(group);
    };

    this.allMerchant = function (callback) {
        var result = [];
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            var _loop2 = function _loop2() {
                var _merchant = _step7.value;

                var merchant = _.cloneDeep(_merchant);
                merchant.menu = _.filter(db.DISH, function (dish) {
                    return dish.metId === merchant.metId;
                });
                result.push(merchant);
            };

            for (var _iterator7 = db.MERCHANT[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                _loop2();
            }
        } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                }
            } finally {
                if (_didIteratorError7) {
                    throw _iteratorError7;
                }
            }
        }

        callback(result);
    };

    this.getMerchantById = function (id, callback) {
        var result = db.MERCHANT.find(function (merchant) {
            return merchant.metId === id;
        });
        result.menu = _.filter(db.DISH, function (dish) {
            return dish.metId === id;
        });
        callback(result);
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime, callback) {
        var lastGroup = _.maxBy(db.GROUP, 'grpId');
        var grpId = lastGroup ? lastGroup.grpId + 1 : 1;
        db.pushToJsonDb('GROUP', {
            grpId: grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime,
            grpStatus: 0

            //minAmount: minAmount
        });
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
            for (var _iterator8 = dishes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var dihId = _step8.value;

                var lastDish = _.maxBy(db.GROUP_DISHES, 'gdeId');
                var gdh = {
                    gdeId: lastDish ? lastDish.gdeId + 1 : 1,
                    dihId: Number(dihId),
                    grpId: grpId
                };
                db.pushToJsonDb("GROUP_DISHES", gdh);
            }
        } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                    _iterator8.return();
                }
            } finally {
                if (_didIteratorError8) {
                    throw _iteratorError8;
                }
            }
        }

        callback({ success: 1 });
    };

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        var _this = this;

        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise(function (resolve, reject) {
            //拒绝用户对同一个group连续点两次餐点
            if (db.ORDER.find(function (ord) {
                return ord.usrId === usrId && ord.grpId === grpId;
            })) {
                reject("重复加团!");
                return;
            }

            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = dishes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var _step9$value = _step9.value;
                    var dihId = _step9$value.dihId;
                    var num = _step9$value.num;

                    if (num === 0 || !_.isNumber(num)) {
                        continue;
                    }
                    var lastOrder = _.maxBy(db.ORDER, 'ordId');
                    db.pushToJsonDb("ORDER", {
                        ordId: lastOrder ? lastOrder.ordId + 1 : 1,
                        grpId: grpId,
                        usrId: usrId,
                        dihId: dihId,
                        ordNum: num
                    });
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }

            var lastGroupMember = _.maxBy(db.GROUP_MEMBER, function (gmr) {
                return gmr.gmrId;
            });
            db.pushToJsonDb("GROUP_MEMBER", {
                gmrId: lastGroupMember ? lastGroupMember.gmrId + 1 : 1,
                usrId: usrId,
                grpId: grpId
            });

            //最小外送金額
            var g = db.GROUP.find(function (g) {
                return g.grpId === grpId;
            });
            var metId = g.metId;
            var hostId = g.grpHostId;
            var metMinPrice = db.MERCHANT.find(function (m) {
                return m.metId === metId;
            }).metMinPrice;
            var amount = 0;

            _this.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(function (result) {
                //console.log(result.groupedOrderSums);
                var groupOrderSum = result.groupedOrderSums.find(function (orderSum) {
                    return orderSum.group.grpId === grpId;
                });
                console.log("groupOrderSum", groupOrderSum);

                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = groupOrderSum.orderSums[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var orderSum = _step10.value;

                        var price = orderSum.dish.dihPrice;
                        var num = orderSum.ordNum;
                        var total = price * num;
                        amount += total;
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                if (amount >= metMinPrice) {
                    g.grpStatus = 1;
                    db.setValueToJsonDb("GROUP", function (row) {
                        return row.grpId === grpId;
                    }, "grpStatus", 1);
                }
                resolve({ success: 1 });
            }).catch(function (e) {
                return console.log(e);
            });
        });
    };

    this.convertOrdersToGroupedOrders = function (orders) {
        var _this2 = this;

        var groupedOrders = [];
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
            var _loop3 = function _loop3() {
                var order = _step11.value;

                var tOrder = groupedOrders.find(function (gor) {
                    return gor.group.grpId === order.grpId;
                });
                if (tOrder) {
                    tOrder.orders.push(order);
                } else {

                    var group = _this2.createClassGroupByGroupId(order.grpId);
                    groupedOrders.push({ group: group, orders: [order] });
                }
            };

            for (var _iterator11 = orders[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                _loop3();
            }
        } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                }
            } finally {
                if (_didIteratorError11) {
                    throw _iteratorError11;
                }
            }
        }

        return _.sortBy(groupedOrders, function (row) {
            return -new Date(row.group.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016')).getTime();
        });
    };

    this.getGroupedOrdersByUserId = function (usrId, callback) {
        var orders = db.ORDER.filter(function (ord) {
            return ord.usrId === usrId;
        }).map(function (ord) {
            var newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                dish: db.DISH.find(function (d) {
                    return d.dihId === ord.dihId;
                }),
                ordNum: ord.ordNum
            };
            return newOrd;
        });

        var groupedOrders = self.convertOrdersToGroupedOrders(orders);

        callback(groupedOrders);
    };

    this.getGroupedOrdersAndSumsByHostIdPromise = function (hostId) {
        var that = this;

        return new Promise(function (resolve) {
            var groupedOrders = [];
            var groupedOrderSums = [];

            var groupIds = db.GROUP.filter(function (grp) {
                return grp.grpHostId === hostId;
            });
            var orders = db.ORDER.filter(function (ord) {
                //ord.grpId === groupId

                return db.GROUP.find(function (grp) {
                    return grp.grpId === ord.grpId;
                }).grpHostId === hostId;
            }).map(function (ord) {

                var newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    dish: db.DISH.find(function (d) {
                        return d.dihId === ord.dihId;
                    }),
                    ordNum: ord.ordNum
                };
                return newOrd;
            });

            //console.log('group',db.GROUP,'groupedOrders', orders);

            groupedOrders = self.convertOrdersToGroupedOrders(orders);

            self.formatOrders(groupedOrders, function (result) {
                groupedOrderSums = result;
            });

            //处理空白团
            var emptyGroups = db.GROUP.filter(function (grp) {
                return grp.grpHostId === hostId && !db.ORDER.find(function (ord) {
                    return ord.grpId === grp.grpId;
                });
            });
            if (emptyGroups) {
                emptyGroups.map(function (eptGroup) {
                    var group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({ group: group, orders: [] });
                    groupedOrderSums.push({ group: group, orderSums: [] });
                });
            }

            resolve({ groupedOrders: groupedOrders, groupedOrderSums: _.sortBy(groupedOrderSums, function (obj) {
                    return -new Date(obj.group.grpTime.replace(/(\d*)月 (\d*)日\,/gi, '$1/$2/2016')).getTime();
                }) });
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        var groupedOrderSums = [];
        //console.log('groups',db.GROUP);

        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
            for (var _iterator12 = groupedOrders[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var _step12$value = _step12.value;
                var group = _step12$value.group;
                var orders = _step12$value.orders;

                var orderSums = [];

                var _iteratorNormalCompletion13 = true;
                var _didIteratorError13 = false;
                var _iteratorError13 = undefined;

                try {
                    var _loop4 = function _loop4() {
                        var _step13$value = _step13.value;
                        var ordId = _step13$value.ordId;
                        var group = _step13$value.group;
                        var usrId = _step13$value.usrId;
                        var dish = _step13$value.dish;
                        var ordNum = _step13$value.ordNum;

                        //如果存在直接加
                        var order = orderSums.find(function (orm) {
                            return orm.dish.dihId === dish.dihId;
                        });
                        if (order) {
                            order.ordNum += ordNum;
                        } else {
                            orderSums.push({ group: group, dish: dish, ordNum: ordNum });
                        }
                    };

                    for (var _iterator13 = orders[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                        _loop4();
                    }
                } catch (err) {
                    _didIteratorError13 = true;
                    _iteratorError13 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }
                    } finally {
                        if (_didIteratorError13) {
                            throw _iteratorError13;
                        }
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

                groupedOrderSums.push({ group: group, orderSums: orderSums });
            }
        } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                    _iterator12.return();
                }
            } finally {
                if (_didIteratorError12) {
                    throw _iteratorError12;
                }
            }
        }

        callback(groupedOrderSums);
    };

    this.createClassGroupByGroupId = function (grpId) {
        var that = this;
        var group = db.GROUP.find(function (g) {
            return g.grpId === grpId;
        });

        if (!group) {
            return null;
        }

        var menu = [];
        var grpDishes = _.filter(db.GROUP_DISHES, function (grh) {
            return grh.grpId === group.grpId;
        }).map(function (grh) {
            var grpDish = {};
            grpDish.dish = _.find(db.DISH, function (dish) {
                return dish.dihId === grh.dihId;
            });
            _.assign(grpDish, grh);
            return grpDish;
        }) || [];
        grpDishes.map(function (grpDish) {

            //检查是否已经存在DISH的分类.
            var dihGroup = menu.find(function (dgp) {
                return dgp.dihType === grpDish.dish.dihType;
            });
            if (dihGroup) {
                //已经有了就加入一笔
                dihGroup.dishes.push(grpDish.dish);
            } else {
                //如果没有加入新的分类,和一笔DISH
                menu.push({ dihType: grpDish.dish.dihType, dishes: [grpDish.dish] });
            }
        });

        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: group.grpTime,
            grpHostName: db.USER.find(function (user) {
                return user.usrId === group.grpHostId;
            }).usrName,
            merchant: db.MERCHANT.find(function (merchant) {
                return merchant.metId === group.metId;
            }),
            grpOrder: _.filter(db.GROUP_ORDER, function (grr) {
                return grr.grpId === group.grpId;
            }) || [],
            grpDishes: grpDishes,
            grpHost: that.createUserByUserId(group.grpHostId),

            grpStatus: group.grpStatus,
            menu: menu
        };

        return group;
    };

    this.createUserByUserId = function (usrId) {
        var _usr = db.USER.find(function (usr) {
            return usr.usrId === usrId;
        });
        var user = {
            usrId: _usr.usrId,
            usrName: _usr.usrName,
            usrMobi: _usr.usrMobi
        };

        return user;
    };

    this.updateGroupStatusPromise = function (grpId, grpStatus) {
        return new Promise(function (resolve, reject) {
            var group = db.GROUP.find(function (s) {
                return grpId === s.grpId;
            });

            if (group.grpStatus >= 0 && group.grpStatus <= 2) {
                db.setValueToJsonDb('GROUP', function (row) {
                    return row.grpId === group.grpId;
                }, 'grpStatus', grpStatus);
                //group.grpStatus = grpStatus;

                resolve({ success: 1 });
            } else {
                reject({ success: 0 });
            }
        });
    };

    this.cleanGroup = function () {
        var today = new Date();

        this.allGroup(function (result) {
            //let timing = result[0].grpTime.replace(/月/,"/");
            console.log(result[0].grpTime);
            console.log(JSON.stringify(result));
        });

        //let t = setTimeout('Timer()', 500);
    };

    this.getStatus = function (grpId) {
        return new Promise(function (resolve) {
            var status = db.GROUP.find(function (g) {
                return grpId === g.grpId;
            }).grpStatus;
            resolve(status);
        });
    };

    ///////////////////后台

    //给资料表新增一个row
    app.post('/:adminPwd/table/:tableName', function (req, res) {
        if (req.params.adminPwd !== 'fHfKJp3iSAfhvd9fjn23Z5KMA6Sd') {
            res.json({ success: false });
        }

        try {
            req.body = JSON.parse(req.body.data);
            var rows = req.body.rows;
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = rows[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var row = _step14.value;

                    db.pushToJsonDb(req.params.tableName, row);
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                        _iterator14.return();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }

            res.json({ success: true });
        } catch (e) {

            res.json({ success: false });
        }
    });
};

module.exports = new Server();
//# sourceMappingURL=server.js.map
