/**
 * Created by User on 2016/3/24.
 */
var express = require('express');
var bodyParser = require('body-parser');

var app = express();


var USER = [
    {
        usrId: 1,
        usrName: 'a',
        usrPwd: '123',
        usrCreateTime: '16/03/24/00:33:22',
        usrMobi: '09123456',
    }

]

var GROUP = [
    {
        grpId: "2",
        grpHostId: 'b',
        metId: '999',
        grpAddr: 'road',
        grpTime:"13:33",

    }

]

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

]

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


app.post('/user', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;
        console.log(JSON.stringify(req.body))
        addUser(res,  usrName, usrPwd);

    }
);


app.post('/userAuth', function (req, res) {
        var usrName = req.body.usrName;
        var usrPwd = req.body.usrPwd;

        console.log(JSON.stringify(req.body))

        userAuth(res  , usrName, usrPwd);

    }
);

app.get('/allGroup', function (req, res) {
    // Pass to next layer of middleware
    getUser(res);
});

app.get('/allMerchant', function (req, res) {
    // Pass to next layer of middleware
    getStore(res);
});

app.get('/merchantById/:id', function (req, res) {
    // Pass to next layer of middleware
    getMerchantById(res);
});

app.post('/group', function (req, res) {
        var grpHostId = req.body.grpHostId;
        var dishes = req.body.dishes;
        var metId = req.body.metId;
        var addr = req.body.addr;
        var gorTime = req.body.gorTime;
        var minAmount = req.body.minAmount;


        console.log(JSON.stringify(req.body))

        group(res , grpHostId,dishes, metId,addr,gorTime,minAmount);

    }
);

app.post('/joinGroup', function (req, res) {
        var usrId = req.body.grpHostId;
        var dishes = req.body.dishes;
        var grpId = req.body.grpId;


        console.log(JSON.stringify(req.body))

        joinGroup(res ,grpHostId,dishes, grpId);

    }
);

app.listen(3000, function () {
    console.log('' +
        'app listening on port 3000!');
});


var userAutht = [
    {id: 0, status: 0, content: 'success'},
    {id: 1, status: 1, content: 'fail'}
];


function addUser(res, id, content, status) {
    db.addUser(id, content, status, function (err) {
        if (err) {
            res.json({success: 0});
        }
        else {
            res.json({success: 1});
        }

    });
}


function userAuth(res, usrName, usrPwd) {
    var isSuccess = false;
    for (var index in USER) {
        if (USER[index].usrName == usrName && USER[index].usrPwd == usrPwd) {  //判斷是有抓到 usrName    usrPwd
            res.json({success: 1});
            return;
         }
    }

    if (!isSuccess) {               //如果傳成功會顯示0
        res.json({success: 0});
    }
}


function getUser(res){
    console.log("success!!!!!!!!!");
    return ;
}


function getStore(res){
    console.log("success???????????");
    return ;
}


function getMerchantById(res){
    console.log("getMerchantById!");
    return ;
}

function group(res){
    var isSuccess1 = false;
    for (var index in group1 ) {
        if (group1[index].grpHostId == grpHostId && group1[index].dishes == dishes && group1[index].metId == metId && group1[index].addr == addr && group1[index].gorTime == gorTime && group1[index].minAmount == minAmount) {
            res.json({success: 1});
        }
    }

    if (!isSuccess1) {               //如果傳成功會顯示0
        res.json({success: 0});
    }
}

function joinGroup(res){
    console.log("joinGroup!");
    return ;
}