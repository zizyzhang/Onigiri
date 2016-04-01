var assert = require('chai').assert;
var server = require('./../server');

var USER = require('../mock-db').USER;
var GROUP = require('../mock-db').GROUP;
var MERCHANT = require('../mock-db').MERCHANT;
var GROUP_ORDER = require('../mock-db').GROUP_ORDER;
var GROUP_MEMBER = require('../mock-db').GROUP_MEMBER;
var GROUP_DISHES = require('../mock-db').GROUP_DISHES;


describe('Server', function () {
    describe('#addUser()', function () {
        it('should insert an user : Jack,qqq,02-1231212 ', function (done) {
            server.addUser('Jack', 'qqq', '02-1231212', function (result) {
                var i = USER.length - 1;
                assert.equal('Jack', USER[i].usrName);
                assert.equal('qqq', USER[i].usrPwd);
                assert.equal('02-1231212', USER[i].usrMobi);
                done();
            })
        });

    });

    describe('#usrAuth()', function () {
        it('should return 1 when given right usrName&usrPwd', function (done) {
            server.userAuth('a', '123', function (data) {
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
                done();
            })
        });

    });

    describe('#allMerchant()', function () {
        it('should return an array by allMerchant', function (done) {
            server.allMerchant(function (result) {
                //assert.equal(1 , result[0].metId );
                assert.typeOf(result, 'array');
                done();
            })
        });
        it('should equal to 1', function (done) {
            server.allMerchant(function (result) {
                assert.equal(1, result[0].metId);
                done();
            })
        });

    });

    describe('#merchantById()', function () {
        it('should return an object by merchantById', function (done) {
            server.merchantById(2, function (result) {
                assert.typeOf(result, 'object');
                done();
            })
        });
        it('should id equal to 2', function (done) {
            server.merchantById(2, function (result) {
                assert.equal(2, result.metId);
                done();
            })
        });


    });

    describe('#group()', function () {
        it('should insert a group ', function (done) {
            server.group('c', [3, 5, 7, 9], '1000', 'daor', '00:00', function (result) {
                //(grpHostId, dishes, metId, addr, gorTime , callback)
                var i = GROUP.length - 1;
                assert.equal('c', GROUP[i].grpHostId);
                assert.equal('1000', GROUP[i].metId);
                assert.equal('daor', GROUP[i].grpAddr);
                assert.equal('00:00', GROUP[i].grpTime);
                //assert.equal('-9999', GROUP[i].minAmount);
                //assert.typeOf(GROUP_DISHES[i].dishes,'array');

                assert.equal('1', GROUP_DISHES[0].gdeId);
                assert.equal('3', GROUP_DISHES[0].dihId);
                assert.equal('2', GROUP_DISHES[0].grpId);

                assert.equal('1', result.success);

                done();
            })
        });
    });
    describe('#joinGroup()', function () {
        it('should insert a gorNum', function (done) {
            server.joinGroup(1, [{dihId: 0, gorNum: 1}, {dihId: 1, gorNum: 1}], '1', function (result) {
                assert.equal(1, GROUP_ORDER[0].grpId);
                assert.equal(0, GROUP_ORDER[0].dihId);
                assert.equal(1, GROUP_ORDER[0].gorNum);

                assert.equal(1, GROUP_ORDER[1].grpId);
                assert.equal(1, GROUP_ORDER[1].dihId);
                assert.equal(1, GROUP_ORDER[1].gorNum);

                assert.equal(1, GROUP_MEMBER[0].gmrId);
                assert.equal(1, GROUP_MEMBER[0].usrId);
                assert.equal('1', GROUP_MEMBER[0].grpId);

                assert.equal('1', result.success);
                done();
            });

        })


    });


});
