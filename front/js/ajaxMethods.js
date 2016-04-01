var $$ = Dom7;
var SERVER_ADS = "http://localhost:3000";

var AjaxMethods = function(){

    this.addUser= function() {
        var subname = $$('#subAccount').val();
        var subpwd = $$('#subPwd').val();
        var submobile = $$('#subMobile').val();
        $$.post(SERVER_ADS + "/addUser", {usrName: subname, usrPwd: subpwd, usrMobi: submobile}, function (result) {
            if (result) {

            }
        });
    }

   this.userAuth= function() {
       return new Promise(function(resolve,reject){
           var usrName = $$('#txtUsrName').val();


           var usrPwd = $$('#txtUsrPwd').val();


           $$.post(SERVER_ADS + "/userAuth", {usrName: usrName, usrPwd: usrPwd}, function (result) {
               if(JSON.parse(result).success == 1 ){
                   console.log('login success');

                   resolve();
               }else{
                   reject();
               }
           });
       });


    };

    this.getAllGroup = function() {
        return new Promise(function (resolve, reject) {
            $$.get(SERVER_ADS+"/allGroup", function (data) {
                resolve(data);
            });

        });


    };

    this.allMerchant= function() {

        $$.get(SERVER_ADS + "/allMerchant", function (data) {
            allMerchantList = data;
        });
    }

    this.merchantById= function(id) {
        console.log(id);
        $$.get(SERVER_ADS + "/merchantById" + id, function (data) {
            merchant = data;
        });
    }

    this.group= function() {

        //$$.post("http://localhost:3000/group",{grpHostId:,[],metId:,addr:,gorTime:,minAmount:},function(){
        //
        //});
    }

    this.joinGroup= function() {
        //$$.post("http://localhost:3000/joinGroup",{usrId:,[],grpId:},function(){
        //
        //});
    }

};


module.exports = new AjaxMethods();

