'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Zizy on 8/30/16.
 */
require('source-map-support').install();
require('babel-polyfill');

var _require = require('./server.js');

var Server = _require.Server;
var connectMongo = _require.connectMongo;


_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var db;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    //#######################connect database
                    db = void 0;
                    _context.next = 3;
                    return connectMongo().then(function (res) {
                        return db = res;
                    });

                case 3:

                    //#######################start express

                    new Server(db);

                case 4:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this);
}))();
//# sourceMappingURL=main.js.map
