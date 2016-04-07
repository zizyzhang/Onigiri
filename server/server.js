'use strict';

const _ = require('lodash');

/**
 * Created by User on 2016/3/24.
 */
var Server = function () {

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

    var joinGroup1 = [
        {
            usrId: 'd',
            dishes: '0.1',
            grpId: '6666'
        }

    ];


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


    app.post('/addUser', function (req, res) {
            var usrName = req.body.usrName;
            var usrPwd = req.body.usrPwd;
            var usrMobi = req.body.usrMobi;
            console.log(JSON.stringify(req.body));
            addUser(usrName, usrPwd, usrMobi, function (result) {

            });
        }
    );


    app.post('/userAuth', function (req, res) {
            var usrName = req.body.usrName;
            var usrPwd = req.body.usrPwd;

            console.log(JSON.stringify(req.body));

            self.userAuth(usrName, usrPwd, function (result) {
                res.json(result);
            });

        }
    );

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allGroup(function (result) {
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

        }
    );

    app.post('/joinGroup', function (req, res) {
            var usrId = req.body.grpHostId;
            var dishes = req.body.dishes;
            var grpId = req.body.grpId;


            console.log(JSON.stringify(req.body));

            this.joinGroupPromise(usrId, dishes, grpId).then(result=> {

            });

        }
    );

    app.listen(3000, function () {
        console.log('' +
            'app listening on port 3000!');
    });


    this.addUser = function (usrName, usrPwd, usrMobi, callback) {
        var usrId = 0;

        for (let user of db.USER) {
            if (user.usrId > usrId) {
                usrId = user.usrId;
            }
            usrId = Number(usrId) + 1;
        }


        var usrCreateTime = new Date();
        var newUser = {usrId: usrId, usrName: usrName, usrPwd: usrPwd, usrCreateTime: usrCreateTime, usrMobi: usrMobi};


        if (newUser.usrName.length !== 0 || newUser.usrPwd.length != 0 || newUser.usrMobi.length != 0) {
            db.USER.push(newUser);
            callback({success: 1});
            return;
        } else {
            callback({success: 0});
        }
    };


    this.userAuth = function (usrName, usrPwd, callback) {
        var isSuccess = false;
        for (var index in db.USER) {
            if (db.USER[index].usrName == usrName && db.USER[index].usrPwd == usrPwd) {
                callback({success: 1});
                return;
            }
        }

        if (!isSuccess) {
            callback({success: 0});
        }
    };


    this.allGroup = function (callback) {
        let result = [];
        for (let group of db.GROUP) {
            result.push({
                grpId: group.grpId,
                grpAddr: group.grpAddr,
                grpTime: group.grpTime,
                grpHostName: (db.USER.find(user => user.usrId == group.grpHostId)).usrName,
                merchant: db.MERCHANT.find(merchant => merchant.metId == group.metId),
                grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId == group.grpId),
                grpDishes: _.filter(db.GROUP_DISHES, grh => grh.grpId == group.grpId)
            });

        }
        callback(result);
    };

    this.getGroupById = function (id, callback) {
        let group = db.GROUP.find(g=>g.grpId === id);
        callback({
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: group.grpTime,
            grpHostName: (db.USER.find(user => user.usrId === group.grpHostId)).usrName,
            merchant: db.MERCHANT.find(merchant => merchant.metId === group.metId),
            grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId === group.grpId),
            grpDishes: _.filter(db.GROUP_DISHES, grh => grh.grpId === group.grpId)
        });
    };


    this.allMerchant = function (callback) {
        var result = [];
        for (let merchant of db.MERCHANT) {
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

    this.group = function (grpHostId, dishes, metId, addr, gorTime, callback) {
        let grpId = _.maxBy(db.GROUP, 'grpId').grpId + 1;
        db.GROUP.push({
            grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime
            //minAmount: minAmount
        });
        for (let dihId of dishes) {
            let gdh = {
                gdeId: _.maxBy(db.GROUP_DISHES, 'gdeId').gdeId + 1,
                dihId: dihId,
                grpId
            };
            db.GROUP_DISHES.push(gdh);
        }
        callback({success: 1});
    };

    this.joinGroupPromise = function (usrId, dishes, grpId) {
        return new Promise(resolve=> {

            for (let {dihId,num} of dishes) {
                let gor = db.GROUP_ORDER.find(gor=>gor.dihId === dihId && gor.grpId === grpId);
                if (gor) {
                    //如果找到了直接增加数字
                    gor.gorNum += num;
                } else {
                    //如果找不到就直接增加object
                    db.GROUP_ORDER.push({
                        gorId: _.maxBy(db.GROUP_ORDER, gor=>gor.gorId).gorId +1 ,
                        dihId,
                        gorNum: num,
                        grpId,

                    });
                }

            }

            db.GROUP_MEMBER.push({
                gmrId: _.maxBy(db.GROUP_MEMBER, gmr=>gmr.gmrId).gmrId + 1,
                usrId: usrId,
                grpId: grpId,
            });

            resolve({success: 1});
        });
    };


};
module.exports = new Server();
//console.log( new Date());