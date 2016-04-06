'use strict';

var _ = require('lodash');

/**
 * Created by User on 2016/3/24.
 */
var Server = function Server() {

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

    var joinGroup1 = [{
        usrId: 'd',
        dishes: '0.1',
        grpId: '6666'
    }];

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

    app.post('/addUser', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;
        var usrMobi = req.body.usrMobi;
        console.log(JSON.stringify(req.body));
        addUser(usrName, usrPwd, usrMobi, function (result) {});
    });

    app.post('/userAuth', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;

        console.log(JSON.stringify(req.body));

        self.userAuth(usrName, usrPwd, function (result) {
            res.json(result);
        });
    });

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allGroup(function (result) {
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

    app.get('/getMerchantById/:id', function (req, res) {
        // Pass to next layer of middleware
        self.merchantById(Number(req.params.id), function (result) {
            res.json(result);
        });
    });

    app.post('/group', function (req, res) {
        var grpHostId = req.body.grpHostId;
        var dishes = req.body.dishes;
        var metId = req.body.metId;
        var addr = req.body.addr;
        var gorTime = req.body.gorTime;
        var minAmount = req.body.minAmount;

        console.log(JSON.stringify(req.body));

        self.group(grpHostId, dishes, metId, addr, gorTime, minAmount, function (result) {
            res.json(result);
        });
    });

    app.post('/joinGroup', function (req, res) {
        var usrId = req.body.grpHostId;
        var dishes = req.body.dishes;
        var grpId = req.body.grpId;

        console.log(JSON.stringify(req.body));

        joinGroup(usrId, dishes, grpId, function (result) {});
    });

    app.listen(3000, function () {
        console.log('' + 'app listening on port 3000!');
    });

    this.addUser = function (usrName, usrPwd, usrMobi, callback) {
        var usrId = 0;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = db.USER[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var user = _step.value;

                if (user.usrId > usrId) {
                    usrId = user.usrId;
                }
                usrId = Number(usrId) + 1;
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

        var usrCreateTime = new Date();
        var newUser = { usrId: usrId, usrName: usrName, usrPwd: usrPwd, usrCreateTime: usrCreateTime, usrMobi: usrMobi };

        if (newUser.usrName.length != 0 || newUser.usrPwd.length != 0 || newUser.usrMobi.length != 0) {
            db.USER.push(newUser);
            callback({ success: 1 });
            return;
        } else {
            callback({ success: 0 });
        }
    };

    this.userAuth = function (usrName, usrPwd, callback) {
        var isSuccess = false;
        for (var index in db.USER) {
            if (db.USER[index].usrName == usrName && db.USER[index].usrPwd == usrPwd) {
                callback({ success: 1 });
                return;
            }
        }

        if (!isSuccess) {
            callback({ success: 0 });
        }
    };

    this.allGroup = function (callback) {
        var result = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            var _loop = function _loop() {
                var group = _step2.value;

                result.push({
                    grpId: group.grpId,
                    grpAddr: group.grpAddr,
                    grpTime: group.grpTime,
                    grpHostName: db.USER.find(function (user) {
                        return user.usrId == group.grpHostId;
                    }).usrName,
                    merchant: db.MERCHANT.find(function (merchant) {
                        return merchant.metId == group.metId;
                    }),
                    grpOrder: _.filter(db.GROUP_ORDER, function (grr) {
                        return grr.grpId == group.grpId;
                    }),
                    grpDishes: _.filter(db.GROUP_DISHES, function (grh) {
                        return grh.grpId == group.grpId;
                    })
                });
            };

            for (var _iterator2 = db.GROUP[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                _loop();
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

        callback(result);
    };

    this.getGroupById = function (id, callback) {
        var group = db.GROUP.find(function (g) {
            return g.grpId === id;
        });
        callback({
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
            }),
            grpDishes: _.filter(db.GROUP_DISHES, function (grh) {
                return grh.grpId === group.grpId;
            })
        });
    };

    this.allMerchant = function (callback) {

        var allMerchantdata = [];
        var menu = [];

        for (var MIndex in db.MERCHANT) {

            for (var DIndex in db.DISH) {
                if (db.MERCHANT[MIndex].metId == db.DISH[DIndex].metId) {
                    menu.push({
                        dihName: db.DISH[DIndex].dihName,
                        metId: db.DISH[DIndex].metId,
                        dihType: db.DISH[DIndex].dihType,
                        dihPrice: db.DISH[DIndex].dihPrice
                    });
                }
            }

            allMerchantdata.push({
                metId: db.MERCHANT[MIndex].metId,
                metName: db.MERCHANT[MIndex].metName,
                metPhone: db.MERCHANT[MIndex].metPhone,
                menu: menu
            });
            menu = [];
        }

        //console.log(JSON.stringify(allMerchantdata));

        if (allMerchantdata.length != 0) {
            callback(allMerchantdata);
            return;
        } else {
            callback({ success: 0 });
        }
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

    this.group = function (grpHostId, dishes, metId, addr, gorTime, callback) {

        var i = db.GROUP.length;
        var newGroup = {
            grpId: i,
            grpHostId: grpHostId,
            //dishes: dishes,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime
            //minAmount: minAmount
        };

        for (var index in dishes) {
            var gdeId = db.GROUP_DISHES.length;
            var grpId = i;
            var dishesList = { gdeId: gdeId, dihId: dishes[index], grpId: grpId };
            //console.log("dishesList:"+JSON.stringify(dishesList));
            db.GROUP_DISHES.push(dishesList);
        }

        if (newGroup != 0) {

            db.GROUP.push(newGroup);

            //console.log(USER);
            //callback(GROUP);
            callback({ success: 1 });
        } else {
            callback({ success: 0 });
        }
    };

    this.joinGroup = function (usrId, dishes, grpId, callback) {

        var newGroupOrder = {};
        var dihId;
        var gorNum;
        var num;

        if (db.GROUP_ORDER.length == 0) {
            for (var index in dishes) {
                dihId = dishes[index].dihId;
                num = dishes[index].num;
                newGroupOrder = { grpId: grpId, dihId: dihId, gorNum: num };
                db.GROUP_ORDER.push(newGroupOrder);
                //資料表沒有資料，直接新增
            }
        } else {
                for (var index in db.GROUP_ORDER) {
                    for (var index in dishes) {
                        dihId = dishes[index].dihId;
                        num = dishes[index].num;

                        if (grpId == db.GROUP_ORDER[index].grpId && dihId == db.GROUP_ORDER[index].dihId) {
                            db.GROUP_ORDER[index].gorNum = parseInt(db.GROUP_ORDER[index].gorNum) + num; //直接改值
                            //尋找相同的<團號>及<商品ID>，有則Updata
                        } else {
                                newGroupOrder = { grpId: grpId, dihId: dihId, gorNum: num };
                                db.GROUP_ORDER.push(newGroupOrder);
                                //無，新增
                            }
                    }
                }
            }

        var gmrId = db.GROUP_MEMBER.length + 1;
        var newGroupMember = {
            //grpHostId: grpHostId,
            //dishes: dishes,
            gmrId: gmrId,
            usrId: usrId,
            grpId: grpId
        };

        if (newGroupMember != 0) {
            db.GROUP_MEMBER.push(newGroupMember);
            callback({ success: 1 });
        } else {
            callback({ success: 0 });
        }
    };
};
module.exports = new Server();
//console.log( new Date());