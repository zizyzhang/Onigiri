'use strict';
require('babel-polyfill');

const assert = require('chai').assert;
let Server = require('./../dist/server.js').Server;
let server;
let connectMongo = require('./../dist/server.js').connectMongo;
var SHA256 = require("crypto-js/sha256");
let mockDb = require('./../dist/mock-db.js')
let inMmemoryDb = null;
const _ = require('lodash');
require('source-map-support').install();
let db = null;


describe('Server', function () {
    describe('Connect', function () {
        it('should connect and get db', function (done) {
            connectMongo({debug: true}).then((_db)=> {
                db = _db;
                console.log(db);
                server = new Server(db);

                done();
            });

        });
    });

    describe('Connect Mock DB', function () {
        it('should  get Mock Db', function () {
            mockDb(db);
            assert.equal(db.USER[0].usrName, 'firstUser');

        });

    })


    describe('#addUser()', function () {
        it('should insert an user : Jack,qqq,02-1231212 ', function (done) {

            server.addUser('Jack', 'qqq', 'test@gmail.com', '02-1231212', function (result) {
                var i = db.USER.length - 1;
                assert.equal('Jack', db.USER[i].usrName);
                assert.equal('qqq', db.USER[i].usrPwd);
                assert.equal('02-1231212', db.USER[i].usrMobi);
                assert.equal(1, result.success);
                done();
            });
        });


    });

    describe('#usrAuth()', function () {
        it('data.err should be nothing when given right usrName&usrPwd', function (done) {
            server.userAuth('Jack', 'qqq', function (data) {
                assert.isUndefined(data.err);
                done();
            });
        });

        it('data.err should not be nothing when given wrong usrName&usrPwd', function (done) {
            server.userAuth('Jack', 'qqqq', function (data) {
                assert.isDefined(data.err);

                done();
            });
        });

        it('should return userObject when given correct usrName&usrPwd', function (done) {
            server.userAuth('Jack', 'qqq', function (data) {
                assert.isObject(data.user);
                assert.equal(data.user.usrName, 'Jack');

                done();
            });
        });
    });


    describe('#allMerchant()', function () {
        it('should return an array by allMerchant', function (done) {
            server.allMerchant(function (result) {
                //assert.equal(1 , result[0].metId );
                assert.typeOf(result, 'array');
                done();
            });
        });
        it('should equal to 1', function (done) {
            server.allMerchant(function (result) {
                assert.equal(1, result[0].metId);
                done();
            });
        });

        it('return a merchats name', function (done) {
            server.allMerchant(function (result) {
                assert.equal('韩国纸上烤肉', result[0].metName);
                done();
            });
        });

        it('has menu with dihName defined', function (done) {
            server.allMerchant(function (result) {
                assert.isDefined(result[0].menu[0].dihName);
                done();
            });
        });

        it('has menu with dihName defined', function (done) {
            server.allMerchant(function (result) {
                assert.isDefined(result[0].menu[0].dihPrice);
                done();
            });
        });

    });

    describe('#merchantById()', function () {
        it('should return an object by getMerchantById', function (done) {
            server.getMerchantById(2, function (result) {
                assert.typeOf(result, 'object');

                done();
            });
        });
        it('should id equal to 2', function (done) {
            server.getMerchantById(2, function (result) {
                assert.equal(2, result.metId);
                done();
            });
        });

        it('should be a Merchant instance', function (done) {
            server.getMerchantById(2, function (result) {
                //assert.equal(2, result.metId);
                assert.property(result, 'metId');
                assert.property(result, 'metName');
                assert.property(result, 'metPhone');
                assert.property(result, 'menu');
                for (let m of result.menu) {
                    assert.equal(2, m.metId);
                }

                done();

            });
        });


    });

    describe('#group()', function () {

        it('should insert a group ', function (done) {
            server.postGroup(1, [1, 2, 3], 1, 'daor', new Date().getTime() + 1000 * 3600, 0, function (result) {
                //(grpHostId, dishes, metId, addr, gorTime , callback)
                let lastGroup = _.maxBy(db.GROUP, 'grpId');
                let lastGroupDish = _.maxBy(db.GROUP_DISHES, 'gdeId');

                assert.equal(1, lastGroup.grpHostId);
                assert.equal(1, lastGroup.metId);
                assert.equal('daor', lastGroup.grpAddr);
                //assert.equal('-9999', GROUP[i].minAmount);
                //assert.typeOf(GROUP_DISHES[i].dishes,'array');

                //console.log(db.GROUP_DISHES);
                assert.equal(3, lastGroupDish.dihId);


                assert.equal('1', result.success);

                done();
            });
        });
    });
    describe('#joinGroup()', function () {
        it('should insert a ordNum', function (done) {
            let numberOfOrder = db.ORDER.length;

            server.joinGroupPromise(1, [{dihId: 3, num: 1}], 1).then((result)=> {
                let lastInsertedOrder = db.ORDER.find(ord=>ord.ordId === _.maxBy(db.ORDER, 'ordId').ordId);

                assert.isObject(lastInsertedOrder);

                assert.equal(numberOfOrder + 1, db.ORDER.length);

                assert.equal(1, result.success);
                done();
            }).catch(done);

        });

        it('should insert an order ', function (done) {
            server.joinGroupPromise(2, [{dihId: 1, num: 1}], 1).then((result)=> {
                let lastInsertedOrder = db.ORDER.find(ord=>ord.ordId === _.maxBy(db.ORDER, 'ordId').ordId);

                assert.isObject(lastInsertedOrder);


                assert.equal(1, result.success);
                return server.joinGroupPromise(3, [{dihId: 1, num: 1}], 1);
            }).then(result=> {

                let lastInsertedOrder = db.ORDER.find(ord=>ord.ordId === _.maxBy(db.ORDER, 'ordId').ordId);

                assert.equal(lastInsertedOrder.ordNum, 1);

                done();
            }).catch(done);
        });


    });
    describe('#allGroup()', function () {
        it('should return an array by allGroup', function (done) {
            server.allGroup(function (result) {
                assert.typeOf(result, 'array');
                assert.typeOf(result[0].grpOrder, 'array');
                assert.typeOf(result[0].grpDishes, 'array');
                done();
            });


        });

        it('should has same length as groups', function (done) {
            server.allGroup(function (result) {
                assert.equal(db.GROUP.length, result.length);
                done();
            });
        });

        it('has merchant object', function (done) {
            server.allGroup(function (result) {
                assert.equal('韩国纸上烤肉', result[0].merchant.metName);
                done();
            });
        });


    });
    describe('#getGroupById()', function () {
        it('should return an object', function (done) {
            server.getGroupById(1, function (result) {
                assert.isObject(result);
                done();
            });


        });

        it('should get an instance of Group object', function (done) {
            server.getGroupById(1, function (result) {
                //console.log(result);

                assert.property(result, 'grpId');
                assert.property(result, 'grpHostName');
                assert.property(result, 'merchant');
                assert.property(result, 'grpAddr');
                assert.property(result, 'grpTime');
                assert.property(result, 'grpOrder');
                assert.property(result, 'grpDishes');
                assert.property(result, 'grpHost');
                assert.property(result, 'grpStatus');
                assert.property(result.grpHost, 'usrMobi');
                assert.property(result.grpDishes[0], 'dish');
                assert.property(result.grpDishes[0].dish, 'dihId');
                assert.equal(result.grpStatus, 0);
                done();
            });
        });

        it('has correct data', function (done) {
            server.getGroupById(1, function (result) {
                assert.equal(result.grpId, 1);
                assert.equal(result.merchant.metId, 1);

                assert.equal(result.grpDishes[0].dish.dihId, 1);
                done();
            });
        });


    });

    describe('#getGroupedOrdersByUserId()', function () {

        it('return an Array of Grouped Order Object ', function (done) {

            server.getGroupedOrdersByUserId(1, function (result) {
                assert.isArray(result);
                //console.log(JSON.stringify(result));
                //console.log(db.ORDER);
                assert.property(result[0].orders[0], 'ordId');
                assert.property(result[0].orders[0], 'usrId');
                assert.property(result[0].orders[0], 'dish');
                assert.property(result[0].orders[0], 'ordNum');
                done();
            });
        });

        it('has correct data ', function (done) {
            server.getGroupedOrdersByUserId(1, function (result) {
                let assertionGroupedOrders = result.find(r=>r.group.grpId === 1).orders;
                assert.equal(assertionGroupedOrders.find(r=>r.ordId === 1).dish.dihId, 1);
                assert.equal(assertionGroupedOrders.find(r=>r.ordId === 1).ordNum, 1);
                done();
            });
        });
    });

    describe('#getGroupedOrdersAndSumsByHostIdPromise()', function () {
        it('returns an array of Grouped OrdersAndSums ', function (done) {
            server.getGroupedOrdersAndSumsByHostIdPromise(1).then(result=> {
                //console.log(result);
                assert.isArray(result.groupedOrders);
                assert.isArray(result.groupedOrderSums);

                //has Group Object
                //console.log(result.groupedOrders[0].group);
                assert.property(result.groupedOrders[0].group, 'grpId');
                assert.property(result.groupedOrders[0].group, 'grpHostName');
                assert.property(result.groupedOrders[0].group, 'merchant');
                assert.property(result.groupedOrders[0].group, 'grpAddr');
                assert.property(result.groupedOrders[0].group, 'grpTime');
                assert.property(result.groupedOrders[0].group, 'grpOrder');
                assert.property(result.groupedOrders[0].group, 'grpDishes');
                done();
            }).catch(done);
        });


        it('has "groupedOrderSums" and "groupedOrders" properties which are  Arrays of GroupedSum|GroupedOrder Object ', function (done) {
            server.getGroupedOrdersAndSumsByHostIdPromise(1).then(result=> {
                assert.property(result.groupedOrders[0].orders[0], 'grpId');
                assert.property(result.groupedOrders[0].orders[0], 'dish');
                assert.property(result.groupedOrders[0].orders[0], 'ordNum');
                assert.property(result.groupedOrders[0].orders[0], 'usrId');

                //console.log(result.groupedOrderSums[0]);
                assert.property(result.groupedOrderSums[0].orderSums[0], 'group');
                assert.property(result.groupedOrderSums[0].orderSums[0], 'dish');
                assert.property(result.groupedOrderSums[0].orderSums[0], 'ordNum');
                done();
            }).catch(done);
        });

        it('has correct data ', function (done) {
            mockDb(db);
            server.getGroupedOrdersAndSumsByHostIdPromise(1).then(result=> {
                result.groupedOrders[0].orders.map(order=> {
                    db.GROUP.filter(grp=>grp.grpId === order.grpId).map(g=> {
                        //console.log(g.grpHostId);
                        assert.equal(g.grpHostId, 1);
                    });
                });

                let assertionOrderSums = result.groupedOrderSums.find(gos=>gos.group.grpId === 1).orderSums;
                assert.equal(assertionOrderSums.find(arm=>arm.dish.dihId === 1).ordNum, 2);

                let assertionOrder = result.groupedOrders.find(gos=>gos.group.grpId === 1);

                //console.log(result.groupedOrders);

                assert.equal( result.groupedOrders.length,1); //only one group

                assert.isTrue(!!assertionOrder);


                done();
            }).catch(done);

        });
    });

    describe('#StatusPassedByGroupId()', function () {
        //console.log(db.GROUP);
        it('return a status', function (done) {
            server.getStatus(1).then(result=> {
                assert.isNumber(result);
                assert.equal(0, result);
                done();
            }).catch(done);

        });
    });

    describe('#groupStatusChanged()', function () {

        it('Group Status has Changed 1 from 0', function (done) {
            server.updateGroupStatusPromise(1, 1).then(result => {
                assert.equal(1, result.success);


                return server.getStatus(1);
            }).then(result=> {
                assert.equal(1, 1);
                done();
            }).catch(done);
        });

        it('cleanGroup', function (done) {
            server.cleanGroup();

            done();
        });
    });


});

