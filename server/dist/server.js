/**
 * Created by User on 2016/3/24.
 */

'use strict';

var isDebug = true;

var _ = require('lodash');
require('source-map-support').install();

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
        addUser(usrName, usrPwd, usrMobi, function (result) {});
    });

    app.post('/userAuth', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;

        //console.log(JSON.stringify(req.body));

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
    });

    app.post('/joinGroup', function (req, res) {
        req.body = JSON.parse(req.body.data);
        var usrId = Number(req.body.usrId);
        var dishes = req.body.dishes;
        var grpId = req.body.grpId;

        //console.log(JSON.stringify(req.body));

        self.joinGroupPromise(usrId, dishes, grpId).then(function (result) {
            res.json(result);
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

        if (newUser.usrName.length !== 0 || newUser.usrPwd.length != 0 || newUser.usrMobi.length != 0) {
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
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = db.GROUP[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var group = _step2.value;

                result.push(self.convertGroupIdToGroupObject(group.grpId));
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
        var group = self.convertGroupIdToGroupObject(id);
        callback(group);
    };

    this.allMerchant = function (callback) {
        var result = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            var _loop = function _loop() {
                var merchant = _step3.value;

                merchant.menu = _.filter(db.DISH, function (dish) {
                    return dish.metId === merchant.metId;
                });
                result.push(merchant);
            };

            for (var _iterator3 = db.MERCHANT[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                _loop();
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
        var grpId = _.maxBy(db.GROUP, 'grpId').grpId + 1;
        db.GROUP.push({
            grpId: grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime
            //minAmount: minAmount
        });
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = dishes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var dihId = _step4.value;

                var gdh = {
                    gdeId: _.maxBy(db.GROUP_DISHES, 'gdeId').gdeId + 1,
                    dihId: Number(dihId),
                    grpId: grpId
                };
                db.GROUP_DISHES.push(gdh);
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

        callback({ success: 1 });
    };

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));

        return new Promise(function (resolve, reject) {
            //拒绝用户对同一个group连续点两次餐点
            if (db.ORDER.find(function (ord) {
                return ord.usrId === usrId && ord.grpId === grpId;
            })) {
                reject("重复加团!");
                return;
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = dishes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _step5$value = _step5.value;
                    var dihId = _step5$value.dihId;
                    var num = _step5$value.num;

                    db.ORDER.push({
                        ordId: _.maxBy(db.ORDER, 'ordId').ordId + 1,
                        grpId: grpId,
                        usrId: usrId,
                        dihId: dihId,
                        ordNum: num
                    });
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

            db.GROUP_MEMBER.push({
                gmrId: _.maxBy(db.GROUP_MEMBER, function (gmr) {
                    return gmr.gmrId;
                }).gmrId + 1,
                usrId: usrId,
                grpId: grpId
            });

            resolve({ success: 1 });
        });
    };

    this.convertOrdersToGroupedOrders = function (orders) {
        var groupedOrders = [];
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            var _loop2 = function _loop2() {
                var order = _step6.value;

                var tOrder = groupedOrders.find(function (gor) {
                    return gor.group.grpId === order.grpId;
                });
                if (tOrder) {
                    tOrder.orders.push(order);
                } else {

                    var group = self.convertGroupIdToGroupObject(order.grpId);
                    groupedOrders.push({ group: group, orders: [order] });
                }
            };

            for (var _iterator6 = orders[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _loop2();
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

        return groupedOrders;
    };

    this.convertGroupIdToGroupObject = function (grpId) {
        var group = db.GROUP.find(function (g) {
            return g.grpId === grpId;
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
            grpDishes: _.filter(db.GROUP_DISHES, function (grh) {
                return grh.grpId === group.grpId;
            }).map(function (grh) {
                var grpDish = {};
                grpDish.dish = _.find(db.DISH, function (dish) {
                    return dish.dihId === grh.dihId;
                });
                _.assign(grpDish, grh);
                return grpDish;
            }) || []

        };
        return group;
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
                    groupedOrders.push({ group: self.convertGroupIdToGroupObject(eptGroup.grpId), orders: [] });
                    groupedOrderSums.push({ group: self.convertGroupIdToGroupObject(eptGroup.grpId), orderSums: [] });
                });
            }

            resolve({ groupedOrders: groupedOrders, groupedOrderSums: groupedOrderSums });
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        var groupedOrderSums = [];
        //console.log('groups',db.GROUP);

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            for (var _iterator7 = groupedOrders[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var _step7$value = _step7.value;
                var group = _step7$value.group;
                var orders = _step7$value.orders;

                var orderSums = [];

                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    var _loop3 = function _loop3() {
                        var _step8$value = _step8.value;
                        var ordId = _step8$value.ordId;
                        var group = _step8$value.group;
                        var usrId = _step8$value.usrId;
                        var dish = _step8$value.dish;
                        var ordNum = _step8$value.ordNum;

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

                    for (var _iterator8 = orders[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        _loop3();
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

                groupedOrderSums.push({ group: group, orderSums: orderSums });
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

        callback(groupedOrderSums);
    };
};
module.exports = new Server();
//console.log( new Date());
//# sourceMappingURL=server.js.map
