
var allGroupList = [];
var allMerchantList = [];
var merchant = [];

$(document).ready(function () {
    $('#subSignUp').click(function () {
        if ($('#subPwd').val() === $('#confirmPwd').val()) {
            addUser();
        }
        else {
            console.log("error subSignUp");
        }
    });

    $('#login').click(function () {
        //console.log('log in')
        userAuth();
    });

    $("#tpl").load('./template/todoItem.html', null, function () {
        allGroup();
    });


});

function addUser() {
    var subname = $('#subAccount').val();
    var subpwd = $('#subPwd').val();
    var submobile = $('#subMobile').val();
    $.post("http://localhost:3000/addUser", {usrName: subname, usrPwd: subpwd, usrMobi: submobile}, function () {

    });
}

function userAuth() {
    var username = $('#account').val();
    var userpwd = $('#pwd').val();
    $.post("http://localhost:3000/userAuth", {usrName: username, usrPwd: userpwd}, function () {

    });

}

function allGroup() {

    $.get("http://localhost:3000/allGroup", function (data) {
        allGroupList = data;

        var GroupList = $("#allGroupList");
        GroupList.html("");

        for (var i = 0; i < data.length; i++) {
            var compiled = _.template($('#tpl').html());
            GroupList.html(GroupList.html() + compiled({
                    grpHostId: data[i].grpHostId,
                    metId: data[i].metId,
                    grpAddr: data[i].grpAddr,
                    grpTime: data[i].grpTime
                }));
        }
    });
}
function allMerchant() {

    $.get("http://localhost:3000/allMerchant", function (data) {
        allMerchantList = data;
    });
}

function merchantById(id) {
    console.log(id);
    $.get("http://localhost:3000/getMerchantById" + id, function (data) {
        merchant = data;
    });
}

function group() {

    //$.post("http://localhost:3000/group",{grpHostId:,[],metId:,addr:,gorTime:,minAmount:},function(){
    //
    //});
}

function joinGroup() {
    //$.post("http://localhost:3000/joinGroup",{usrId:,[],grpId:},function(){
    //
    //});
}
