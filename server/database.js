/**
 * Created by User on 2016/3/24.
 */
var util = require('util');

var sqlite3 = require("sqlite3").verbose();

var db = undefined;

exports.connect = function (callback) {
    //連接資料庫"./db/simpleTodo.sqlite"
    db = new sqlite3.Database("./db/Onigiri.sqlite", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function (err) {
            if (err) {
                util.log('FAIL on connect database ' + err);
                callback(err);
            } else {
                callback(null);
                console.log('connect to onigiri.sqlite success');
                //callback(null);
                //loadMemoryCache();
            }
        });
};