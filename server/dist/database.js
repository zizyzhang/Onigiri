'use strict';
///**
// * Created by User on 2016/3/24.
// */

var MongoClient = require('mongodb').MongoClient;
var assert = require('chai').assert;

// Connection URL
var url = 'mongodb://localhost:27017/test_db';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
    console.log("Connected successfully to server");

    //db.collection('test_db').insertOne({b:1}).then(()=>{
    //    console.log('added');
    //});
    db.collection('test_db').find({}).toArray().then(function (r) {
        return console.log(r);
    });
    db.close();
});
//# sourceMappingURL=database.js.map
