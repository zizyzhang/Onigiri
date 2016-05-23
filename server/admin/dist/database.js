///**
// * Created by User on 2016/3/24.
// */
//var util = require('util');
//
//var sqlite3 = require("sqlite3").verbose();
//
//var db = undefined;
//
//exports.connect = function (callback) {
//    //�s����Ʈw"./db/simpleTodo.sqlite"
//    db = new sqlite3.Database("./db/Onigiri.sqlite", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
//        function (err) {
//            if (err) {
//                util.log('FAIL on connect database ' + err);
//                callback(err);
//            } else {
//                callback(null);
//                console.log('connect to onigiri.sqlite success');
//                //callback(null);
//                //loadMemoryCache();
//            }
//        });
//};
//
//exports.addUser = function (id, usrName, usrPwd, usrMobi, calback) {
//    //新增使用者
//    var usrCreateTime;
//
//
//};
//
//exports.userAuth = function (usrName, usrPwd, calback) {
//    //使用者登入
//};
//
//exports.allGroup = function (calback) {
//    //取得所有團購資訊
//
//};
//
//exports.allMerchant = function (calback) {
//    //取得所有店家資訊
//
//};
//
//exports.getMerchantById = function (id, calback) {
//    //用ID尋找指定店家
//
//};
//
//exports.group = function (grpHostId, dishes, metId, addr, gorTime, minAmount, calback) {
//    //創建團
//
//};
//
//exports.joinGroup = function (grpHostId, dishes, grpId, calback) {
//    //加入團
//
//};
"use strict";
//# sourceMappingURL=database.js.map
