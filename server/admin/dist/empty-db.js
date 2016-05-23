'use strict';

/**
 * Created by Zizy on 3/26/16.
 */

var MockDb = function MockDb() {

    this.USER = [{
        usrId: 1,
        usrName: 'firstUser',
        usrPwd: '123',
        usrCreateTime: '16/03/24/00:33:20',
        usrMobi: '09123456'
    }, {
        usrId: 2,
        usrName: 'secondUser',
        usrPwd: '',
        usrCreateTime: '16/03/24/00:33:22',
        usrMobi: '09123456'
    }, {
        usrId: 3,
        usrName: 'thirdUser',
        usrPwd: '',
        usrCreateTime: '16/03/25/00:33:22',
        usrMobi: '094573321'
    }];

    this.ORDER = [];

    this.MERCHANT = [{
        metId: 1,
        metName: '韩国纸上烤肉',
        metPhone: '867',
        metPicUrl : ''

    }, {
        metId: 2,
        metName: '麦当劳',
        metPhone: '234234234',
        metPicUrl : ''
    }];

    this.DISH = [];

    this.GROUP = [];

    this.GROUP_MEMBER = [];

    this.GROUP_ORDER = [//团购中某个餐点的份数

    ];

    this.GROUP_DISHES = [//允许选择的餐点

    ];
};

module.exports = new MockDb();
//# sourceMappingURL=empty-db.js.map
