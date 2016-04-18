/**
 * Created by Zizy on 4/18/16.
 */
const db = require('./mock-db');
const _ = require('lodash');

class StandardClassFactory {
    createClassGroupByGroupId(grpId){
        let group = db.GROUP.find(g=>g.grpId === grpId);
        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: group.grpTime,
            grpHostName: (db.USER.find(user => user.usrId === group.grpHostId)).usrName,
            merchant: db.MERCHANT.find(merchant => merchant.metId === group.metId),
            grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId === group.grpId)||[],
            grpDishes: _.filter(db.GROUP_DISHES, grh => grh.grpId === group.grpId).map(grh=> {
                let grpDish = {};
                grpDish.dish = _.find(db.DISH, dish=> dish.dihId === grh.dihId);
                _.assign(grpDish, grh);
                return grpDish;
            })||[],
            grpHost : this.createUserByUserId(group.grpHostId),


        };

        return group;
    }

    createUserByUserId(usrId){
        let _usr = db.USER.find(usr=>usr.usrId===usrId);
        let user = {
            usrId:_usr.usrId,
            usrName:_usr.usrName,
            usrMobi:_usr.usrMobi,
        };

        return user;
    }

}


module.exports = new StandardClassFactory();