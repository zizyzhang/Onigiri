'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function () {

    //option : {debug:如果为true,不会存储到mongodb}

    function Database(_mongoDb, option) {
        _classCallCheck(this, Database);

        if (option && option.debug) {
            Database.debug = true;
        }

        Database.mongoDb = _mongoDb;

        Database.db.pushToDb = function (table, value) {

            //jsonDb.push('/db/' + table + '[]', value);
            if (Database.debug) {
                value._id = 'r' + new Date().getTime();
                Database.db[table].push(value);
            } else {
                Database.mongoDb.collection(table).insertOne(value).then(function (r) {
                    value._id = r.insertedId;
                    Database.db[table].push(value);
                }).catch(function (e) {
                    return console.log(e);
                });
            }
        };

        Database.db.delFromJsonDb = function (table, condition) {
            var index = Database.db[table].findIndex(condition);
            Database.db[table].splice(index, 1);
            !Database.debug && Database.mongoDb.collection(table).deleteOne({ _id: Database.db[table][index]._id });

            //jsonDb.delete(`/Database.db/${table}[${index}]`);
        };

        Database.db.setValueToDb = function (table, condition, setKey, newValue) {
            console.log(Database.db[table]);
            var index = Database.db[table].findIndex(condition);
            var oldObj = Database.db[table][index][setKey] = newValue;
            var set = {};
            set[setKey] = newValue;
            !Database.debug && Database.mongoDb.collection(table).updateOne({ _id: Database.db[table][index]._id }, { $set: set }).catch(function (e) {
                return console.log(e);
            });

            //jsonDb.push('/db/' + table + `[${index}]`, oldObj);
            //    db[table].push(value);
        };

        Database.db.pushToDbPromise = function (table, value) {
            return new Promise(function (resolve, reject) {
                if (Database.debug) {
                    value._id = 'r' + new Date().getTime();
                    Database.db[table].push(value);
                    resolve();
                } else {
                    Database.mongoDb.collection(table).insertOne(value).then(function (r) {
                        value._id = r.insertedId;
                        Database.db[table].push(value);
                        resolve();
                    }).catch(function (e) {
                        return reject(e);
                    });
                }
            });
        };

        Database.db.delFromJsonDbPromise = function (table, condition) {
            return new Promise(function (resolve, reject) {

                var index = Database.db[table].findIndex(condition);
                Database.db[table].splice(index, 1);
                !Database.debug && Database.mongoDb.collection(table).deleteOne({ _id: Database.db[table][index]._id }).then(function (r) {
                    resolve();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        };

        Database.db.setValueToDbPromise = function (table, condition, setKey, newValue) {

            return new Promise(function (resolve, reject) {

                var index = Database.db[table].findIndex(condition);
                var oldObj = Database.db[table][index][setKey] = newValue;
                var set = {};
                set[setKey] = newValue;
                !Database.debug && Database.mongoDb.collection(table).updateOne({ _id: Database.db[table][index]._id }, { $set: set }).catch(function (e) {
                    return console.log(e);
                }).then(function (r) {
                    resolve();
                }).catch(function (e) {
                    return reject(e);
                });
            });
        };
    }

    _createClass(Database, [{
        key: 'toMemory',
        value: function toMemory() {
            var _this = this;

            return new Promise(function () {
                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve) {
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    _context.next = 2;
                                    return Database.mongoDb.collection('DISH').find({}).toArray().then(function (r) {
                                        return Database.db.DISH = r;
                                    });

                                case 2:
                                    _context.next = 4;
                                    return Database.mongoDb.collection('FOLLOW').find({}).toArray().then(function (r) {
                                        return Database.db.FOLLOW = r;
                                    });

                                case 4:
                                    _context.next = 6;
                                    return Database.mongoDb.collection('GROUP').find({}).toArray().then(function (r) {
                                        return Database.db.GROUP = r;
                                    });

                                case 6:
                                    _context.next = 8;
                                    return Database.mongoDb.collection('GROUP_DISHES').find({}).toArray().then(function (r) {
                                        return Database.db.GROUP_DISHES = r;
                                    });

                                case 8:
                                    _context.next = 10;
                                    return Database.mongoDb.collection('GROUP_MEMBER').find({}).toArray().then(function (r) {
                                        return Database.db.GROUP_MEMBER = r;
                                    });

                                case 10:
                                    _context.next = 12;
                                    return Database.mongoDb.collection('GROUP_ORDER').find({}).toArray().then(function (r) {
                                        return Database.db.GROUP_ORDER = r;
                                    });

                                case 12:
                                    _context.next = 14;
                                    return Database.mongoDb.collection('MERCHANT').find({}).toArray().then(function (r) {
                                        return Database.db.MERCHANT = r;
                                    });

                                case 14:
                                    _context.next = 16;
                                    return Database.mongoDb.collection('ORDER').find({}).toArray().then(function (r) {
                                        return Database.db.ORDER = r;
                                    });

                                case 16:
                                    _context.next = 18;
                                    return Database.mongoDb.collection('USER').find({}).toArray().then(function (r) {
                                        return Database.db.USER = r;
                                    });

                                case 18:
                                    resolve(Database.db);

                                case 19:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this);
                }));

                return function (_x2) {
                    return ref.apply(this, arguments);
                };
            }());
        }
    }, {
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
            console.log(Database.db[table]);
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
    }, {
        key: 'debug',
        value: function (_debug) {
            function debug(_x) {
                return _debug.apply(this, arguments);
            }

            debug.toString = function () {
                return _debug.toString();
            };

            return debug;
        }(function (isDebug) {
            debug = isDebug;
        })
    }]);

    return Database;
}();

Database.db = {};
Database.mongoDb = null;
Database.debug = false;


module.exports = Database;
//# sourceMappingURL=database.js.map
