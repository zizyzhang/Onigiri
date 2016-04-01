/**
 * Created by Zizy on 3/26/16.
 */

var MockDb = function () {

    this.USER = [
        {
            usrId: 1,
            usrName: 'a',
            usrPwd: '123',
            usrCreateTime: '16/03/24/00:33:22',
            usrMobi: '09123456'
        }, {
            usrId: 2,
            usrName: '',
            usrPwd: '',
            usrCreateTime: '16/03/24/00:33:22',
            usrMobi: '09123456'
        }

    ];

    this.ORDER = [
    //    {
    //    ordId: '',
    //    grpId: ''
    //}
    ];

    this.MERCHANT = [
        {
            metId: '1',
            metName: 'a',
            metPhone: '123123123'
        }, {
            metId: '2',
            metName: 'b',
            metPhone: '234234234'
        }
    ];

    this.DISH = [
        //{
        //    dihId: '',
        //    metId: '',
        //    dihType: ''
        //}
    ];

    this.GROUP = [
        {
            grpId: '1',
            grpHostId: 'b',
            //dishes: [],
            metId: '999',
            grpAddr: 'road',
            grpTime: "13:33",
            minAmount: '9999'
        }

    ];

    this.GROUP_DISHES = [
        //{
            //gdeId: '',
            //dihId: '',
            //grpId: ''
        //}
    ];

    this.GROUP_MEMBER = [
        //{
        //    gmrId: '',
        //    grpId: ''
        //}
    ];

    this.GROUP_ORDER = [
    //    {
    //    grpId: '',
    //    dihId: '',
    //    gorNum: ''
    //}
    ];

};

module.exports = new MockDb();

