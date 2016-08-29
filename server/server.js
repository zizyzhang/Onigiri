'use strict';

/**
 * Created by User on 2016/3/24.
 */

require('source-map-support').install();
require('babel-polyfill');

const isDebug = true;
const fakeAuthCode = true;

const _ = require('lodash');
const path = require('path');


require('./time.js');


let twilioClient = require('twilio')("AC7161db8bee36103cc7d6c29fe33404ec", "1c76b95b0c1f28236cb262e6b32ba8ab");

let authCodes = []; //{phone  : String , authCode: String , endTime : Number , triedTimes:Numbers}

let nodemailer = require('nodemailer');

let mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'o.grpbuy@gmail.com',
        pass: 'asd1q2w3e'
    }
});

let MongoClient = require('mongodb').MongoClient;

// Connection URL
let mongoUrl = 'mongodb://localhost:27017/onigiri';
let mongoDb = null;
let InMemoryDatabase = require('./database.js');
let db = null;

let Server = async function (option) {

    await MongoClient.connect(mongoUrl).then(_db=> {
        mongoDb = _db;

        mongoDb.collection('DISH').find({}).toArray().then(r=>db.DISH = r);
        mongoDb.collection('FOLLOW').find({}).toArray().then(r=>db.FOLLOW = r);
        mongoDb.collection('GROUP').find({}).toArray().then(r=>db.GROUP = r);
        mongoDb.collection('GROUP_DISHES').find({}).toArray().then(r=>db.GROUP_DISHES = r);
        mongoDb.collection('GROUP_MEMBER').find({}).toArray().then(r=>db.GROUP_MEMBER = r);
        mongoDb.collection('GROUP_ORDER').find({}).toArray().then(r=>db.GROUP_ORDER = r);
        mongoDb.collection('MERCHANT').find({}).toArray().then(r=>db.MERCHANT = r);
        mongoDb.collection('ORDER').find({}).toArray().then(r=>db.ORDER = r);
        mongoDb.collection('USER').find({}).toArray().then(r=>db.USER = r);
        db = new InMemoryDatabase(mongoDb, option);//不能提前赋值,因为js传递引用的副本

        console.log('database connected!');
    }).catch(e=> {
        console.log(e);
        progress.exit(1);
    });

    //清空空白团
    setInterval(()=> {
        //得到所有沒過期的團
        let availableGroups = _.filter(db.GROUP, grp=>grp.grpStatus === 0 || grp.grpStatus === 1);

        for (let g of availableGroups) {
            let deadLine = new Date(g.grpTime);
            if (deadLine.getTime() - new Date().getTime() < 0) {
                db.setValueToDb('GROUP', row=>row.grpId === g.grpId, 'grpStatus', -1);
            }
        }
    }, 5000);


    let express = require('express');
    let bodyParser = require('body-parser');

    let app = express();


    let self = this;

    //this.db = isDebug ? db : undefined;??????????????????????????????????????????????????

    this.getDb = function(){
        return db;
    };


    let allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    };




    app.use(allowCrossDomain);//CORS middleware
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/db', function (req, res) {
        if (isDebug) {
            res.json(db);
        }
    });

    app.post('/addUser', function (req, res) {

            req.body = JSON.parse(req.body.data);

            let usrName = req.body.usrName;
            let usrPwd = req.body.usrPwd;
            let usrMail = req.body.usrMail;
            let usrMobi = req.body.usrMobi;
            let authCode = req.body.authCode;


            if (!usrName || !usrPwd || !usrMobi || !authCode) {
                res.json({success: false, msg: '資料填寫不完整!'});
                return;
            }

            let result = authCodes.find(obj=>obj.phone === usrMobi);
            if (!result) {
                res.json({success: false, msg: '請驗證手機號碼'});
                return;
            } else if (result.authCode !== authCode) {
                result.triedTimes++;
                if (result.triedTimes === 3) {
                    authCodes.splice(authCodes.findIndex(obj=>obj.phone === usrMobi), 1);
                }
                res.json({success: false, msg: '驗證碼輸入錯誤'});
                return;
            } else if (db.USER.find(o=>o.usrName === usrName)) {
                res.json({success: false, msg: '帳號名稱重複'});
                return;
            }


            //console.log(JSON.stringify(req.body));
            self.addUser(usrName, usrPwd, usrMail, usrMobi, function (result) {
                res.json(result);
            });
        }
    );

    app.post('/merchant', function (req, res) {

            req.body = JSON.parse(req.body.data);

            let metName = req.body.metName;
            let metPhone = req.body.metPhone;
            let metMinPrice = Number(req.body.metMinPrice);
            let metPicUrl = req.body.metPicUrl || '';
            let metType = req.body.metType || '其他';


            if (!(metName && metPhone && metMinPrice !== null && metMinPrice >= 0)) {
                res.json({success: false, msg: '資料輸入錯誤'});
                return;
            }

            self.addMerchantPromise({metName, metPhone, metMinPrice, metPicUrl, metType}).then((merchant)=> {
                res.json({success: true, merchant});
            }).catch(()=>res.json({success: false}));

        }
    );

    app.post('/dishes', function (req, res) {

            req.body = JSON.parse(req.body.data);

            console.log(JSON.stringify(req.body));

            for (let dish of req.body) {
                dish.dihPrice = Number(dish.dihPrice);

                if (!(dish.dihName && dish.dihPrice !== null && dish.metId !== null)) {
                    res.json({success: false, msg: '資料不完整'});
                    return;
                }

                if (dish.dihPrice < 0) {
                    res.json({success: false, msg: '商品價格不正確'});
                    return;
                }
            }

            req.body = req.body.map(row=> {
                row.dihType = row.dihType || '主食';
                return row;
            });


            self.addDishPromise(req.body).then((result)=> {
                res.json({success: true, dishes: result});
            }).catch(()=>res.json({success: false}));

        }
    );

    app.post('/userAuth', function (req, res) {
            let usrName = req.body.usrName;
            let usrPwd = req.body.usrPwd;

            if (!(usrName && usrPwd)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            //console.log(JSON.stringify(req.body));

            self.userAuth(usrName, usrPwd, function (result) {
                res.json(result);
            });

        }
    );

    app.get('/allGroup', function (req, res) {
        // Pass to next layer of middleware
        self.allAvailableGroup(function (result) {
            res.json(result);
        });
    });

    app.get('/groupById/:id', (req, res)=> {
        self.getGroupById(Number(req.params.id), result=>res.json(result));
    });

    app.get('/unjoinedGroups/:usrId', (req, res)=> {
        self.getUnjoinedGroups(Number(req.params.usrId), result=>res.json(result));
    });

    app.get('/allMerchant', function (req, res) {
        // Pass to next layer of middleware
        self.allMerchant(function (result) {
            res.json(result);
        });
    });

    app.get('/merchantById/:id', function (req, res) {
        // Pass to next layer of middleware

        self.getMerchantById(Number(req.params.id), function (result) {
            res.json(result);
        });
    });

    app.get('/cancelOrder/:grpId/:usrId', function (req, res) {
        let grpId = Number(req.params.grpId);
        let usrId = Number(req.params.usrId);
        let ordStatus = db.ORDER.find(o=>o.grpId === grpId && o.usrId === usrId).ordStatus;

        //例外判断, 只有待审查的订单可以被取消
        if (ordStatus === 0) {
            db.setValueToDb('ORDER', o=>o.grpId === grpId && o.usrId === usrId, 'ordStatus', -2);
            res.json({success: true});
        } else {
            if (ordStatus === -2) {
                res.json({success: false, err: '訂單已被取消'});
            } else {
                res.json({success: false, err: '訂單已被確認,無法取消'});
            }
        }
    });


    app.post('/group', function (req, res) {

            //console.log(req.body);

            req.body = JSON.parse(req.body.data);
            let grpHostId = Number(req.body.grpHostId);
            let dishes = req.body.dishes;
            let metId = Number(req.body.metId);
            let addr = req.body.addr;
            let gorTime = req.body.gorTime;
            let grpAmountLimit = Number(req.body.grpAmountLimit) || 0;

            //TODO Check Time
            let deadLine = new Date(gorTime.replace(/(\d*)年(\d*)月(\d*)日\,/gi, '$1/$2/$3'));
            gorTime = deadLine.getTime();

            if (gorTime < new Date().getTime()) {
                res.json({success: false, msg: '截止時間不能早於當前時間'});
                return;
            }


            if (!( grpHostId !== null && dishes && metId && addr && gorTime)) {
                res.json({success: false, msg: '資料不完整'});
                console.log({grpHostId, dishes, metId, addr, gorTime})
                return;

            }


            self.postGroup(grpHostId, dishes, metId, addr, gorTime, grpAmountLimit, function (result) {
                res.json(result);
            });

        }
    );

    app.post('/joinGroup', function (req, res) {
            req.body = JSON.parse(req.body.data);
            let usrId = Number(req.body.usrId);
            let dishes = req.body.dishes;
            let grpId = req.body.grpId;
            let comments = req.body.comments;

            if (!(usrId !== null && dishes && dishes.length !== 0 && grpId)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }


            self.joinGroupPromise(usrId, dishes, grpId, comments).then(result=> {
                res.json(result);
            }).catch(e=> {
                console.log(e);
                res.json(e);
            });

        }
    );

    app.post('/groupStatus', function (req, res) {
            req.body = JSON.parse(req.body.data);
            let grpId = Number(req.body.grpId);
            let grpStatus = Number(req.body.grpStatus);
            if (!(grpId !== null && grpStatus !== null)) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            self.updateGroupStatusPromise(grpId, grpStatus).then(result=> {
                res.json(result);
            }).catch(e=> {
                res.json(e);
            });

        }
    );

    app.post('/mobiAuth', function (req, res) {
            let usrMobi = req.body.data;
            if (!usrMobi) {
                res.json({success: false, msg: '資料不完整'});
                return;
            }

            self.getTwilioCode(usrMobi).then(result=> {
                res.json({success: true});
            }).catch(e=> {
                res.json(e);
            });

        }
    );


    app.get('/groupedOrdersByUserId/:id', function (req, res) {
            let usrId = Number(req.params.id);
            self.getGroupedOrdersByUserId(usrId, result=> {
                //console.log(result);
                res.json(result);
            });
        }
    );

    app.get('/groupedOrdersAndSumsByHostId/:id', function (req, res) {
            let usrId = Number(req.params.id);

            self.getGroupedOrdersAndSumsByHostIdPromise(usrId).then(result=>res.json(result));
        }
    );

    app.get('/follow/:usrId/:hostId', function (req, res) {
        try {
            let usrId = Number(req.params.usrId);
            let hostId = Number(req.params.hostId);

            if (db.FOLLOW.find(f=>f.usrId === usrId && f.hostId === hostId)) {
                db.delFromJsonDb('FOLLOW', f=>f.usrId === usrId && f.hostId === hostId);
                res.json({success: true});
                return;
            }

            let fowId = db.FOLLOW.length === 0 ? 0 : _.maxBy(db.FOLLOW, "fowId").fowId + 1;
            db.pushToDbPromise('FOLLOW', {
                fowId,
                usrId: usrId,
                hostId: hostId
            }).then(()=> res.json({success: true})
            ).catch(e=> res.json({err: e.toString()}));

        } catch (e) {
            console.log(e.toString());
            res.json({success: false, err: e.toString()});

        }


    });


    app.get('/followStatus/:usrId/:hostId', function (req, res) {
        try {
            let usrId = req.params.usrId;
            let hostId = req.params.hostId;

            if (db.FOLLOW.find(f=>f.usrId === usrId && f.hostId === hostId)) {
                res.json({followed: true});
            } else {
                res.json({followed: false});
            }


        } catch (e) {
            console.log(e.toString());
            res.json({err: e.toString()});

        }

    });

    app.post('/updateOrdStatus', function (req, res) {
        req.body = JSON.parse(req.body.data);
        let ordId = Number(req.body.ordId);
        let ordStatus = Number(req.body.ordStatus);
        // console.log("ordId:" + ordId + ",ordStatus:" + ordStatus);

        self.updateOrdStatusPromise(ordId, ordStatus).then(result=> {
            res.json(result);
        }).catch(e=> {
            res.json(e);
        });
    });

    app.get('/confirmOrder/:id', function (req, res) {
        let usrId = Number(req.params.id);

        self.confirmOrder(usrId).then(result=>res.json(result));
    });

    app.get('/grpUsersOrdersByHostId/:hostId', function (req, res) {
        let hostId = Number(req.params.hostId);
        let from = Number(req.query.from);
        self.getGrpUsersOrdersByHostIdPromise(hostId, from).then(result=>res.json(result));
    });

    app.post('/getGrpMember', function (req, res) {
        req.body = JSON.parse(req.body.data);
        let gmrId = Number(req.body.gmrId);
        let comStatus = Number(req.body.comStatus);

        self.getComment(gmrId, comStatus).then(result=> {
            res.json(result);
        }).catch(e=> {
            res.json(e);
        });

    });

    app.post('/refuseOrder', function (req, res) {
        req.body = JSON.parse(req.body.data);
        let usrId = Number(req.body.usrId);
        let grpId = Number(req.body.grpId);
        let usrOrds = req.body.usrOrds;
        console.log('usrId , grpId', usrId, grpId);

        self.refuseOrder(usrId, grpId, usrOrds, result=> {
            res.json(result);
        });
    });


    app.listen(8080, function () {
        console.log('' +
            'app listening on port 8080!');
    });

    this.addDishPromise = function  (dishes) {

        return new Promise((resolve, reject)=> {
            for (let dish of dishes) {
                dish.dihId = _.maxBy(db.DISH, "dihId").dihId + 1;
                db.pushToDb('DISH', dish);
            }
            resolve(dishes);
        });
    };

    this.getTwilioCode = function (userMobi) {
        return new Promise(function (resolve, reject) {
            let min = 100;
            let max = 999;
            let randomAuth = Math.floor(Math.random() * (max - min + 1) + min) + '';
            if (fakeAuthCode) {
                randomAuth = '123';
                resolve('123');
                authCodes.push({
                    phone: userMobi,
                    authCode: randomAuth,
                    endTime: new Date().getTime() + 1000 * 60 * 5,
                    triedTimes: 0
                });

                setTimeout(()=> {
                    let indexOfAuthCode = authCodes.findIndex(obj=>obj.authCode === authCodes);
                    if (indexOfAuthCode) {
                        authCodes.splice(indexOfAuthCode, 1);
                    }
                }, 1000 * 60 * 5);
                return;
            }

            twilioClient.messages.create({
                body: '您的販團驗證碼是' + randomAuth,
                to: '+886' + userMobi,  // Text this number
                from: '+13342030485' // From a valid Twilio number
            }, function (err, message) {
                if (err) {
                    console.log(err);
                    reject(randomAuth);
                } else {
                    console.log(message && message.sid);
                    resolve(randomAuth);
                    authCodes.push({
                        phone: userMobi,
                        authCode: randomAuth,
                        endTime: new Date().getTime() + 1000 * 60 * 5,
                        triedTimes: 0
                    });

                    setTimeout(()=> {
                        let indexOfAuthCode = authCodes.findIndex(obj=>obj.authCode === authCodes);
                        if (indexOfAuthCode) {
                            authCodes.splice(indexOfAuthCode, 1);
                        }
                    }, 1000 * 60 * 5);
                }
            });


        });
    };

    this.addUser = function (usrName, usrPwd, usrMail, usrMobi, callback) {
        let usrId = 0;

        for (let user of db.USER) {
            if (user.usrId > usrId) {
                usrId = user.usrId;
            }
            usrId = Number(usrId) + 1;
        }


        let usrCreateTime = new Date().toString();
        let newUser = {
            usrId: usrId,
            usrName: usrName,
            usrPwd: usrPwd,
            usrMail: usrMail,
            usrCreateTime: usrCreateTime,
            usrMobi: usrMobi
        };


        if (newUser.usrName.length !== 0 && newUser.usrPwd.length !== 0 && newUser.usrMobi.length === 10) {
            db.pushToDb('USER', newUser);
            callback({success: true});
        } else {
            callback({success: false});
        }
    };

    /*
     * 參數
     {metName,
     metPhone,
     metMinPrice,
     metPicUrl,
     metType}
     */

    this.addMerchantPromise = function (merchant) {
        return new Promise((resolve, reject)=> {
            merchant.metId = _.maxBy(db.MERCHANT, 'metId').metId + 1;

            db.pushToDb('MERCHANT', merchant);

            resolve(merchant);

        });
    };

    this.userAuth = function (usrName, usrPwd, callback) {
        let isSuccess = false;
        for (let index in db.USER) {
            if (db.USER[index].usrName == usrName && db.USER[index].usrPwd == usrPwd) {
                callback({
                    success: 1,
                    user: {
                        usrName: db.USER[index].usrName,
                        usrId: db.USER[index].usrId,
                        usrMobi: db.USER[index].usrMobi
                    }
                });
                return;
            }
        }

        if (!isSuccess) {
            callback({success: false, err: '帳號密碼不匹配'});
        }
    };

    //unjoined and available groups by user id
    this.getUnjoinedGroups = function (usrId, callback) {
        let that = this;

        let joinedGroupIds = _.uniqBy(db.ORDER.filter(ord=>ord.usrId === usrId), 'grpId').map(ord=>ord.grpId);

        //包含了已经结束的团
        let allUnjoinedGroups = db.GROUP.filter(grp=> !joinedGroupIds.find(grpId=>grpId === grp.grpId));

        //并不是标准类别
        let unjoinedAndAvailable = allUnjoinedGroups.filter(g=>g.grpStatus === 0 || g.grpStatus === 1);

        let stdGroups = unjoinedAndAvailable.map(g=>that.createClassGroupByGroupId(g.grpId));


        callback(_.sortBy(stdGroups, row=>-new Date(row.grpTime)));
    };

    this.allGroup = function (callback) {
        let result = [];

        for (let _group of db.GROUP) {
            let group = this.createClassGroupByGroupId(_group.grpId);
            result.push(group);

        }
        callback(result);
    };

    this.allAvailableGroup = function (callback) {
        let result = [];

        for (let _group of db.GROUP.filter(g=>g.grpStatus === 0 || g.grpStatus === 1)) {
            let group = this.createClassGroupByGroupId(_group.grpId);
            result.push(group);
        }

        callback(_.sortBy(result, row=>-new Date(row.grpTime)));
    };

    this.getGroupById = function (id, callback) {
        let group = this.createClassGroupByGroupId(id);
        callback(group);
    };


    this.allMerchant = function (callback) {
        let result = [];
        for (let _merchant of db.MERCHANT) {
            let merchant = this.createClassMerchantById(_merchant.metId);
            result.push(
                merchant
            );
        }
        callback(result);
    };


    this.getMerchantById = function (id, callback) {
        let merchant = this.createClassMerchantById(id);
        callback(merchant);
    };

    this.postGroup = function (grpHostId, dishes, metId, addr, gorTime, grpAmountLimit, callback) {
        let lastGroup = _.maxBy(db.GROUP, 'grpId');
        let grpId = lastGroup ? lastGroup.grpId + 1 : 1;
        db.pushToDb('GROUP', {
            grpId,
            grpHostId: grpHostId,
            metId: metId,
            grpAddr: addr,
            grpTime: gorTime,
            grpStatus: 0,
            grpCreateTime: new Date().getTime(),
            grpAmount: 0,
            grpAmountLimit: grpAmountLimit || 0

            //minAmount: minAmount
        });
        for (let dihId of dishes) {
            let lastDish = _.maxBy(db.GROUP_DISHES, 'gdeId');
            let gdh = {
                gdeId: lastDish ? lastDish.gdeId + 1 : 1,
                dihId: Number(dihId),
                grpId
            };
            db.pushToDb("GROUP_DISHES", gdh);
        }


        //发送信息给follow的人
        let usrIds = db.FOLLOW.filter(f=>f.hostId === grpHostId);
        console.log('usrIds grpHostId', JSON.stringify(usrIds), grpHostId);
        if (usrIds.length !== 0) {
            // for (let usr of db.USER.filter(u=>_.includes(usrIds, u.usrId))) {
            for (let usr of usrIds) {
                let usrMail = db.USER.find(u=>u.usrId === usr.usrId).usrMail;
                let time = new Date(gorTime);
                self.sendMail(usrMail, '您關注的團主開團啦', `<p>您關注的團主開團啦,
                <p>團主名稱為: ${db.USER.find(u=>u.usrId === grpHostId).usrName}</p>
                <p>店家: ${db.MERCHANT.find(m=>m.metId === metId).metName}</p>
                <p>截止時間: ${(time.getMonth() + 1)}/${time.getDate()} ${time.getHours()}:${(time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())}</p>
                <p>領取地點: ${addr}</p>
                <br><br><br><p>信件由販團系統自動發送: <a href="http://bit.do/groupbuy">http://bit.do/groupbuy</a> </p>`);
            }
        }


        callback({success: 1});
    };

    this.joinGroupPromise = function (usrId, dishes, grpId, comments) {
        //console.log(JSON.stringify({usrId, dishes, grpId}));


        return new Promise((resolve, reject)=> {
            //拒絕用戶對同壹個group連續點兩次餐點
            //if (db.ORDER.find(ord=>ord.usrId === usrId && ord.grpId === grpId)) {
            //    reject("重復加團!");
            //    return;
            //}

            //只有0,1状态的团可以团购
            if (!_.includes([0, 1], db.GROUP.find(grp=>grp.grpId === grpId).grpStatus)) {
                reject("團購已經截止!");
                return;
            }

            //是否超过最高上限
            let amountThisTime = 0;
            let funcFindDish = dih=> d=>d.dihId === dih.dihId;
            for (let dih of dishes) {
                amountThisTime += db.DISH.find(funcFindDish(dih)).dihPrice * dih.num;
            }
            let grpAmountLimit = Number(db.GROUP.find(grp=>grp.grpId === grpId).grpAmountLimit);
            let grpAmount = db.GROUP.find(grp=>grp.grpId === grpId).grpAmount;
            if (grpAmountLimit !== 0 && amountThisTime + grpAmount > grpAmountLimit) {
                //團購上限
                reject('超過團購上限! 超出' + (amountThisTime + grpAmount - grpAmountLimit) + '元');
                return;
            } else {
                //最小外送金額
                let g = db.GROUP.find(g=>g.grpId === grpId);
                let metId = g.metId;
                let metMinPrice = db.MERCHANT.find(m=>m.metId === metId).metMinPrice;
                db.setValueToDb("GROUP", row=>row.grpId === grpId, "grpAmount", amountThisTime + grpAmount);
                if (amountThisTime + grpAmount >= metMinPrice) {
                    db.setValueToDb("GROUP", row=>row.grpId === grpId, "grpStatus", 1);
                }

            }

            let usrName = db.USER.find(usr=>usr.usrId === usrId).usrName;
            let addOrd = function (usrName, dihId, num, ordStatus) {
                let lastOrder = _.maxBy(db.ORDER, 'ordId');

                db.pushToDb("ORDER", {
                    ordId: lastOrder ? lastOrder.ordId + 1 : 1,
                    grpId: grpId,
                    usrId: usrId,
                    usrName: usrName,  //07.03 add
                    dihId: dihId,
                    ordNum: num,
                    ordCreateTime: new Date().getTime(),
                    // ordStatus為訂單狀態(-1:拒絕,0:待審查,1:已確認=未付款,2:已付款)
                    ordStatus: ordStatus
                });
            };

            let orderedDishIds = _.chain(db.ORDER).filter(ord=>ord.usrId === usrId && ord.grpId === grpId).map(ord=>ord.dihId).value();
            // let selectRowByDishId = dihId => row=>row.dihId === dihId;
            let isSend = !db.GROUP_MEMBER.find(usr => usr.usrId === usrId && usr.grpId === grpId);   //加購不通知

            let g = db.GROUP.find(g=>g.grpId === grpId);
            let hostId = g.grpHostId;
            let ordStatus = usrId === hostId ? 1 : 0; //團主訂單不需要經過確認

            // 加購情況(有舊訂單):
            // ordStatus==-1(拒絕) --->(both)新增另一張訂單
            // ordStatus==0 (待審查)-->(相同商品)直接修改
            //                                      -->(不同商品)新增訂單
            // ordStatus==1 (已接受)-->(相同商品)增加屬性、改狀態  (both)需再次確認
            //                                     -->(不同商品)新增訂單
            let orders = db.ORDER.filter(ord=>ord.usrId === usrId && ord.grpId === grpId && _.includes([0, 1], ord.ordStatus));

            // let orders = db.ORDER.filter(ord=>ord.usrId === usrId && ord.grpId === grpId && ord.ordStatus===0 || ord.ordStatus===1);

            // let orders = db.ORDER.filter(function (ord) {
            //     if (ord.usrId === usrId && ord.grpId === grpId && (ord.ordStatus === 0 || ord.ordStatus === 1)) {
            //         console.log('usrId grpId', usrId, grpId);
            //         console.log('ord.usrId ord.grpId ord.ordStatus', ord.usrId, ord.grpId, ord.ordStatus);
            //         return ord;
            //     }
            // });
            console.log('joinGroupPromise====orders' + JSON.stringify(orders));

            for (let {dihId, num} of dishes) {
                if (num === 0 || !_.isNumber(num)) {
                    continue;
                }

                // if (orders)
                console.log('dihId num', dihId, num);
                if (orders.length === 0) {  //無舊訂單
                    addOrd(usrName, dihId, num, ordStatus);
                    console.log('無舊訂單 : ' + grpId, usrId, usrName, dihId, num, ordStatus);

                } else { //有舊訂單

                    let sameProduct = orders.find(ord=>ord.dihId === dihId);
                    console.log('====sameProduct', JSON.stringify(sameProduct));
                    if (sameProduct) {
                        if (sameProduct.ordStatus === 0) {
                            // ordStatus==0 (待審查)-->(相同商品)直接修改
                            console.log('ordStatus==0 (待審查)-->(相同商品)直接修改');
                            db.setValueToDb('ORDER', ord => ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId, 'ordNum',
                                num + db.ORDER.find(ord => ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId).ordNum);
                        } else if (sameProduct.ordStatus === 1) {
                            //  ordStatus==1 (已接受)-->(相同商品)需再次確認
                            console.log('ordStatus==1 (已接受)-->(相同商品)需再次確認');
                            db.setValueToDb('ORDER', ord => ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId, 'updateOrdNum', num);
                            db.setValueToDb('ORDER', ord => ord.dihId === dihId && ord.usrId === usrId && ord.grpId === grpId, 'ordStatus', 3);
                            //ordStatus=3 加購中
                        }

                    } else {
                        // ordStatus==0 (待審查)-->(不同商品)新增訂單
                        //  ordStatus==1 (已接受)-->(不同商品)需再次確認
                        console.log('ordStatus==0、1-->(不同商品)新增訂單');
                        addOrd(usrName, dihId, num, ordStatus);
                    }


                }
            }


            if (comments) {
                let lastGroupMember = _.maxBy(db.GROUP_MEMBER, gmr=>gmr.gmrId);
                db.pushToDb("GROUP_MEMBER", {
                    gmrId: lastGroupMember ? lastGroupMember.gmrId + 1 : 1,
                    usrId: usrId,
                    usrName: usrName,  //07.03 add
                    grpId: grpId,
                    comments: comments
                });
            }


            //最小外送金額
            // let g = db.GROUP.find(g=>g.grpId === grpId);
            let metId = g.metId;
            // let hostId = g.grpHostId;
            let m = db.MERCHANT.find(m=>m.metId === metId);
            let metMinPrice = m.metMinPrice;
            let amount = 0;

            self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(result=> {
                // console.log("result.groupedOrderSums"+JSON.stringify(result.groupedOrderSums));
                let groupOrderSum = result.groupedOrderSums.find(orderSum=>orderSum.group.grpId === grpId);
                // console.log("groupOrderSum", groupOrderSum);

                if (groupOrderSum) {
                    for (let orderSum of groupOrderSum.orderSums) {
                        let price = orderSum.dish.dihPrice;
                        let num = orderSum.ordNum;
                        let total = price * num;
                        amount += total;
                    }
                    db.setValueToDb("GROUP", row=>row.grpId === grpId, "grpAmount", amount);

                    if (amount >= metMinPrice) {
                        db.setValueToDb("GROUP", row=>row.grpId === grpId, "grpStatus", 1);
                    }
                }
                resolve({success: 1});
            }).catch(e=>console.log(e));


            // console.log('snedornot'+snedornot);
            // 通知團主 : 有新成員加入  ;  不通知 : 團主加入、團員加購
            if (usrId !== hostId && isSend) {
                let hostMail = db.USER.find(usr=>usr.usrId === hostId).usrMail;
                let metName = m.metName;
                let subject = '販團 : ' + metName + ' - 有新成員加入!';
                let now = new Date();
                let detime = new Date(g.grpTime);

                let html = '<p>申請時間: ' + (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + '</p>' +
                    '<p>申請人: ' + usrName + '</p>' +
                    '<p>申請團購: ' + metName + '</p>' +
                    '<p>團購截止時間: ' + (detime.getMonth() + 1) + '/' + detime.getDate() + ' ' + detime.getHours() + ':' + (detime.getMinutes() < 10 ? '0' + detime.getMinutes() : detime.getMinutes()) + '</p>' +
                    '<br><br><br><p>信件由販團系統自動發送: <a href="http://bit.do/groupbuy">http://bit.do/groupbuy</a> </p>';
                self.sendMail(hostMail, subject, html);
            }

        });

    };

    this.convertOrdersToGroupedOrders = function (orders) {
        let groupedOrders = [];

        for (let order of orders) {

            // if (order.ordStatus > 0) {
            // console.log("ordStatus:" + order.ordStatus);
            let tOrder = groupedOrders.find(gor=>gor.group.grpId === order.grpId);

            if (tOrder) {
                if (order.ordStatus > 0) {
                    tOrder.orders.push(order);
                }
            } else {
                let group = this.createClassGroupByGroupId(order.grpId);

                if (order.ordStatus === 0) {
                    group.ordNotConfirm = true;
                    groupedOrders.push({group: group, orders: []});
                } else if (order.ordStatus === -1) {
                    groupedOrders.push({group: group, orders: []});
                } else {
                    groupedOrders.push({group: group, orders: [order]});
                }

            }
            // }
        }
        return _.sortBy(groupedOrders, row=>-new Date(row.group.grpTime));
    };

    this.convertOrdersToGroupedOrdersUsr = function (orders) {
        let groupedOrders = [];
        for (let order of orders) {

            let tOrder = groupedOrders.find(gor=>gor.group.grpId === order.grpId);
            if (tOrder) {
                tOrder.orders.push(order);
            } else {
                let group = this.createClassGroupByGroupId(order.grpId);

                //顯示給使用者的狀態
                let status = '';

                switch (group.grpStatus) {
                    case 0:
                    case 1:
                        switch (order.ordStatus) {
                            case -1:
                                status = '被團主拒絕';
                                break;
                            case -2:
                                status = '已取消';
                                break;
                            case 0:
                                status = '等待團主審查';
                                break;
                            case 1:
                                if (group.grpStatus === 0) {
                                    status = '已確認, 未達到起送金額';
                                } else {
                                    status = '等待商家配送';
                                }
                                break;
                            case 2:
                                status = '付款完成';
                                break;
                        }
                        break;
                    case 2:
                        status = '已送達, 待付款';
                        break;
                    case 3:
                        status = '已完成';
                        break;
                    case -1:
                        status = '開團失敗';
                        break;
                }


                groupedOrders.push({group: group, orders: [order], status: status});
            }
        }
        return _.sortBy(groupedOrders, row=>-new Date(row.group.grpTime));
    };


    this.getGroupedOrdersByUserId = function (usrId, callback) {
        let orders = _.sortBy(db.ORDER.filter(ord=>ord.usrId === usrId), obj=>-obj.ordCreateTime).map(ord=> {

            let newOrd = {
                ordId: ord.ordId,
                grpId: ord.grpId,
                usrId: ord.usrId,
                usrName: ord.usrName,   //07.03 add
                dish: db.DISH.find(d=>d.dihId === ord.dihId),
                ordNum: ord.ordNum,
                ordStatus: ord.ordStatus,    //07.03 add
                ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),

            };
            return newOrd;
        });

        let groupedOrders =
            self.convertOrdersToGroupedOrdersUsr(orders);
        callback(groupedOrders);
    };

    this.getGroupedOrdersAndSumsByHostIdPromise = function (hostId) {
        let that = this;

        return new Promise(resolve=> {
            let groupedOrders = [];
            let groupedOrderSums = [];


            let groupIds = db.GROUP.filter(grp=>grp.grpHostId === hostId);
            let orders = db.ORDER.filter(ord=> {
                //ord.grpId === groupId

                return db.GROUP.find(grp=>grp.grpId === ord.grpId).grpHostId === hostId;
            }).map(ord=> {

                let newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    usrName: ord.usrName,   //07.03 add
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus,    //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                    updateOrdNum: ord.updateOrdNum ? ord.updateOrdNum : undefined,
                };

                return newOrd;
            });

            //console.log('group',db.GROUP,'groupedOrders', orders);

            groupedOrders =
                self.convertOrdersToGroupedOrders(orders);

            // console.log("ordersordersordersorders:" + JSON.stringify(orders));
            // console.log("groupedOrdersgroupedOrdersgroupedOrders:" + JSON.stringify(groupedOrders));

            self.formatOrders(groupedOrders, (result)=> {
                groupedOrderSums = result;
            });


            //處理空白團
            let emptyGroups = db.GROUP.filter(grp=> grp.grpHostId === hostId && !db.ORDER.find(ord=>ord.grpId === grp.grpId));
            if (emptyGroups) {
                emptyGroups.map(eptGroup=> {
                    let group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({group, orders: []});
                    groupedOrderSums.push({group, orderSums: []});
                });
            }

            // console.log("groupedOrderSumsgroupedOrderSums:" + JSON.stringify(groupedOrderSums));

            resolve({
                groupedOrders: _.orderBy(groupedOrders, obj=>obj.group.grpCreateTime, 'desc'),
                // groupedOrderSums: _.sortBy(groupedOrderSums, obj=>obj.group.grpCreateTime)
                groupedOrderSums: _.orderBy(groupedOrderSums, obj=>obj.group.grpCreateTime, 'desc')
                // groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.confirmOrder = function (hostId) {
        let that = this;

        return new Promise(resolve=> {
            let groupedOrders = [];
            let groupedOrderSums = [];

            let groupIds = db.GROUP.filter(grp=>grp.grpHostId === hostId);
            let orders = db.ORDER.filter(ord=> {

                return db.GROUP.find(grp=>grp.grpId === ord.grpId).grpHostId === hostId;
            }).map(ord=> {

                let newOrd = {
                    ordId: ord.ordId,
                    grpId: ord.grpId,
                    usrId: ord.usrId,
                    usrName: ord.usrName,   //07.03 add
                    dish: db.DISH.find(d=>d.dihId === ord.dihId),
                    ordNum: ord.ordNum,
                    ordStatus: ord.ordStatus,    //07.03 add
                    ordCreateTime: new Date(ord.ordCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
                    updateOrdNum: ord.updateOrdNum ? ord.updateOrdNum : undefined,
                };
                return newOrd;
            });

            groupedOrders =
                self.convertOrdersToGroupedOrdersUsr(orders);

            self.formatOrders(groupedOrders, (result)=> {
                groupedOrderSums = result;
            });

            //處理空白團
            let emptyGroups = db.GROUP.filter(grp=> grp.grpHostId === hostId && !db.ORDER.find(ord=>ord.grpId === grp.grpId));
            if (emptyGroups) {
                emptyGroups.map(eptGroup=> {
                    let group = that.createClassGroupByGroupId(eptGroup.grpId);
                    groupedOrders.push({group, orders: []});
                    groupedOrderSums.push({group, orderSums: []});
                });
            }
            resolve({
                groupedOrders,
                groupedOrderSums: groupedOrderSums
            });
        });
    };

    this.formatOrders = function (groupedOrders, callback) {
        let groupedOrderSums = [];
        //console.log('groups',db.GROUP);
        //console.log('groupedOrdersgroupedOrdersgroupedOrders:', JSON.stringify(groupedOrders));

        for (let {group, orders} of groupedOrders) {
            let orderSums = [];

            for (let {ordId, group, usrId, dish, ordNum, ordStatus} of orders) {
                //如果存在直接加
                let order = orderSums.find(orm=>orm.dish.dihId === dish.dihId);

                if (order) {
                    order.ordNum += ordNum;
                } else {
                    orderSums.push({group, dish, ordNum});
                }
            }

            switch (group.grpStatus) {
                case 0:
                    group.grpStatusCh = "未達外送金額";
                    group.btnChangeStatusName = "未開團";
                    group.grpNextStatus = 1;
                    group.btnChangeStatusDisable = true;
                    break;
                case 1:
                    group.grpStatusCh = "已開團";
                    group.btnChangeStatusName = "確認已送達";
                    group.grpNextStatus = 2;
                    break;
                case 2:
                    group.grpStatusCh = "已送達";
                    group.btnChangeStatusName = "確認訂單已完成";
                    group.grpNextStatus = 3;
                    break;
                case 3:
                    group.grpStatusCh = "已完成";
                    group.btnChangeStatusName = "重新開團";
                    group.grpNextStatus = 4;
                    break;
                case -1:
                    group.grpStatusCh = "開團失敗";
                    group.btnChangeStatusName = "";
                    group.btnChangeStatusDisable = true;
                    group.grpNextStatus = -2;
                    break;
            }

            groupedOrderSums.push({group, orderSums});
        }


        callback(groupedOrderSums);
    };

    this.createClassMerchantById = function (metId) {
        let result = _.cloneDeep(db.MERCHANT.find(merchant=>merchant.metId === metId));
        result.menu = _.filter(db.DISH, (dish)=>dish.metId === metId);
        return result;
    };

    this.createClassGroupByGroupId = function (grpId) {
        let that = this;
        let group = db.GROUP.find(g=>g.grpId === grpId);

        if (!group) {
            return null;
        }

        let menu = [];
        let grpComments = [];
        let grpDishes = _.filter(db.GROUP_DISHES, grh => grh.grpId === group.grpId).map(grh=> {
                let grpDish = {};
                grpDish.dish = _.find(db.DISH, dish=> dish.dihId === grh.dihId);
                _.assign(grpDish, grh);
                return grpDish;
            }) || [];
        grpDishes.map(grpDish=> {

            //檢查是否已經存在DISH的分類.
            let dihGroup = menu.find(dgp => dgp.dihType === grpDish.dish.dihType);
            if (dihGroup) {
                //已經有了就加入壹筆
                dihGroup.dishes.push(grpDish.dish);
            } else {
                //如果沒有加入新的分類,和壹筆DISH
                menu.push({dihType: grpDish.dish.dihType, dishes: [grpDish.dish]});
            }
        });

        let merchant = db.MERCHANT.find(merchant => merchant.metId === group.metId);

        // grpComments.push(db.GROUP_MEMBER.filter(g=>g.grpId === grpId));


        let grpCom = db.GROUP_MEMBER.filter(g=>g.grpId === grpId);

        for (let gc of grpCom) {
            if (gc.comments) {
                grpComments.push({
                    gmrId: gc.gmrId,
                    usrId: gc.usrId,
                    usrName: gc.usrName,
                    comStatus: gc.comStatus,
                    comments: gc.comments
                });
            }
        }


        group = {
            grpId: group.grpId,
            grpAddr: group.grpAddr,
            grpTime: new Date(group.grpTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpHostName: (db.USER.find(user => user.usrId === group.grpHostId)).usrName,
            merchant: merchant,
            grpOrder: _.filter(db.GROUP_ORDER, (grr)=> grr.grpId === group.grpId) || [],
            grpDishes: grpDishes,
            grpHost: that.createUserByUserId(group.grpHostId),
            grpStatus: group.grpStatus,
            menu: menu,
            grpCreateTime: new Date(group.grpCreateTime).pattern('yyyy/MM/dd hh:mm:ss'),
            grpAmount: group.grpAmount || 0,
            grpReachRatePercent: 100 * ((group.grpAmount || 0) / merchant.metMinPrice > 1 ? 1 : (group.grpAmount || 0) / merchant.metMinPrice),
            grpAmountLimit: group.grpAmountLimit,
            grpComments: grpComments
        };

        return group;
    };

    this.createUserByUserId = function (usrId) {
        let _usr = db.USER.find(usr=>usr.usrId === usrId);
        let user = {
            usrId: _usr.usrId,
            usrName: _usr.usrName,
            usrMobi: _usr.usrMobi
        };

        return user;
    };

    this.updateGroupStatusPromise = function (grpId, grpStatus) {
        return new Promise((resolve, reject)=> {
            let group = db.GROUP.find(s=>grpId === s.grpId);

            if (group.grpStatus >= 0 && group.grpStatus <= 2) {
                db.setValueToDb('GROUP', row=>row.grpId === group.grpId, 'grpStatus', grpStatus);
                //group.grpStatus = grpStatus;

                resolve({success: 1});
            }
            else {
                reject({success: 0});
            }
        });

    };

    this.cleanGroup = function () {
        let today = new Date();

        this.allGroup(function (result) {
            //let timing = result[0].grpTime.replace(/月/,"/");
            //console.log(result[0].grpTime);
            //console.log(JSON.stringify(result));
        });


        //let t = setTimeout('Timer()', 500);
    };

    this.getStatus = function (grpId) {
        return new Promise(resolve=> {
            let status = db.GROUP.find(g=>grpId === g.grpId).grpStatus;
            resolve(status);
        });
    };

    this.getComment = function (gmrId, comStatus) {
        return new Promise(resolve=> {
            //TODO
            let comments = db.GROUP_MEMBER.find(g=>g.grpId === grpId && g.usrId === usrId).comments;
            resolve(comments);
        });
    };

    this.updateOrdStatusPromise = function (ordId, ordStatus) {
        //一次只能修改一個ordId的ordStatus
        return new Promise((resolve, reject)=> {
            let order = db.ORDER.find(s=>ordId === s.ordId);

            if (order.ordStatus === 3 && ordStatus === -1) {
                db.setValueToDb('ORDER', row=>row.ordId === order.ordId, 'ordStatus', 1);
                db.setValueToDb('ORDER', row=>row.ordId === order.ordId, 'updateOrdNum', undefined);
                return;
            }

            if (order.ordStatus != -1) {
                db.setValueToDb('ORDER', row=>row.ordId === order.ordId, 'ordStatus', ordStatus);
                if (order.updateOrdNum && order.updateOrdNum !== 0) {
                    // console.log('updateOrdStatusPromise====order.updateOrdNum', order.updateOrdNum);
                    db.setValueToDb('ORDER', row=>row.ordId === order.ordId, 'ordNum', order.ordNum + order.updateOrdNum);
                    db.setValueToDb('ORDER', row=>row.ordId === order.ordId, 'updateOrdNum', undefined);
                }
                resolve({success: 1});
            } else {
                reject({success: 0});
            }
        });
    };

    this.getGrpUsersOrdersByHostIdPromise = function (hostId, from) {
        //from :  0=> confirmOrder  , 1=>productDetail
        return new Promise(resolve=> {
            switch (from) {
                case 0:
                {
                    self.confirmOrder(hostId).then(result=> {
                        //  WHAT THE FUCK
                        // console.log('switch 0');
                        let GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders([0, 3], result).GrpUsersOrders.filter(function (guo) {
                            // guo.usrOrders = guo.usrOrders.filter(uo=>uo.ordStatus === 0);
                            // console.log('====guo.usrOrders:' + JSON.stringify(guo.usrOrders));
                            return guo.usrOrders.length !== 0 && guo.group.grpStatus !== -1;
                        });
                        // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
                        resolve({GrpUsersOrders: GrpUsersOrders});
                    });
                    break;
                }
                case 1:
                {
                    self.getGroupedOrdersAndSumsByHostIdPromise(hostId).then(result=> {
                        // console.log('switch 1');
                        let GrpUsersOrders = self.convertGroupedOrdersToGrpUsrOrders([1, 2, 3], result);
                        // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
                        resolve(GrpUsersOrders);
                    });
                    break;
                }
            }
        });
    };

    this.convertGroupedOrdersToGrpUsrOrders = function (ordStatus, result) {
        let GrpUsersOrders = {
            GrpUsersOrders: []
        };
        // console.log('====result:' + JSON.stringify(result.groupedOrders));

        for (let grpOrd of result.groupedOrders) {
            let uos = [];
            let grpComments = grpOrd.group.grpComments;

            for (let order of grpOrd.orders) {
                // console.log(_.includes(ordStatus, order.ordStatus));
                if (_.includes(ordStatus, order.ordStatus)) {

                    order.dish.ordNum = order.ordNum;
                    order.ordNum = undefined;
                    // console.log('====order:' + JSON.stringify(order));

                    let uosobj = uos.find(u=>u.usrId === order.usrId);
                    if (!uosobj) {
                        uos.push({
                            usrId: order.usrId,
                            usrName: order.usrName,
                            usrAmount: order.dish.ordNum * order.dish.dihPrice,
                            // ordStatus: order.ordStatus,
                            usrDishes: [{
                                dihId: order.dish.dihId,
                                dihName: order.dish.dihName,
                                metId: order.dish.metId,
                                dihType: order.dish.dihType,
                                dihPrice: order.dish.dihPrice,
                                ordNum: order.dish.ordNum,
                                updateOrdNum: order.updateOrdNum ? order.updateOrdNum : undefined,
                            }],
                            usrComments: _.filter(grpComments, (com) => com.usrId === order.usrId),
                            usrOrds: [{ordId: order.ordId, ordStatus: order.ordStatus}]
                            // 無法理解錯在哪裡
                            // ,usrDishesWhy: [order.dish]
                        });
                        // console.log('====order.dish:' + JSON.stringify(order.dish));

                    } else {
                        uosobj.usrAmount = uosobj.usrAmount + order.dish.ordNum * order.dish.dihPrice;
                        // uosobj.usrDishes.push(order.dish);
                        uosobj.usrDishes.push({
                            dihId: order.dish.dihId,
                            dihName: order.dish.dihName,
                            metId: order.dish.metId,
                            dihType: order.dish.dihType,
                            dihPrice: order.dish.dihPrice,
                            ordNum: order.dish.ordNum,
                            updateOrdNum: order.updateOrdNum ? order.updateOrdNum : undefined,
                        });
                        uosobj.usrOrds.push({ordId: order.ordId, ordStatus: order.ordStatus});
                    }
                }
            }
            GrpUsersOrders.GrpUsersOrders.push({
                group: grpOrd.group,
                usrOrders: uos
            });
        }

        // console.log('====GrpUsersOrders:' + JSON.stringify(GrpUsersOrders));
        return GrpUsersOrders;
    };

    this.sendMail = function (usrMail, subject, html) {

        if (usrMail && subject && html) {
            mailTransport.sendMail({
                from: 'o.grpbuy@gmail.com',
                to: usrMail,
                subject: subject,
                html: html
            }, function (err) {
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
        }
    };

    this.refuseOrder = function (usrId, grpId, usrOrds, callback) {
        //TODO  use ordId 、usrOrds
        let orders = db.ORDER.filter(ord => ord.usrId === usrId && ord.grpId === grpId);
        console.log('====usrOrds', JSON.stringify(usrOrds));
        if (orders) {
            let dishes = '';
            for (let order of orders) {
                let dihName = db.DISH.find(dih=>dih.dihId === order.dihId).dihName;
                dishes += '<li>' + dihName + '  ' + order.ordNum + '份</li>'
            }
            // console.log(JSON.stringify(orders));
            console.log('====dishes', dishes);

            let g = db.GROUP.find(g=>g.grpId === grpId);
            let metId = g.metId;
            let metName = db.MERCHANT.find(m=>m.metId === metId).metName;
            let ordCreateTime = orders[0].ordCreateTime;
            let hostName = db.USER.find(usr=>usr.usrId === g.grpHostId).usrName;

            // 通知團員訂單被拒絕
            let usrMail = db.USER.find(usr=>usr.usrId === usrId).usrMail;
            let subject = '販團 : 很不幸的 - 您的申請遭到拒絕';
            let jointime = new Date(ordCreateTime);

            let html = '<p>申請時間: ' + (jointime.getMonth() + 1) + '/' + jointime.getDate() + ' ' + jointime.getHours() + ':' + (jointime.getMinutes() < 10 ? '0' + jointime.getMinutes() : jointime.getMinutes()) + '</p>' +
                '<p>申請團購: ' + metName + '</p>' +
                '<p>團主 : ' + hostName + '</p>' +
                '<br><p>訂購項目: </p><ul>' + dishes + '</ul>' +
                '<br><br><br><p>信件由販團系統自動發送: <a href="http://bit.do/groupbuy">http://bit.do/groupbuy</a> </p>';

            console.log('usrMail , metName ', usrMail, metName);

            self.sendMail(usrMail, subject, html);

            callback({success: 1});
        }
        else {
            callback({success: 0});
        }
    };

    ///////////////////後臺

    //給資料表新增壹個row
    app.post('/:adminPwd/table/:tableName', function (req, res) {
        if (req.params.adminPwd !== 'fHfKJp3iSAfhvd9fjn23Z5KMA6Sd') {
            res.json({success: false});
        }

        try {
            req.body = JSON.parse(req.body.data);
            let rows = req.body.rows;
            for (let row of rows) {
                db.pushToDb(req.params.tableName, row);
            }
            res.json({success: true});
        } catch (e) {

            res.json({success: false});
        }


    });


}


module.exports = Server;
