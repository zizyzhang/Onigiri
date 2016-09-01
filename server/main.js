/**
 * Created by Zizy on 8/30/16.
 */
require('source-map-support').install();
require('babel-polyfill');

let {Server,connectMongo} = require('./server.js');

(async  function(){
    //#######################connect database
    let db ;
    await connectMongo().then(res=>db=res);

    //#######################start express

    new Server(db);
})();


