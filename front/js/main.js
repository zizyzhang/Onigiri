let ajaxMethod = require('./ajaxMethods.js'),
    tool = require('./tool.js'),
    GroupPage = require('./pages/group.js'),
    GroupDetailPage = require('./pages/group-detail.js');

// Initialize app
let myApp = new Framework7({
    modalTitle: 'Onigiri',
    template7Pages: true,
    // Enable Material theme
    material: true,

});


// If we need to use custom DOM library, let's save it to $$ letiable:
let $$ = Dom7;
let dish = 1;
// Add view
let mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    //dynamicNavbar: true,
    contentCache: true
});

//加载page,绑定page的event
let pageEventBind = function () {
    new GroupPage(myApp, mainView);
    new GroupDetailPage(myApp, mainView);
}();

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




myApp.onPageBeforeInit('group-setting', function () {
    $$('#btnFinish').on('click', function () {
        myApp.alert('开团完成!', function () {
            mainView.router.loadPage('group.html');
        });
    });
});

myApp.onPageBeforeInit('order', function () {
    console.log('before order init');


    $$('#add').click(function () {
        $$('#dish').html(++dish);
        console.log("++");

    });
    $$('#subtraction').click(function () {
        if ($$('#dish').html() >= 1) {
            $$('#dish').html(--dish);

        }
        console.log("--");

    });

});


// TODO CHEAT
(() => {
    ajaxMethod.getAllGroup().then(function (groups) {
        myApp.closeModal();
        mainView.router.loadPage({url: 'group.html'});

    });
})();

$$('#txtUsrName').on('focus', function () {
    $$('.usrName').css('color', 'white !important');
});


$$('#btn-sign-up').click(function () {
    if ($$('#subPwd').val() === $$('#confirmPwd').val()) {
        ajaxMethod.addUser();
    }
    else {
        console.log("error subSignUp");
    }
});

$$('#btn-login').click(function () {


    ajaxMethod.userAuth().then(function (groups) {
        myApp.closeModal();
        mainView.router.loadPage({url: 'group.html'});
    }).catch(function () {
        myApp.alert('登录失败');
    });

});


//$$("#tpl").load('./template/todoItem.html', null, function () {
//    allGroup();
//});


