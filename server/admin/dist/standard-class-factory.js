'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Zizy on 4/18/16.
 */
var db = require('./mock-db');
var _ = require('lodash');

var StandardClassFactory = function () {
    function StandardClassFactory() {
        _classCallCheck(this, StandardClassFactory);
    }

    _createClass(StandardClassFactory, [{
        key: 'createClassGroupByGroupId',
        value: function createClassGroupByGroupId(grpId) {
            var that = this;
            var group = db.GROUP.find(function (g) {
                return g.grpId === grpId;
            });
            group = {
                grpId: group.grpId,
                grpAddr: group.grpAddr,
                grpTime: group.grpTime,
                grpHostName: db.USER.find(function (user) {
                    return user.usrId === group.grpHostId;
                }).usrName,
                merchant: db.MERCHANT.find(function (merchant) {
                    return merchant.metId === group.metId;
                }),
                grpOrder: _.filter(db.GROUP_ORDER, function (grr) {
                    return grr.grpId === group.grpId;
                }) || [],
                grpDishes: _.filter(db.GROUP_DISHES, function (grh) {
                    return grh.grpId === group.grpId;
                }).map(function (grh) {
                    var grpDish = {};
                    grpDish.dish = _.find(db.DISH, function (dish) {
                        return dish.dihId === grh.dihId;
                    });
                    _.assign(grpDish, grh);
                    return grpDish;
                }) || [],
                grpHost: that.createUserByUserId(group.grpHostId)

            };

            return group;
        }
    }, {
        key: 'createUserByUserId',
        value: function createUserByUserId(usrId) {
            var _usr = db.USER.find(function (usr) {
                return usr.usrId === usrId;
            });
            var user = {
                usrId: _usr.usrId,
                usrName: _usr.usrName,
                usrMobi: _usr.usrMobi
            };

            return user;
        }
    }]);

    return StandardClassFactory;
}();

module.exports = new StandardClassFactory();
//# sourceMappingURL=standard-class-factory.js.map
