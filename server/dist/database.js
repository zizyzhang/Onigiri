'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function () {

    //option : {debug:如果为true,不会存储到mongodb}

    function Database(_mongoDb, option) {
        _classCallCheck(this, Database);

        Database.mongoDb = _mongoDb;
        Database.debug = !!option.debug;
    }

    _createClass(Database, [{
        key: 'pushToDb',
        value: function pushToDb(table, value) {

            //jsonDb.push('/db/' + table + '[]', value);
            console.log(Database.mongoDb);

            !Database.debug && Database.mongoDb.collection(table).insertOne(value).then(function (r) {
                value._id = r.insertedId;
                Database.db[table].push(value);
            });
        }
    }, {
        key: 'delFromJsonDb',
        value: function delFromJsonDb(table, condition) {
            var index = Database.db[table].findIndex(condition);
            Database.db[table].splice(index, 1);
            !Database.debug && Database.mongoDb.collection(table).deleteOne({ _id: Database.db[table]._id });

            //jsonDb.delete(`/Database.db/${table}[${index}]`);
        }
    }, {
        key: 'setValueToDb',
        value: function setValueToDb(table, condition, setKey, newValue) {
            var index = Database.db[table].findIndex(condition);
            var oldObj = Database.db[table][index][setKey] = newValue;
            var set = {};
            set[setKey] = newValue;
            !Database.debug && Database.mongoDb.collection(table).updateOne({ _id: Database.db[index]._id }, { $set: set }).catch(function (e) {
                return console.log(e);
            });

            //jsonDb.push('/db/' + table + `[${index}]`, oldObj);
            //    db[table].push(value);
        }
    }, {
        key: 'pushToDbPromise',
        value: function pushToDbPromise(table, value) {
            return new Promise(function (resolve, reject) {
                !Database.debug && Database.mongoDb.collection(table).insertOne(value).then(function (r) {
                    value._id = r.insertedId;
                    Database.db[table].push(value);
                    resolve();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }, {
        key: 'delFromJsonDbPromise',
        value: function delFromJsonDbPromise(table, condition) {
            return new Promise(function (resolve, reject) {

                var index = Database.db[table].findIndex(condition);
                Database.db[table].splice(index, 1);
                !Database.debug && Database.mongoDb.collection(table).deleteOne({ _id: Database.db[table]._id }).then(function (r) {
                    resolve();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }, {
        key: 'setValueToDbPromise',
        value: function setValueToDbPromise(table, condition, setKey, newValue) {

            return new Promise(function (resolve, reject) {

                var index = Database.db[table].findIndex(condition);
                var oldObj = Database.db[table][index][setKey] = newValue;
                var set = {};
                set[setKey] = newValue;
                !Database.debug && Database.mongoDb.collection(table).updateOne({ _id: Database.db[index]._id }, { $set: set }).catch(function (e) {
                    return console.log(e);
                }).then(function (r) {
                    resolve();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }]);

    return Database;
}();

Database.db = {};
Database.mongoDb = null;
Database.debug = false;


module.exports = Database;
//# sourceMappingURL=database.js.map
