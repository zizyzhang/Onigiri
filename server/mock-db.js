/**
 * Created by Zizy on 3/26/16.
 */

var MockDb = function () {

    this.USER = [
        {
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
        },
        {
            usrId: 3,
            usrName: 'thirdUser',
            usrPwd: '',
            usrCreateTime: '16/03/25/00:33:22',
            usrMobi: '094573321'
        }

    ];

    this.ORDER = [
        {
            ordId: 1,
            grpId: 1,
            usrId: 1,
            dihId: 1,
            ordNum: 1
        },{
            ordId: 2,
            grpId: 1,
            usrId: 2,
            dihId: 1,
            ordNum: 1
        },{
            ordId: 3,
            grpId: 1,
            usrId: 1,
            dihId: 2,
            ordNum: 1
        }
    ];

    this.MERCHANT = [
        {
            metId: 1,
            metName: '韩国纸上烤肉',
            metPhone: '123123123'
        }, {
            metId: 2,
            metName: '麦当劳',
            metPhone: '234234234'
        }
    ];

    this.DISH = [
        {
            dihId: 1,//自動編號ID
            dihName: '炸鸡腿',//食物名字
            metId: 1,//商家Id
            dihType: '主食',//食物种类
            dihPrice: '10'//价格
        }, {
            dihId: 2,
            dihName: '红茶',
            metId: 1,
            dihType: '飲料',
            dihPrice: '5'
        },
        {
            dihId: 3,
            dihName: '小XX',
            metId: 2,
            dihType: '飲料',
            dihPrice: '4'
        }
    ];

    this.GROUP = [
        {
            grpId: 1,//团的Id
            grpHostId: 1,//團長
            //dishes: [],
            metId: 1,//商家Id
            grpAddr: 'road',//取餐地点
            grpTime: "13:33"//取餐时间
            //minAmount: '9999'
        },
        {
            grpId: 2,//团的Id
            grpHostId: 2,//團長
            //dishes: [],
            metId: 2,//商家Id
            grpAddr: 'road',//取餐地点
            grpTime: "13:33"//取餐时间
            //minAmount: '9999'
        }

    ];

    this.GROUP_MEMBER = [
        {
            gmrId: 1,//自動編號ID
            grpId: 1,//团号
            usrId: 2//使用者Id
        },
        {
            gmrId: 2,//自動編號ID
            grpId: 1,//团号
            usrId: 3//使用者Id
        }
    ];

    this.GROUP_ORDER = [//团购中某个餐点的份数
        {
            gorId: 0,
            grpId: 1,//团号
            dihId: 1//餐点名称
        }, {
            gorId: 1,
            grpId: 1,
            dihId: 2
        }, {
            gorId: 2,
            grpId: 2,
            dihId: 3
        }

    ];

    this.GROUP_DISHES = [//允许选择的餐点
        {

            gdeId: 1,//自動編號ID
            dihId: 1,//餐点Id
            grpId: 1//团的Id
        },
        {
            gdeId: 2,//自動編號ID
            dihId: 2,//餐点Id
            grpId: 1//团的Id
        }
    ];

};

module.exports = new MockDb();

