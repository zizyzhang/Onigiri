'use strict';

class Database {
    static db = {};
    static mongoDb = null;
    static debug = false;

    //option : {debug:如果为true,不会存储到mongodb}
    constructor(_mongoDb, option) {

        Database.mongoDb = _mongoDb;
        Database.debug = !!option.debug;
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


}

module.exports = Database;

