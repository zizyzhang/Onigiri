var AjaxMethods = function(){
    this.SERVER_ADS = "http://localhost:3000";

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
        //var usrName = $$('#txtUsrName').val();
        //var usrPwd = $$('#txtUsrPwd').val();
        //
        //console.log(usrName, usrPwd);
        //
        //$$.post(SERVER_ADS + "/userAuth", {usrName: usrName, usrPwd: usrPwd}, function (result) {
        //    result = JSON.parse(result);
        //    console.log(result.success);
        //    if (result.success == 1) {
        myApp.closeModal();
        mainView.router.loadPage({url: 'group.html'});
        //    }
        //});

    }

    this.allGroup= function() {

        $$.get("http://localhost:3000/allGroup", function (data) {
            allGroupList = data;

            var GroupList = $$("#allGroupList");
            GroupList.html("");

            for (var i = 0; i < data.length; i++) {
                var compiled = _.template($$('#tpl').html());
                GroupList.html(GroupList.html() + compiled({
                        grpHostId: data[i].grpHostId,
                        metId: data[i].metId,
                        grpAddr: data[i].grpAddr,
                        grpTime: data[i].grpTime
                    }));
            }
        });
    }
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

