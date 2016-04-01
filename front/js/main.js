var ajaxMethod  = require('./ajaxMethods.js');

console.log(JSON.stringify(ajaxMethod));

// Initialize app
var myApp = new Framework7({
    modalTitle: 'Onigiri',
    // Enable Material theme
    material: true
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var dish = 1;
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
    console.log('before group init');
    $$('#btnJoinInGroupPage').on('click', function () {
        mainView.router.loadPage('order.html');
    });

});

myApp.onPageBeforeInit('group-detail', function () {
    console.log('before group init');
    $$('#btnJoin').on('click', function () {
        mainView.router.loadPage('order.html');
    });

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
(function () {
    //myApp.closeModal('.login-screen');
    //
    //mainView.router.loadPage('group-setting.html');

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
    console.log('here');
    ajaxMethod.userAuth();
});


//$$("#tpl").load('./template/todoItem.html', null, function () {
//    allGroup();
//});


