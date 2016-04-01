var SERVER_ADS = "http://localhost:3000";

// Initialize app
var myApp = new Framework7({
    modalTitle: 'Onigiri',
    // Enable Material theme
    material: true
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    //dynamicNavbar: true,
});

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.hideIndicator();
});

//myApp.onPageInit('about', function (page) {
//    // Do something here for "about" page
//    myApp.alert("hi");
//})
//
$$(document).on('pageInit', function (e) {
    // Do something here when page loaded and initialized
});

myApp.onPageBeforeInit('group', function () {
    console.log('before group init')
});

// TODO CHEAT
(function(){
    myApp.closeModal('.login-screen');
    mainView.router.loadPage('order.html');
})();

$$('#txtUsrName').on('focus',function(){
    $$('.usrName').css('color', 'white !important');
});


$$('#btn-sign-up').click(function () {
    if ($$('#subPwd').val() === $$('#confirmPwd').val()) {
        addUser();
    }
    else {
        console.log("error subSignUp");
    }
});

$$('#btn-login').click(function () {
    console.log('here');
    userAuth();
});

//$$("#tpl").load('./template/todoItem.html', null, function () {
//    allGroup();
//});


function addUser() {
    var subname = $$('#subAccount').val();
    var subpwd = $$('#subPwd').val();
    var submobile = $$('#subMobile').val();
    $$.post(SERVER_ADS + "/addUser", {usrName: subname, usrPwd: subpwd, usrMobi: submobile}, function (result) {
        if (result) {

        }
    });
}

function userAuth() {
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

function allGroup() {

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
function allMerchant() {

    $$.get(SERVER_ADS + "/allMerchant", function (data) {
        allMerchantList = data;
    });
}

function merchantById(id) {
    console.log(id);
    $$.get(SERVER_ADS + "/getMerchantById" + id, function (data) {
        merchant = data;
    });
}

function group() {

    //$$.post("http://localhost:3000/group",{grpHostId:,[],metId:,addr:,gorTime:,minAmount:},function(){
    //
    //});
}

function joinGroup() {
    //$$.post("http://localhost:3000/joinGroup",{usrId:,[],grpId:},function(){
    //
    //});
}
