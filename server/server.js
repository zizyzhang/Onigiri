/**
 * Created by User on 2016/3/24.
 */
var Server = function () {

    var express = require('express');
    var bodyParser = require('body-parser');
//var db = require('/batabase.js');

    var app = express();

    var USERS = require('./mock-db').USER;
    var ORDERS = require('./mock-db').ORDER;
    var MERCHANTS = require('./mock-db').MERCHANT;
    var DISHES = require('./mock-db').DISH;

    var GROUPS = require('./mock-db').GROUP;
    var GROUP_DISHES = require('./mock-db').GROUP_DISHES;
    var GROUP_MEMBER = require('./mock-db').GROUP_MEMBER;
    var GROUP_ORDER = require('./mock-db').GROUP_ORDER;


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

    app.get('/getMerchantById/:id', function (req, res) {
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
        var usrId = 0;
        for (var index in USERS) {
            if (USERS[index].usrId > usrId) {
                usrId = USERS[index].usrId;
            }
            usrId = Number(usrId) + 1;
        }

        var usrCreateTime = new Date();
        var newUser = {usrId: usrId, usrName: usrName, usrPwd: usrPwd, usrCreateTime: usrCreateTime, usrMobi: usrMobi};

        if (newUser.usrName.length != 0 || newUser.usrPwd.length != 0 || newUser.usrMobi.length != 0) {
            USERS.push(newUser);
            callback({success: 1});
            return;
        } else {
            callback({success: 0});
        }
    };


    this.userAuth = function (usrName, usrPwd, callback) {
        var isSuccess = false;
        for (var index in USERS) {
            if (USERS[index].usrName == usrName && USERS[index].usrPwd == usrPwd) {
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


        for (let group of GROUPS) {
            let grpId,
                grpHostName,
                merchant,
                grpAddr,
                grpTime,
                grpOrder = [],
                grpDishes = [];

            grpId = group.grpId;
            grpId = group.grpId;
            grpAddr = group.grpAddr;
            grpTime = group.grpTime;

            grpHostName = (USERS.find(user => user.usrId == group.grpHostId)).usrName;
            merchant = MERCHANTS.find(merchant => merchant.metId == group.metId);

            for (let grr of GROUP_ORDER) {
                 if (grr.grpId == group.grpId) grpOrder.push(grr);
            }

            for (let grh of GROUP_DISHES) {
                 if (grh.grpId == group.grpId) grpDishes.push(grh);
            }

            result.push({
                grpId,
                grpHostName,
                merchant,
                grpAddr,
                grpTime,
                grpOrder,
                grpDishes
            })

        }

        callback(result);

    };


    this.allMerchant = function (callback) {


        var allMerchantdata = [];
        var menu = [];

        for (var MIndex in MERCHANTS) {

            for (var DIndex in DISHES) {
                if (MERCHANTS[MIndex].metId == DISHES[DIndex].metId) {
                    menu.push({
                            dihName: DISHES[DIndex].dihName,
                            metId: DISHES[DIndex].metId,
                            dihType: DISHES[DIndex].dihType,
                            dihPrice: DISHES[DIndex].dihPrice
                        }
                    );
                }
            }


            allMerchantdata.push({
                metId: MERCHANTS[MIndex].metId,
                metName: MERCHANTS[MIndex].metName,
                metPhone: MERCHANTS[MIndex].metPhone,
                menu: menu
            });
            menu = [];
        }

        //console.log(JSON.stringify(allMerchantdata));

        if (allMerchantdata.length != 0) {
            callback(allMerchantdata);
            return;
        }
        else {
            callback({success: 0});
        }
    };


    this.getMerchantById = function (id, callback) {
        var isSuccess = false;
        for (var index in MERCHANTS) {
            if (MERCHANTS[index].metId == id) {
                callback(MERCHANTS[index]);
                return;
            }
        }

        if (!isSuccess) {
            callback({success: 0});
        }


    };

    this.group = function (grpHostId, dishes, metId, addr, gorTime, callback) {

        var i = GROUPS.length ;
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
            var gdeId = GROUP_DISHES.length ;
            var grpId = i;
            var dishesList = {gdeId: gdeId, dihId: dishes[index], grpId: grpId};
            //console.log("dishesList:"+JSON.stringify(dishesList));
            GROUP_DISHES.push(dishesList);
        }

        if (newGroup != 0) {

            GROUPS.push(newGroup);


            //console.log(USER);
            //callback(GROUP);
            callback({success: 1});
        }
        else {
            callback({success: 0});

        }
    };

    this.joinGroup = function (usrId, dishes, grpId, callback) {

        var newGroupOrder = {};
        var dihId;
        var gorNum;
        var num;

        if (GROUP_ORDER.length == 0) {
            for (var index in dishes) {
                dihId = dishes[index].dihId;
                num = dishes[index].num;
                newGroupOrder = {grpId: grpId, dihId: dihId, gorNum: num};
                GROUP_ORDER.push(newGroupOrder);
                //資料表沒有資料，直接新增
            }
        } else {
            for (var index in GROUP_ORDER) {
                for (var index in dishes) {
                    dihId = dishes[index].dihId;
                    num = dishes[index].num;

                    if (grpId == GROUP_ORDER[index].grpId && dihId == GROUP_ORDER[index].dihId) {
                        GROUP_ORDER[index].gorNum = parseInt(GROUP_ORDER[index].gorNum) + num;//直接改值
                        //尋找相同的<團號>及<商品ID>，有則Updata
                    }
                    else {
                        newGroupOrder = {grpId: grpId, dihId: dihId, gorNum: num};
                        GROUP_ORDER.push(newGroupOrder);
                        //無，新增
                    }
                }
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

        if (newGroupMember != 0) {
            GROUP_MEMBER.push(newGroupMember);
            callback({success: 1});

        } else {
            callback({success: 0});
        }

    };


};
module.exports = new Server();
//console.log( new Date());