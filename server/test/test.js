'use strict';

const assert = require('chai').assert;
const server = require('./../dist/server');
const db = require('../dist/mock-db');
const _ = require('lodash');
require('source-map-support').install();

describe('Server', function () {
    describe('#addUser()', function () {
        it('should insert an user : Jack,qqq,02-1231212 ', function (done) {
            server.addUser('Jack', 'qqq', '02-1231212', function (result) {
                var i = db.USER.length - 1;
                assert.equal('Jack', db.USER[i].usrName);
                assert.equal('qqq', db.USER[i].usrPwd);
                assert.equal('02-1231212', db.USER[i].usrMobi);
                assert.equal(1, result.success);
                done();
            });
        });
        it('should ', function (done) {
            server.addUser('', '', '', function (result) {
                assert.equal(0, result.success);
                done();
            });
        });

    });

    describe('#usrAuth()', function () {
        it('should return 1 when given right usrName&usrPwd', function (done) {
            server.userAuth('firstUser', '123', function (data) {
                assert.equal(1, data.success);
                done();
            });
        });

        it('should return 0 when given wrong usrName&usrPwd', function (done) {
            server.userAuth('ab', '123', function (data) {
                assert.equal(0, data.success);
                done();
            });
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
            server.group(1, [3, 5, 7, 9], 1, 'daor', '00:00', function (result) {
                //(grpHostId, dishes, metId, addr, gorTime , callback)
                let lastGroup = _.maxBy(db.GROUP, 'grpId');
                let lastGroupDish = _.maxBy(db.GROUP_DISHES, 'gdeId');

                assert.equal(1, lastGroup.grpHostId);
                assert.equal(1, lastGroup.metId);
                assert.equal('daor', lastGroup.grpAddr);
                assert.equal('00:00', lastGroup.grpTime);
                //assert.equal('-9999', GROUP[i].minAmount);
                //assert.typeOf(GROUP_DISHES[i].dishes,'array');

                //console.log(db.GROUP_DISHES);
                assert.equal(9, lastGroupDish.dihId);


                assert.equal('1', result.success);

                done();
            });
        });
    });

    describe('#joinGroup()', function () {
        let numberOfGroupOrder = db.GROUP_ORDER.length;

        it('should insert a gorNum', function (done) {
            server.joinGroupPromise(1, [{dihId: 0, num: 1}, {dihId: 1, num: 1}], 2).then((result)=> {

                assert.equal(2, db.GROUP_ORDER[2].grpId);
                assert.equal(0, db.GROUP_ORDER[2].dihId);
                assert.equal(1, db.GROUP_ORDER[2].gorNum);

                assert.equal(2, db.GROUP_ORDER[3].grpId);
                assert.equal(1, db.GROUP_ORDER[3].dihId);
                assert.equal(1, db.GROUP_ORDER[3].gorNum);

                assert.equal(3, db.GROUP_MEMBER[2].gmrId);//自動編號ID
                assert.equal(1, db.GROUP_MEMBER[2].usrId);
                assert.equal(2, db.GROUP_MEMBER[2].grpId);


                assert.equal(numberOfGroupOrder + 2, db.GROUP_ORDER.length);

                assert.equal(1, result.success);
                numberOfGroupOrder = db.GROUP_ORDER.length;
                return server.joinGroupPromise(2, [{dihId: 0, num: 1}, {dihId: 1, num: 1}], 2);
            }).then(result=> {
                assert.equal(numberOfGroupOrder, db.GROUP_ORDER.length);
                done();
            }).catch(done);


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
                assert.property(result, 'grpId');
                assert.property(result, 'grpHostName');
                assert.property(result, 'merchant');
                assert.property(result, 'grpAddr');
                assert.property(result, 'grpTime');
                assert.property(result, 'grpOrder');
                assert.property(result, 'grpDishes');
                done();
            });
        });

        it('has correct data', function (done) {
            server.getGroupById(1, function (result) {
                assert.equal(result.grpId, 1);
                assert.equal(result.merchant.metId, 1);

                done();
            });
        });


    });
});
