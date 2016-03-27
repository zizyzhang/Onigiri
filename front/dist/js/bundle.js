/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

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
	});

	$$('#cheat').click(function () {
	    myApp.closeModal('.login-screen');

	    mainView.router.loadPage('group.html');
	});

	$$('#btn-sign-up').click(function () {
	    if ($$('#subPwd').val() === $$('#confirmPwd').val()) {
	        addUser();
	    } else {
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
	    $$.post(SERVER_ADS + "/addUser", { usrName: subname, usrPwd: subpwd, usrMobi: submobile }, function (result) {
	        if (result) {}
	    });
	}

	function userAuth() {
	    var usrName = $$('#txtUsrName').val();
	    var usrPwd = $$('#txtUsrPwd').val();

	    console.log(usrName, usrPwd);

	    $$.post(SERVER_ADS + "/userAuth", { usrName: usrName, usrPwd: usrPwd }, function (result) {
	        result = JSON.parse(result);
	        console.log(result.success);
	        if (result.success == 1) {
	            myApp.closeModal();
	            mainView.router.loadPage({ url: 'group.html' });
	        }
	    });
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
	    $$.get(SERVER_ADS + "/merchantById" + id, function (data) {
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

/***/ }
/******/ ]);