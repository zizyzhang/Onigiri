'use strict'
var assert = require('chai').assert;
var server = require('./../dist/server');
let db = require('../dist/mock-db');


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
            })
        });
        it('should ', function (done) {
            server.addUser('', '', '', function (result) {
                assert.equal(0, result.success);
                done();
            })
        });

    });

    describe('#usrAuth()', function () {
        it('should return 1 when given right usrName&usrPwd', function (done) {
            server.userAuth('firstUser', '123', function (data) {
                assert.equal(1, data.success);
                done();
            })
        });

        it('should return 0 when given wrong usrName&usrPwd', function (done) {
            server.userAuth('ab', '123', function (data) {
                assert.equal(0, data.success);
                done();
            })
        });
    });

    describe('#allGroup()', function () {
        it('should return an array by allGroup', function (done) {
            server.allGroup(function (result) {
                assert.typeOf(result, 'array');
                assert.typeOf(result[0].grpOrder, 'array');
                assert.typeOf(result[0].grpDishes, 'array');
                done();
            })


        });

        it('should has same length as groups', function (done) {
            server.allGroup(function (result) {
                assert.equal(db.GROUP.length, result.length);
                done();
            })
        });

        it('has merchant object', function (done) {
            server.allGroup(function (result) {
                assert.equal('a', result[0].merchant.metName);
                done();
            })
        });


    });

    describe('#allMerchant()', function () {
        it('should return an array by allMerchant', function (done) {
            server.allMerchant(function (result) {
                //assert.equal(1 , result[0].metId );
                assert.typeOf(result, 'array');
                //console.log(JSON.stringify(result));
                done();
            })
        });
        it('should equal to 1', function (done) {
            server.allMerchant(function (result) {
                assert.equal(1, result[0].metId);
                done();
            })
        });

        it('return a merchats name', function (done) {
            server.allMerchant(function (result) {
                assert.equal('a', result[0].metName);
                done();
            })
        });

        it('has menu with dihName defined', function (done) {
            server.allMerchant(function (result) {
                assert.isDefined(result[0].menu[0].dihName);
                done();
            })
        });

        it('has menu with dihName defined', function (done) {
            server.allMerchant(function (result) {
                assert.isDefined(result[0].menu[0].dihPrice);
                done();
            })
        });

    });

    describe('#merchantById()', function () {
        it('should return an object by getMerchantById', function (done) {
            server.getMerchantById(2, function (result) {
                assert.typeOf(result, 'object');
                done();
            })
        });
        it('should id equal to 2', function (done) {
            server.getMerchantById(2, function (result) {
                assert.equal(2, result.metId);
                done();
            })
        });


    });

    describe('#group()', function () {

        it('should insert a group ', function (done) {

            server.group('1', [3, 5, 7, 9], '1', 'daor', '00:00', function (result) {
                //(grpHostId, dishes, metId, addr, gorTime , callback)

                assert.equal('1', db.GROUP[db.GROUP.length-1].grpHostId);
                assert.equal('1', db.GROUP[db.GROUP.length-1].metId);
                assert.equal('daor', db.GROUP[db.GROUP.length-1].grpAddr);
                assert.equal('00:00', db.GROUP[db.GROUP.length-1].grpTime);
                //assert.equal('-9999', GROUP[i].minAmount);
                //assert.typeOf(GROUP_DISHES[i].dishes,'array');

                console.log(JSON.stringify(db.GROUP_DISHES[db.GROUP_DISHES.length-1]));
                assert.equal(db.GROUP_DISHES.length-1, db.GROUP_DISHES[db.GROUP_DISHES.length-1].gdeId);
                assert.equal(9, db.GROUP_DISHES[db.GROUP_DISHES.length-1].dihId);
                assert.equal(3, db.GROUP_DISHES[db.GROUP_DISHES.length-1-3].dihId);

                assert.equal(db.GROUP.length-1, db.GROUP_DISHES[db.GROUP.length-1].grpId);

                assert.equal('1', result.success);

                done();
            })
        });
    });
    describe('#joinGroup()', function () {
        it('should insert a gorNum', function (done) {
            server.joinGroup(1, [{dihId: 0, num: 1}, {dihId: 1, num: 1}], '1', function (result) {
                //(usrId, dishes, grpId, callback)
                assert.equal(1, db.GROUP_ORDER[2].grpId);
                assert.equal(0, db.GROUP_ORDER[2].dihId);
                assert.equal(1, db.GROUP_ORDER[2].gorNum);

                assert.equal(1, db.GROUP_ORDER[3].grpId);
                assert.equal(1, db.GROUP_ORDER[3].dihId);
                assert.equal(1, db.GROUP_ORDER[3].gorNum);

                assert.equal(3, db.GROUP_MEMBER[2].gmrId);//自動編號ID
                assert.equal(1, db.GROUP_MEMBER[2].usrId);
                assert.equal('1', db.GROUP_MEMBER[2].grpId);

                assert.equal('1', result.success);
                done();
            });

        })


    });


});
