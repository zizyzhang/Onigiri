/**
 * Created by User on 2016/3/24.
 */

var Server = function () {

    //let a = 0;
    var express = require('express');
    var bodyParser = require('body-parser');
//var db = require('/batabase.js');

    var app = express();

    var USER = require('./mock-db').USER;
    var GROUP = require('./mock-db').GROUP;
    var MERCHANT = require('./mock-db').MERCHANT;
    var GROUP_DISHES = require('./mock-db').GROUP_DISHES;


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

    app.get('/allMerchant', function (req, res) {
        // Pass to next layer of middleware
        allMerchant(function (result) {
            res.json(result);
        });
    });

    app.get('/merchantById/:id', function (req, res) {
        // Pass to next layer of middleware
        merchantById(req.params.id, function (result) {
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

            group(grpHostId, dishes, metId, addr, gorTime, minAmount, function (result) {

            });

        }
    );

    app.post('/joinGroup', function (req, res) {
            var usrId = req.body.grpHostId;
            var dishes = req.body.dishes;
            var grpId = req.body.grpId;


            console.log(JSON.stringify(req.body));

            joinGroup(usrId, dishes, grpId, function (result) {

            });

        }
    );

    app.listen(3000, function () {
        console.log('' +
            'app listening on port 3000!');
    });


    this.addUser = function (usrName, usrPwd, usrMobi, callback) {
        var isSuccess = false;
        var usrId = 0;
        for (var index in USER) {
            if (USER[index].usrId > usrId) {
                usrId = USER[index].usrId;
            }
            usrId = Number(usrId) + 1;
        }

        //usrId=Number(usrId)+1;
        //console.log(usrId);

        var usrCreateTime = new Date();
        var newUser = {usrId: usrId, usrName: usrName, usrPwd: usrPwd, usrCreateTime: usrCreateTime, usrMobi: usrMobi};
        //console.log(newUser);

        //USER.concat(newUser);
        USER.push(newUser);
        //console.log(USER);

        callback({success: 1});


        //if (!isSuccess) {
        //    callback({success: 0});
        //}
    };


    this.userAuth = function (usrName, usrPwd, callback) {
        var isSuccess = false;
        for (var index in USER) {
            if (USER[index].usrName == usrName && USER[index].usrPwd == usrPwd) {
                callback({success: 1});
                return;
            }
        }

        if (!isSuccess) {
            callback({success: 0});
        }
    };


    this.allGroup = function (callback) {

        callback(GROUP);
        return;
    };


    this.allMerchant = function (callback) {

        callback(MERCHANT);
        return;
    };


    this.merchantById = function (id, callback) {
        //console.log("getMerchantById!");
        var isSuccess = false;
        for (var index in MERCHANT) {
            if (MERCHANT[index].metId == id) {
                callback(MERCHANT);
                return;
            }
        }

        if (!isSuccess) {
            callback({success: 0});
        }


    };

    this.group = function (grpHostId, dishes, metId, addr, gorTime, minAmount, callback) {
        var isSuccess = true;


        if (isSuccess) {
            var i = GROUP.length + 1;
            var newGroup = {
                grpId: i,
                grpHostId: grpHostId,
                //dishes: dishes,
                metId: metId,
                grpAddr: addr,
                grpTime: gorTime,
                minAmount: minAmount
            };

            for (var index in dishes) {
                var gdeId = GROUP_DISHES.length + 1;
                var grpId = i;
                var dishesList = {gdeId: gdeId, dihId: dishes[index], grpId: grpId};
                GROUP_DISHES.push(dishesList);
            }

            GROUP.push(newGroup);
            //console.log(USER);
            //callback(GROUP);
            callback({success: 1});
        }
        else {
            callback({success: 0});

        }
    };

    this.joinGroup = function (usrId, dishes, grpId, callback) {
        var isSuccess = true;


        if (isSuccess) {

            var newGroupOrder = {};
            var dihId = dishes.dishId;
            var gorNum = dishes.num;
            for (var index in GROUP_ORDER) {
                if (grpId == GROUP_ORDER[index].grpId && dihId == GROUP_ORDER[index].dihId) {
                    GROUP_ORDER[index].gorNum = parseInt(GROUP_ORDER[index].gorNum) + gorNum;
                }
                else {
                    newGroupOrder = {grpId: grpId, dihId: dihId, gorNum: gorNum};
                    GROUP_ORDER.push(newGroupOrder);
                }
            }

            var gmrId = GROUP_MEMBER.length + 1;
            var newGroupMember = {
                //grpHostId: grpHostId,
                //dishes: dishes,
                gmrId: gmrId,
                usrId: usrId,
                grpId: grpId
            };

            GROUP_MEMBER.push(newGroupMember);

            callback({success: 1});

        } else {
            callback({success: 0});

        }

    };


};
module.exports = new Server();

