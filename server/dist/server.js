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
require('./time.js');

//console.log(__dirname);

//let twilio = require('twilio');
//const twilio = require("./twilio/lib");
//let client = new twilio.RestClient(accountSid, authToken);

var client = require('twilio')("AC7161db8bee36103cc7d6c29fe33404ec", "1c76b95b0c1f28236cb262e6b32ba8ab");

var authCodes = []; //{phone  : String , authCode: String , endTime : Number , triedTimes:Numbers}

var nodemailer = require('nodemailer');

var mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'o.grpbuy@gmail.com',
        pass: 'asd1q2w3e'
    }
});

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

//CLEAN GROUP 刪掉超時的
(function () {
    setInterval(function () {
        //得到所有沒過期的團
        var availableGroups = _.filter(db.GROUP, function (grp) {
            return grp.grpStatus === 0 || grp.grpStatus === 1;
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function _loop() {
                var g = _step.value;

                var deadLine = new Date(g.grpTime);
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
        var usrMail = req.body.usrMail;
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
        } else if (db.USER.find(function (o) {
            return o.usrName === usrName;
        })) {
            res.json({ success: false, msg: '帳號名稱重複' });
            return;
        }

        //console.log(JSON.stringify(req.body));
        self.addUser(usrName, usrPwd, usrMail, usrMobi, function (result) {
            res.json(result);
        });
    });

    app.post('/merchant', function (req, res) {

        req.body = JSON.parse(req.body.data);

        var metName = req.body.metName;
        var metPhone = req.body.metPhone;
        var metMinPrice = Number(req.body.metMinPrice);
        var metPicUrl = req.body.metPicUrl || '';
        var metType = req.body.metType || '其他';

        if (!(metName && metPhone && metMinPrice && metMinPrice >= 0)) {
            res.json({ success: false, msg: '資料輸入錯誤' });
            return;
        }

        self.addMerchantPromise({ metName: metName, metPhone: metPhone, metMinPrice: metMinPrice, metPicUrl: metPicUrl, metType: metType }).then(function (merchant) {
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

                dish.dihPrice = Number(dish.dihPrice);

                if (!(dish.dihName && dish.dihPrice && dish.metId)) {
                    res.json({ success: false, msg: '資料不完整' });
                    return;
                }

                if (dish.dihPrice < 0) {
                    res.json({ success: false, msg: '商品價格不正確' });
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

    app.get('/unjoinedGroups/:usrId', function (req, res) {
        self.getUnjoinedGroups(Number(req.params.usrId), function (result) {
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

    app.get('/cancelOrder/:grpId/:usrId', function (req, res) {
        var grpId = Number(req.params.grpId);
        var usrId = Number(req.params.usrId);
        var ordStatus = db.ORDER.find(function (o) {
            return o.grpId === grpId && o.usrId === usrId;
        }).ordStatus;

        //例外判断, 只有待审查的订单可以被取消
        if (ordStatus === 0) {
            db.setValueToJsonDb('ORDER', function (o) {
                return o.grpId === grpId && o.usrId === usrId;
            }, 'ordStatus', -2);
            res.json({ success: true });
        } else {
            if (ordStatus === -2) {
                res.json({ success: false, err: '訂單已被取消' });
            } else {
                res.json({ success: false, err: '訂單已被確認,無法取消' });
            }
        }
    });

    app.post('/group', function (req, res) {

        //console.log(req.body);

        req.body = JSON.parse(req.body.data);
        var grpHostId = Number(req.body.grpHostId);
        var dishes = req.body.dishes;
        var metId = Number(req.body.metId);
        var addr = req.body.addr;
        var gorTime = req.body.gorTime;
        var grpAmountLimit = Number(req.body.grpAmountLimit) || 0;

        //TODO Check Time
        var deadLine = new Date(gorTime.replace(/(\d*)年(\d*)月(\d*)日\,/gi, '$1/$2/$3'));
        gorTime = deadLine.getTime();

        if (gorTime < new Date().getTime()) {
            res.json({ success: false, msg: '截止時間不能早於當前時間' });
            return;
        }

        if (!(grpHostId && dishes && metId && addr && gorTime)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.postGroup(grpHostId, dishes, metId, addr, gorTime, grpAmountLimit, function (result) {
            res.json(result);
        });
    });

    app.post('/joinGroup', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var usrId = Number(req.body.usrId);
        var dishes = req.body.dishes;
        var grpId = req.body.grpId;
        var comments = req.body.comments;

        if (!(usrId && dishes && dishes.length !== 0 && grpId)) {
            res.json({ success: false, msg: '資料不完整' });
            return;
        }

        self.joinGroupPromise(usrId, dishes, grpId, comments).then(function (result) {
            res.json(result);
        }).catch(function (e) {
            console.log(e);
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

    app.post('/updateOrdStatus', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var ordId = Number(req.body.ordId);
        var ordStatus = Number(req.body.ordStatus);
        // console.log("ordId:" + ordId + ",ordStatus:" + ordStatus);

        self.updateOrdStatusPromise(ordId, ordStatus).then(function (result) {
            res.json(result);
        }).catch(function (e) {
            res.json(e);
        });
    });

    app.get('/confirmOrder/:id', function (req, res) {
        var usrId = Number(req.params.id);

        self.confirmOrder(usrId).then(function (result) {
            return res.json(result);
        });
    });

    app.get('/grpUsersOrdersByHostId/:hostId', function (req, res) {
        var hostId = Number(req.params.hostId);
        var from = Number(req.query.from);
        self.getGrpUsersOrdersByHostIdPromise(hostId, from).then(function (result) {
            return res.json(result);
        });
    });

    app.post('/getGrpMember', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var gmrId = Number(req.body.gmrId);
        var comStatus = Number(req.body.comStatus);

        self.getComment(gmrId, comStatus).then(function (result) {
            res.json(result);
        }).catch(function (e) {
            res.json(e);
        });
    });

    app.post('/refuseOrder', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var usrId = Number(req.body.usrId);
        var grpId = Number(req.body.grpId);
        console.log('usrId , grpId', usrId, grpId);

        self.refuseOrder(usrId, grpId, function (result) {
            res.json(result);
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
                body: '您的販團驗證碼是' + randomAuth,
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

    this.addUser = function (usrName, usrPwd, usrMail, usrMobi, callback) {
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
            usrMail: usrMail,
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
     * 參數
     {metName,
     metPhone,
     metMinPrice,
     metPicUrl,
     metType}
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
            callback({ success: false, err: '帳號密碼不匹配' });
        }
    };

    //unjoined and available groups by user id
    this.getUnjoinedGroups = function (usrId, callback) {
        var that = this;

        var joinedGroupIds = _.uniqBy(db.ORDER.filter(function (ord) {
            return ord.usrId === usrId;
        }), 'grpId').map(function (ord) {
            return ord.grpId;
        });

        //包含了已经结束的团
        var allUnjoinedGroups = db.GROUP.filter(function (grp) {
            return !joinedGroupIds.find(function (grpId) {
                return grpId === grp.grpId;
            });
        });

        //并不是标准类别
        var unjoinedAndAvailable = allUnjoinedGroups.filter(function (g) {
            return g.grpStatus === 0 || g.grpStatus === 1;
        });

        var stdGroups = unjoinedAndAvailable.map(function (g) {
            return that.createClassGroupByGroupId(g.grpId);
        });

        callback(_.sortBy(stdGroups, function (row) {
            return -new Date(row.grpTime);
        }));
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

        callback(_.sortBy(result, function (row) {
            return -new Date(row.grpTime);
        }));
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
            for (var _iterator7 = db.MERCHANT[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var _merchant = _step7.value;

                var merchant = this.createClassMerchantById(_merchant.metId);
                result.push(merchant);
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
        var merchant = this.createClassMerchantById(id);
        callback(merchant);
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime, grpAmountLimit, callback) {
        var lastGroup = _.maxBy(db.GROUP, 'grpId');
        var grpId = lastGroup ? lastGroup.grpId + 1 : 1;
        db.pushToJsonDb('GROUP', {
            grpId: grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime,
            grpStatus: 0,
            grpCreateTime: new Date().getTime(),
            grpAmount: 0,
            grpAmountLimit: grpAmountLimit || 0

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

    this.joinGroupPromise = function (usrId, dishes, grpId, comments) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise(function (resolve, reject) {
            //拒絕用戶對同壹個group連續點兩次餐點
            //if (db.ORDER.find(ord=>ord.usrId === usrId && ord.grpId === grpId)) {
            //    reject("重復加團!");
            //    return;
            //}

            //只有0,1状态的团可以团购
            if (!_.includes([0, 1], db.GROUP.find(function (grp) {
                return grp.grpId === grpId;
            }).grpStatus)) {
                reject("團購已經截止!");
                return;
            }

            //是否超过最高上限
            var amountThisTime = 0;
            var funcFindDish = function funcFindDish(dih) {
                return function (d) {
                    return d.dihId === dih.dihId;
                };
            };
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = dishes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var dih = _step9.value;

                    amountThisTime += db.DISH.find(funcFindDish(dih)).dihPrice * dih.num;
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

            var grpAmountLimit = Number(db.GROUP.find(function (grp) {
                return grp.grpId === grpId;
            }).grpAmountLimit);
            var grpAmount = db.GROUP.find(function (grp) {
                return grp.grpId === grpId;
            }).grpAmount;
            if (grpAmountLimit !== 0 && amountThisTime + grpAmount > grpAmountLimit) {
                //團購上限
                reject('超過團購上限! 超出' + (amountThisTime + grpAmount - grpAmountLimit) + '元');
                return;
            } else {
                (function () {
                    //最小外送金額
                    var g = db.GROUP.find(function (g) {
                        return g.grpId === grpId;
                    });
                    var metId = g.metId;
                    var metMinPrice = db.MERCHANT.find(function (m) {
                        return m.metId === metId;
                    }).metMinPrice;
                    db.setValueToJsonDb("GROUP", function (row) {
                        return row.grpId === grpId;
                    }, "grpAmount", amountThisTime + grpAmount);
                    if (amountThisTime + grpAmount >= metMinPrice) {
                        db.setValueToJsonDb("GROUP", function (row) {
                            return row.grpId === grpId;
                        }, "grpStatus", 1);
                    }
                })();
            }

            var usrName = db.USER.find(function (usr) {
                return usr.usrId === usrId;
            }).usrName;
            var addOrd = function addOrd(usrName, dihId, num, ordStatus) {
                var lastOrder = _.maxBy(db.ORDER, 'ordId');

                db.pushToJsonDb("ORDER", {
                    ordId: lastOrder ? lastOrder.ordId + 1 : 1,
                    grpId: grpId,
                    usrId: usrId,
                    usrName: usrName, //07.03 add
                    dihId: dihId,
                    ordNum: num,
                    ordCreateTime: new Date().getTime(),
                    // ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    ordStatus: ordStatus
                });
            };

            var orderedDishIds = _.chain(db.ORDER).filter(function (ord) {
                return ord.usrId === usrId && ord.grpId === grpId;
            }).map(function (ord) {
                return ord.dihId;
            }).value();
            // let selectRowByDishId = dihId => row=>row.dihId === dihId;
            var snedornot = !db.GROUP_MEMBER.find(function (usr) {
                return usr.usrId === usrId && usr.grpId === grpId;
            }); //加購不通知

            var g = db.GROUP.find(function (g) {
                return g.grpId === grpId;
            });
            var hostId = g.grpHostId;
            var ordStatus = usrId === hostId ? 1 : 0; //團主訂單不需要經過確認

            // 加購情況(有舊訂單):
            // ordStatus==-1(拒絕) --->(both)新增另一張訂單
            // ordStatus==0 (待審查)-->(相同商品)直接修改
            //                                      -->(不同商品)新增訂單
            // ordStatus==1 (已接受)-->(相同商品)增加屬性、改狀態  (both)需再次確認
            //                                     -->(不同商品)新增訂單
            var orders = db.ORDER.filter(function (ord) {
                return ord.usrId === usrId && ord.grpId === grpId && _.includes([0, 1], ord.ordStatus);
            });

            // let orders = db.ORDER.filter(ord=>ord.usrId === usrId && ord.grpId === grpId && ord.ordStatus===0 || ord.ordStatus===1);

            // let orders = db.ORDER.filter(function (ord) {
            //     if (ord.usrId === usrId && ord.grpId === grpId && (ord.ordStatus === 0 || ord.ordStatus === 1)) {
            //         console.log('usrId grpId', usrId, grpId);
            //         console.log('ord.usrId ord.grpId ord.ordStatus', ord.usrId, ord.grpId, ord.ordStatus);
            //         return ord;
            //     }
            // });
            console.log('joinGroupPromise====orders' + JSON.stringify(orders));

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                var _loop2 = function _loop2() {
                    var _step10$value = _step10.value;
                    var dihId = _step10$value.dihId;
                    var num = _step10$value.num;

                    if (num === 0 || !_.isNumber(num)) {
                        return 'continue';
                    }

                    // if (orders)
                    console.log('dihId num', dihId, num);
                    if (orders.length === 0) {
                        //無舊訂單
                        addOrd(usrName, dihId, num, ordStatus);
                        console.log('無舊訂單 : ' + grpId, usrId, usrName, dihId, num, ordStatus);
                    } else {
                        //有舊訂單

                        var sameProduct = orders.find(function (ord) {
                            return ord.dihId === dihId;
                        });
                        console.log('====sameProduct', JSON.stringify(sameProduct));
                        if (sameProduct) {
                            if (sameProduct.ordStatus === 0) {
                                // ordStatus==0 (待審查)-->(相同商品)直接修改
                                console.log('ordStatus==0 (待審查)-->(相同商品)直接修改');
                                db.setValueToJsonDb('ORDER', function (ord) {
                                    return ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId;
                                }, 'ordNum', num + db.ORDER.find(function (ord) {
                                    return ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId;
                                }).ordNum);
                            } else if (sameProduct.ordStatus === 1) {
                                //  ordStatus==1 (已接受)-->(相同商品)需再次確認
                                console.log('ordStatus==1 (已接受)-->(相同商品)需再次確認');
                                db.setValueToJsonDb('ORDER', function (ord) {
                                    return ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId;
                                }, 'updateOrdNum', num);
                                db.setValueToJsonDb('ORDER', function (ord) {
                                    return ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId;
                                }, 'ordStatus', 3);
                                //TODO ordStatus=3
                            }
                        } else {
                                // ordStatus==0 (待審查)-->(不同商品)新增訂單
                                //  ordStatus==1 (已接受)-->(不同商品)需再次確認
                                console.log('ordStatus==0、1-->(不同商品)新增訂單');
                                addOrd(usrName, dihId, num, ordStatus);
                            }
                    }
                };

                for (var _iterator10 = dishes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var _ret3 = _loop2();

                    if (_ret3 === 'continue') continue;
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

            if (comments) {
                var lastGroupMember = _.maxBy(db.GROUP_MEMBER, function (gmr) {
                    return gmr.gmrId;
                });
                db.pushToJsonDb("GROUP_MEMBER", {
                    gmrId: lastGroupMember ? lastGroupMember.gmrId + 1 : 1,
                    usrId: usrId,
                    usrName: usrName, //07.03 add
                    grpId: grpId,
                    comments: comments
                });
            }

            //最小外送金額
            // let g = db.GROUP.find(g=>g.grpId === grpId);
            var metId = g.metId;
            // let hostId = g.grpHostId;
            var m = db.MERCHANT.find(function (m) {
                return m.metId === metId;
            });
            var metMinPrice = m.metMinPrice;
            var amount = 0;

            self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(function (result) {
                // console.log("result.groupedOrderSums"+JSON.stringify(result.groupedOrderSums));
                var groupOrderSum = result.groupedOrderSums.find(function (orderSum) {
                    return orderSum.group.grpId === grpId;
                });
                // console.log("groupOrderSum", groupOrderSum);

                if (groupOrderSum) {
                    var _iteratorNormalCompletion11 = true;
                    var _didIteratorError11 = false;
                    var _iteratorError11 = undefined;

                    try {
                        for (var _iterator11 = groupOrderSum.orderSums[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            var orderSum = _step11.value;

                            var price = orderSum.dish.dihPrice;
                            var num = orderSum.ordNum;
                            var total = price * num;
                            amount += total;
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

                    db.setValueToJsonDb("GROUP", function (row) {
                        return row.grpId === grpId;
                    }, "grpAmount", amount);

                    if (amount >= metMinPrice) {
                        db.setValueToJsonDb("GROUP", function (row) {
                            return row.grpId === grpId;
                        }, "grpStatus", 1);
                    }
                }
                resolve({ success: 1 });
            }).catch(function (e) {
                return console.log(e);
            });

            // console.log('snedornot'+snedornot);
            // 通知團主 : 有新成員加入  ;  不通知 : 團主加入、團員加購
            if (usrId !== hostId && snedornot) {
                var hostMail = db.USER.find(function (usr) {
                    return usr.usrId === hostId;
                }).usrMail;
                var metName = m.metName;
                var subject = '販團 : ' + metName + ' - 有新成員加入!';
                var now = new Date();
                var detime = new Date(g.grpTime);

                var html = '<p>申請時間: ' + (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + '</p>' + '<p>申請人: ' + usrName + '</p>' + '<p>申請團購: ' + metName + '</p>' + '<p>團購截止時間: ' + (detime.getMonth() + 1) + '/' + detime.getDate() + ' ' + detime.getHours() + ':' + (detime.getMinutes() < 10 ? '0' + detime.getMinutes() : detime.getMinutes()) + '</p>' + '<br><br><br><p>信件由販團系統自動發送: <a href="http://bit.do/groupbuy">http://bit.do/groupbuy</a> </p>';
                self.sendMail(hostMail, subject, html);
            }
        });
    };

    this.convertOrdersToGroupedOrders = function (orders) {
        var _this = this;

        var groupedOrders = [];

        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
            var _loop3 = function _loop3() {
                var order = _step12.value;


                // if (order.ordStatus > 0) {
                // console.log("ordStatus:" + order.ordStatus);
                var tOrder = groupedOrders.find(function (gor) {
                    return gor.group.grpId === order.grpId;
                });

                if (tOrder) {
                    if (order.ordStatus > 0) {
                        tOrder.orders.push(order);
                    }
                } else {
                    var group = _this.createClassGroupByGroupId(order.grpId);

                    if (order.ordStatus === 0) {
                        group.ordNotConfirm = true;
                        groupedOrders.push({ group: group, orders: [] });
                    } else if (order.ordStatus === -1) {
                        groupedOrders.push({ group: group, orders: [] });
                    } else {
                        groupedOrders.push({ group: group, orders: [order] });
                    }
                }
                // }
            };

            for (var _iterator12 = orders[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                _loop3();
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

        return _.sortBy(groupedOrders, function (row) {
            return -new Date(row.group.grpTime);
        });
    };

    this.convertOrdersToGroupedOrdersUsr = function (orders) {
        var _this2 = this;

        var groupedOrders = [];
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
            var _loop4 = function _loop4() {
                var order = _step13.value;


                var tOrder = groupedOrders.find(function (gor) {
                    return gor.group.grpId === order.grpId;
                });
                if (tOrder) {
                    tOrder.orders.push(order);
                } else {
                    var group = _this2.createClassGroupByGroupId(order.grpId);

                    //顯示給使用者的狀態
                    var status = '';

                    switch (group.grpStatus) {
                        case 0:
                        case 1:
                            switch (order.ordStatus) {
                                case -1:
                                    status = '被團主拒絕';
                                    break;
                                case -2:
                                    status = '已取消';
                                    break;
                                case 0:
                                    status = '等待團主審查';
                                    break;
                                case 1:
                                    if (group.grpStatus === 0) {
                                        status = '已確認, 未達到起送金額';
                                    } else {
                                        status = '等待商家配送';
                                    }
                                    break;
                                case 2:
                                    status = '付款完成';
                                    break;
                            }
                            break;
                        case 2:
                            status = '已送達, 待付款';
                            break;
                        case 3:
                            status = '已完成';
                            break;
                        case -1:
                            status = '開團失敗';
                            break;
                    }

                    groupedOrders.push({ group: group, orders: [order], status: status });
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

        return _.sortBy(groupedOrders, function (row) {
            return -new Date(row.group.grpTime);
        });
    };

    this.getGroupedOrdersByUserId = function (usrId, callback) {
        var orders = _.sortBy(db.ORDER.filter(function (ord) {
            return ord.usrId === usrId;
        }), function (obj) {
            return -obj.ordCreateTime;
        }).map(function (ord) {

            var newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                usrName: ord.usrName, //07.03 add
                dish: db.DISH.find(function (d) {
                    return d.dihId === ord.dihId;
                }),
                ordNum: ord.ordNum,
                ordStatus: ord.ordStatus, //07.03 add
                ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss')

            };
            return newOrd;
        });

        var groupedOrders = self.convertOrdersToGroupedOrdersUsr(orders);
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
                    usrName: ord.usrName, //07.03 add
                    dish: db.DISH.find(function (d) {
                        return d.dihId === ord.dihId;
                    }),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus, //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                    updateOrdNum: ord.updateOrdNum ? ord.updateOrdNum : undefined
                };

                return newOrd;
            });

            //console.log('group',db.GROUP,'groupedOrders', orders);

            groupedOrders = self.convertOrdersToGroupedOrders(orders);

            // console.log("ordersordersordersorders:" + JSON.stringify(orders));
            // console.log("groupedOrdersgroupedOrdersgroupedOrders:" + JSON.stringify(groupedOrders));

            self.formatOrders(groupedOrders, function (result) {
                groupedOrderSums = result;
            });

            //處理空白團
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

            // console.log("groupedOrderSumsgroupedOrderSums:" + JSON.stringify(groupedOrderSums));

            resolve({
                groupedOrders: _.orderBy(groupedOrders, function (obj) {
                    return obj.group.grpCreateTime;
                }, 'desc'),
                // groupedOrderSums: _.sortBy(groupedOrderSums, obj=>obj.group.grpCreateTime)
                groupedOrderSums: _.orderBy(groupedOrderSums, function (obj) {
                    return obj.group.grpCreateTime;
                }, 'desc')
                // groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.confirmOrder = function (hostId) {
        var that = this;

        return new Promise(function (resolve) {
            var groupedOrders = [];
            var groupedOrderSums = [];

            var groupIds = db.GROUP.filter(function (grp) {
                return grp.grpHostId === hostId;
            });
            var orders = db.ORDER.filter(function (ord) {

                return db.GROUP.find(function (grp) {
                    return grp.grpId === ord.grpId;
                }).grpHostId === hostId;
            }).map(function (ord) {

                var newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    usrName: ord.usrName, //07.03 add
                    dish: db.DISH.find(function (d) {
                        return d.dihId === ord.dihId;
                    }),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus, //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                    updateOrdNum: ord.updateOrdNum ? ord.updateOrdNum : undefined
                };
                return newOrd;
            });

            groupedOrders = self.convertOrdersToGroupedOrdersUsr(orders);

            self.formatOrders(groupedOrders, function (result) {
                groupedOrderSums = result;
            });

            //處理空白團
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
            resolve({
                groupedOrders: groupedOrders,
                groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        var groupedOrderSums = [];
        //console.log('groups',db.GROUP);
        //console.log('groupedOrdersgroupedOrdersgroupedOrders:', JSON.stringify(groupedOrders));

        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
            for (var _iterator14 = groupedOrders[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                var _step14$value = _step14.value;
                var group = _step14$value.group;
                var orders = _step14$value.orders;

                var orderSums = [];

                var _iteratorNormalCompletion15 = true;
                var _didIteratorError15 = false;
                var _iteratorError15 = undefined;

                try {
                    var _loop5 = function _loop5() {
                        var _step15$value = _step15.value;
                        var ordId = _step15$value.ordId;
                        var group = _step15$value.group;
                        var usrId = _step15$value.usrId;
                        var dish = _step15$value.dish;
                        var ordNum = _step15$value.ordNum;
                        var ordStatus = _step15$value.ordStatus;

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

                    for (var _iterator15 = orders[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                        _loop5();
                    }
                } catch (err) {
                    _didIteratorError15 = true;
                    _iteratorError15 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion15 && _iterator15.return) {
                            _iterator15.return();
                        }
                    } finally {
                        if (_didIteratorError15) {
                            throw _iteratorError15;
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

        callback(groupedOrderSums);
    };

    this.createClassMerchantById = function (metId) {
        var result = _.cloneDeep(db.MERCHANT.find(function (merchant) {
            return merchant.metId === metId;
        }));
        result.menu = _.filter(db.DISH, function (dish) {
            return dish.metId === metId;
        });
        return result;
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
        var grpComments = [];
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

            //檢查是否已經存在DISH的分類.
            var dihGroup = menu.find(function (dgp) {
                return dgp.dihType === grpDish.dish.dihType;
            });
            if (dihGroup) {
                //已經有了就加入壹筆
                dihGroup.dishes.push(grpDish.dish);
            } else {
                //如果沒有加入新的分類,和壹筆DISH
                menu.push({ dihType: grpDish.dish.dihType, dishes: [grpDish.dish] });
            }
        });

        var merchant = db.MERCHANT.find(function (merchant) {
            return merchant.metId === group.metId;
        });

        // grpComments.push(db.GROUP_MEMBER.filter(g=>g.grpId === grpId));

        var grpCom = db.GROUP_MEMBER.filter(function (g) {
            return g.grpId === grpId;
        });

        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
            for (var _iterator16 = grpCom[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                var gc = _step16.value;

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
        } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                    _iterator16.return();
                }
            } finally {
                if (_didIteratorError16) {
                    throw _iteratorError16;
                }
            }
        }

        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: new Date(group.grpTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpHostName: db.USER.find(function (user) {
                return user.usrId === group.grpHostId;
            }).usrName,
            merchant: merchant,
            grpOrder: _.filter(db.GROUP_ORDER, function (grr) {
                return grr.grpId === group.grpId;
            }) || [],
            grpDishes: grpDishes,
            grpHost: that.createUserByUserId(group.grpHostId),
            grpStatus: group.grpStatus,
            menu: menu,
            grpCreateTime: new Date(group.grpCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpAmount: group.grpAmount || 0,
            grpReachRatePercent: 100 * ((group.grpAmount || 0) / merchant.metMinPrice > 1 ? 1 : (group.grpAmount || 0) / merchant.metMinPrice),
            grpAmountLimit: group.grpAmountLimit,
            grpComments: grpComments
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
            //console.log(result[0].grpTime);
            //console.log(JSON.stringify(result));
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

    this.getComment = function (gmrId, comStatus) {
        return new Promise(function (resolve) {
            //TODO
            var comments = db.GROUP_MEMBER.find(function (g) {
                return g.grpId === grpId && g.usrId === usrId;
            }).comments;
            resolve(comments);
        });
    };

    this.updateOrdStatusPromise = function (ordId, ordStatus) {
        //一次只能修改一個ordId的ordStatus
        return new Promise(function (resolve, reject) {
            var order = db.ORDER.find(function (s) {
                return ordId === s.ordId;
            });

            if (order.ordStatus === 3 && ordStatus === -1) {
                db.setValueToJsonDb('ORDER', function (row) {
                    return row.ordId === order.ordId;
                }, 'ordStatus', 1);
                db.setValueToJsonDb('ORDER', function (row) {
                    return row.ordId === order.ordId;
                }, 'updateOrdNum', undefined);
                return;
            }

            if (order.ordStatus != -1) {
                //TODO
                db.setValueToJsonDb('ORDER', function (row) {
                    return row.ordId === order.ordId;
                }, 'ordStatus', ordStatus);
                if (order.updateOrdNum && order.updateOrdNum !== 0) {
                    console.log('updateOrdStatusPromise====order.updateOrdNum', order.updateOrdNum);
                    db.setValueToJsonDb('ORDER', function (row) {
                        return row.ordId === order.ordId;
                    }, 'ordNum', order.ordNum + order.updateOrdNum);
                    db.setValueToJsonDb('ORDER', function (row) {
                        return row.ordId === order.ordId;
                    }, 'updateOrdNum', undefined);
                }
                resolve({ success: 1 });
            } else {
                reject({ success: 0 });
            }
        });
    };

    this.getGrpUsersOrdersByHostIdPromise = function (hostId, from) {
        //from :  0=> confirmOrder  , 1=>productDetail
        return new Promise(function (resolve) {
            switch (from) {
                case 0:
                    {
                        self.confirmOrder(hostId).then(function (result) {
                            // TODO WHAT THE FUCK
                            // console.log('switch 0');
                            var GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders([0, 3], result).GrpUsersOrders.filter(function (guo) {
                                // guo.usrOrders = guo.usrOrders.filter(uo=>uo.ordStatus === 0);
                                // console.log('====guo.usrOrders:' + JSON.stringify(guo.usrOrders));
                                return guo.usrOrders.length !== 0 && guo.group.grpStatus !== -1;
                            });
                            console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
                            resolve({ GrpUsersOrders: GrpUsersOrders });
                        });
                        break;
                    }
                case 1:
                    {
                        self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(function (result) {
                            // console.log('switch 1');
                            var GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders([1, 2, 3], result);
                            // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
                            resolve(GrpUsersOrders);
                        });
                        break;
                    }
            }
        });
    };

    this.convertGroupedOrdersToGrpUsrOrders = function (ordStatus, result) {
        var GrpUsersOrders = {
            GrpUsersOrders: []
        };
        // console.log('====result:' + JSON.stringify(result.groupedOrders));

        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
            for (var _iterator17 = result.groupedOrders[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                var grpOrd = _step17.value;

                var uos = [];
                var grpComments = grpOrd.group.grpComments;

                var _iteratorNormalCompletion18 = true;
                var _didIteratorError18 = false;
                var _iteratorError18 = undefined;

                try {
                    var _loop6 = function _loop6() {
                        var order = _step18.value;

                        // console.log(_.includes(ordStatus, order.ordStatus));
                        if (_.includes(ordStatus, order.ordStatus)) {

                            order.dish.ordNum = order.ordNum;
                            order.ordNum = undefined;
                            // console.log('====order:' + JSON.stringify(order));

                            var uosobj = uos.find(function (u) {
                                return u.usrId === order.usrId;
                            });
                            if (!uosobj) {
                                uos.push({
                                    usrId: order.usrId,
                                    usrName: order.usrName,
                                    usrAmount: order.dish.ordNum * order.dish.dihPrice,
                                    // ordStatus: order.ordStatus,
                                    usrDishes: [{
                                        dihId: order.dish.dihId,
                                        dihName: order.dish.dihName,
                                        metId: order.dish.metId,
                                        dihType: order.dish.dihType,
                                        dihPrice: order.dish.dihPrice,
                                        ordNum: order.dish.ordNum,
                                        updateOrdNum: order.updateOrdNum ? order.updateOrdNum : undefined
                                    }],
                                    usrComments: _.filter(grpComments, function (com) {
                                        return com.usrId === order.usrId;
                                    }),
                                    usrOrds: [{ ordId: order.ordId, ordStatus: order.ordStatus }]
                                    // 無法理解錯在哪裡
                                    // ,usrDishesWhy: [order.dish]
                                });
                                // console.log('====order.dish:' + JSON.stringify(order.dish));
                            } else {
                                    uosobj.usrAmount = uosobj.usrAmount + order.dish.ordNum * order.dish.dihPrice;
                                    // uosobj.usrDishes.push(order.dish);
                                    uosobj.usrDishes.push({
                                        dihId: order.dish.dihId,
                                        dihName: order.dish.dihName,
                                        metId: order.dish.metId,
                                        dihType: order.dish.dihType,
                                        dihPrice: order.dish.dihPrice,
                                        ordNum: order.dish.ordNum,
                                        updateOrdNum: order.updateOrdNum ? order.updateOrdNum : undefined
                                    });
                                    uosobj.usrOrds.push({ ordId: order.ordId, ordStatus: order.ordStatus });
                                }
                        }
                    };

                    for (var _iterator18 = grpOrd.orders[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                        _loop6();
                    }
                } catch (err) {
                    _didIteratorError18 = true;
                    _iteratorError18 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion18 && _iterator18.return) {
                            _iterator18.return();
                        }
                    } finally {
                        if (_didIteratorError18) {
                            throw _iteratorError18;
                        }
                    }
                }

                GrpUsersOrders.GrpUsersOrders.push({
                    group: grpOrd.group,
                    usrOrders: uos
                });
            }

            // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
        } catch (err) {
            _didIteratorError17 = true;
            _iteratorError17 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                    _iterator17.return();
                }
            } finally {
                if (_didIteratorError17) {
                    throw _iteratorError17;
                }
            }
        }

        return GrpUsersOrders;
    };

    this.sendMail = function (usrMail, subject, html) {

        if (usrMail && subject && html) {
            mailTransport.sendMail({
                from: 'o.grpbuy@gmail.com',
                to: usrMail,
                subject: subject,
                html: html
            }, function (err) {
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
        }
    };

    this.refuseOrder = function (usrId, grpId, callback) {
        var orders = db.ORDER.filter(function (ord) {
            return ord.usrId === usrId && ord.grpId === grpId;
        });

        if (orders) {
            (function () {
                var dishes = '';
                var _iteratorNormalCompletion19 = true;
                var _didIteratorError19 = false;
                var _iteratorError19 = undefined;

                try {
                    var _loop7 = function _loop7() {
                        var order = _step19.value;

                        var dihName = db.DISH.find(function (dih) {
                            return dih.dihId === order.dihId;
                        }).dihName;
                        dishes += '<li>' + dihName + '  ' + order.ordNum + '份</li>';
                    };

                    for (var _iterator19 = orders[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                        _loop7();
                    }
                    // console.log(JSON.stringify(orders));
                } catch (err) {
                    _didIteratorError19 = true;
                    _iteratorError19 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion19 && _iterator19.return) {
                            _iterator19.return();
                        }
                    } finally {
                        if (_didIteratorError19) {
                            throw _iteratorError19;
                        }
                    }
                }

                console.log(dishes);

                var g = db.GROUP.find(function (g) {
                    return g.grpId === grpId;
                });
                var metId = g.metId;
                var metName = db.MERCHANT.find(function (m) {
                    return m.metId === metId;
                }).metName;
                var ordCreateTime = orders[0].ordCreateTime;
                var hostName = db.USER.find(function (usr) {
                    return usr.usrId === g.grpHostId;
                }).usrName;

                // 通知團員訂單被拒絕
                var usrMail = db.USER.find(function (usr) {
                    return usr.usrId === usrId;
                }).usrMail;
                var subject = '販團 : 很不幸的 - 您的申請遭到拒絕';
                var jointime = new Date(ordCreateTime);

                var html = '<p>申請時間: ' + (jointime.getMonth() + 1) + '/' + jointime.getDate() + ' ' + jointime.getHours() + ':' + (jointime.getMinutes() < 10 ? '0' + jointime.getMinutes() : jointime.getMinutes()) + '</p>' + '<p>申請團購: ' + metName + '</p>' + '<p>團主 : ' + hostName + '</p>' + '<br><p>訂購項目: </p><ul>' + dishes + '</ul>' + '<br><br><br><p>信件由販團系統自動發送: <a href="http://bit.do/groupbuy">http://bit.do/groupbuy</a> </p>';

                console.log('usrMail , metName ', usrMail, metName);

                self.sendMail(usrMail, subject, html);

                callback({ success: 1 });
            })();
        } else {
            callback({ success: 0 });
        }
    };

    ///////////////////後臺

    //給資料表新增壹個row
    app.post('/:adminPwd/table/:tableName', function (req, res) {
        if (req.params.adminPwd !== 'fHfKJp3iSAfhvd9fjn23Z5KMA6Sd') {
            res.json({ success: false });
        }

        try {
            req.body = JSON.parse(req.body.data);
            var rows = req.body.rows;
            var _iteratorNormalCompletion20 = true;
            var _didIteratorError20 = false;
            var _iteratorError20 = undefined;

            try {
                for (var _iterator20 = rows[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                    var row = _step20.value;

                    db.pushToJsonDb(req.params.tableName, row);
                }
            } catch (err) {
                _didIteratorError20 = true;
                _iteratorError20 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion20 && _iterator20.return) {
                        _iterator20.return();
                    }
                } finally {
                    if (_didIteratorError20) {
                        throw _iteratorError20;
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
