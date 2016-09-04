'use strict';

class Database {
    static db = {};
    static mongoDb = null;
    static debug = false;

    //option : {debug:如果为true,不会存储到mongodb}
    constructor (_mongoDb,option) {
        if(option&&option.debug) {
            Database.debug = true;

        }

        Database.mongoDb = _mongoDb;

        Database.db.pushToDb=function(table, value) {

            //jsonDb.push('/db/' + table + '[]', value);
            if(Database.debug){
                value._id = 'r'+new Date().getTime();
                Database.db[table].push(value);

            }else{
                Database.mongoDb.collection(table).insertOne(value).then(r=> {
                    value._id = r.insertedId;
                    Database.db[table].push(value);
                 }).catch(e=>console.log(e));
            }
        }

        Database.db.delFromJsonDb=function(table, condition) {
            let index = Database.db[table].findIndex(condition);
            Database.db[table].splice(index, 1);
            !Database.debug && Database.mongoDb.collection(table).deleteOne({_id: Database.db[table][index]._id});

            //jsonDb.delete(`/Database.db/${table}[${index}]`);
        }

        Database.db.setValueToDb=function(table, condition, setKey, newValue) {
            // console.log(Database.db[table]);
            let index = Database.db[table].findIndex(condition);
            let oldObj = Database.db[table][index][setKey] = newValue;
            let set = {};
            set[setKey] = newValue;
            !Database.debug && Database.mongoDb.collection(table).updateOne({_id: Database.db[table][index]._id}, {$set: set}).catch(e=>console.log(e));

            //jsonDb.push('/db/' + table + `[${index}]`, oldObj);
            //    db[table].push(value);
        }


        Database.db.pushToDbPromise=function(table, value) {
            return new Promise((resolve, reject)=> {
                if(Database.debug){
                    value._id = 'r'+new Date().getTime();
                    Database.db[table].push(value);
                    resolve();

                }else{
                    Database.mongoDb.collection(table).insertOne(value).then(r=> {
                        value._id = r.insertedId;
                        Database.db[table].push(value);
                        resolve();
                    }).catch(e=>reject(e));
                }
            });

        }

        Database.db.delFromJsonDbPromise=function(table, condition) {
            return new Promise((resolve, reject)=> {

                let index = Database.db[table].findIndex(condition);
                Database.db[table].splice(index, 1);
                !Database.debug && Database.mongoDb.collection(table).deleteOne({_id: Database.db[table][index]._id}).then(r=> {
                    resolve();
                }).catch(e=>reject(e));

            });
        }

        Database.db.setValueToDbPromise=function(table, condition, setKey, newValue) {

            return new Promise((resolve, reject)=> {

                let index = Database.db[table].findIndex(condition);
                let oldObj = Database.db[table][index][setKey] = newValue;
                let set = {};
                set[setKey] = newValue;
                !Database.debug && Database.mongoDb.collection(table).updateOne({_id: Database.db[table][index]._id}, {$set: set}).catch(e=>console.log(e)).then(r=>{
                    resolve();
                }).catch(e=>reject(e));
            });
        }

    }

    toMemory(){
        return new Promise(async resolve=>{
            await Database.mongoDb.collection('DISH').find({}).toArray().then(r=>Database.db.DISH = r);
            await Database.mongoDb.collection('FOLLOW').find({}).toArray().then(r=>Database.db.FOLLOW = r);
            await Database.mongoDb.collection('GROUP').find({}).toArray().then(r=>Database.db.GROUP = r);
            await Database.mongoDb.collection('GROUP_DISHES').find({}).toArray().then(r=>Database.db.GROUP_DISHES = r);
            await Database.mongoDb.collection('GROUP_MEMBER').find({}).toArray().then(r=>Database.db.GROUP_MEMBER = r);
            await Database.mongoDb.collection('GROUP_ORDER').find({}).toArray().then(r=>Database.db.GROUP_ORDER = r);
            await Database.mongoDb.collection('MERCHANT').find({}).toArray().then(r=>Database.db.MERCHANT = r);
            await Database.mongoDb.collection('ORDER').find({}).toArray().then(r=>Database.db.ORDER = r);
            await Database.mongoDb.collection('USER').find({}).toArray().then(r=>Database.db.USER = r);
            resolve(Database.db);
        })

    }

    pushToDb(table, value) {

        //jsonDb.push('/db/' + table + '[]', value);
        console.log(Database.mongoDb);

        !Database.debug && Database.mongoDb.collection(table).insertOne(value).then(r=> {
            value._id = r.insertedId;
            Database.db[table].push(value);
        });
    }

    delFromJsonDb(table, condition) {
        let index = Database.db[table].findIndex(condition);
        Database.db[table].splice(index, 1);
        !Database.debug && Database.mongoDb.collection(table).deleteOne({_id: Database.db[table]._id});

        //jsonDb.delete(`/Database.db/${table}[${index}]`);
    }

    setValueToDb(table, condition, setKey, newValue) {
        // console.log(Database.db[table]);
        let index = Database.db[table].findIndex(condition);
        let oldObj = Database.db[table][index][setKey] = newValue;
        let set = {};
        set[setKey] = newValue;
        !Database.debug && Database.mongoDb.collection(table).updateOne({_id: Database.db[index]._id}, {$set: set}).catch(e=>console.log(e));

        //jsonDb.push('/db/' + table + `[${index}]`, oldObj);
        //    db[table].push(value);
    }


    pushToDbPromise(table, value) {
        return new Promise((resolve, reject)=> {
            !Database.debug && Database.mongoDb.collection(table).insertOne(value).then(r=> {
                value._id = r.insertedId;
                Database.db[table].push(value);
                resolve();
            }).catch(e=>reject(e));
        });

    }

    delFromJsonDbPromise(table, condition) {
        return new Promise((resolve, reject)=> {

            let index = Database.db[table].findIndex(condition);
            Database.db[table].splice(index, 1);
            !Database.debug && Database.mongoDb.collection(table).deleteOne({_id: Database.db[table]._id}).then(r=> {
                resolve();
            }).catch(e=>reject(e));

        });
    }

    setValueToDbPromise(table, condition, setKey, newValue) {

        return new Promise((resolve, reject)=> {

            let index = Database.db[table].findIndex(condition);
            let oldObj = Database.db[table][index][setKey] = newValue;
            let set = {};
            set[setKey] = newValue;
            !Database.debug && Database.mongoDb.collection(table).updateOne({_id: Database.db[index]._id}, {$set: set}).catch(e=>console.log(e)).then(r=>{
                resolve();
            }).catch(e=>reject(e));
        });
    }

    debug(isDebug){
        debug = isDebug;
     }


}

module.exports = Database;

