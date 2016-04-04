/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./front/js/main.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ajaxMethod = __webpack_require__(/*! ./ajaxMethods.js */ 1);
	
	console.log(JSON.stringify(ajaxMethod));
	
	// Initialize app
	var myApp = new Framework7({
	    modalTitle: 'Onigiri',
	    //template7Pages: true,
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
	        //mainView.router.loadPage('order.html');
	        console.log($$(this).attr('metId'));
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
	    myApp.closeModal('.login-screen');
	
	    mainView.router.loadPage('group.html');
	})();
	
	$$('#txtUsrName').on('focus', function () {
	    $$('.usrName').css('color', 'white !important');
	});
	
	$$('#btn-sign-up').click(function () {
	    if ($$('#subPwd').val() === $$('#confirmPwd').val()) {
	        ajaxMethod.addUser();
	    } else {
	        console.log("error subSignUp");
	    }
	});
	
	$$('#btn-login').click(function () {
	
	    ajaxMethod.userAuth().then(function () {
	        //加载AllGroup
	        return ajaxMethod.getAllGroup();
	    }).then(function (groups) {
	        console.log(groups);
	
	        myApp.closeModal();
	        mainView.router.loadPage({ url: 'group.html' });
	    }).catch(function () {
	        myApp.alert('登录失败');
	    });
	});
	
	//$$("#tpl").load('./template/todoItem.html', null, function () {
	//    allGroup();
	//});

/***/ },
/* 1 */
/*!*********************************!*\
  !*** ./front/js/ajaxMethods.js ***!
  \*********************************/
/***/ function(module, exports) {

	'use strict';
	
	var $$ = Dom7;
	var SERVER_ADS = "http://localhost:3000";
	
	var AjaxMethods = function AjaxMethods() {
	
	    this.addUser = function () {
	        var subname = $$('#subAccount').val();
	        var subpwd = $$('#subPwd').val();
	        var submobile = $$('#subMobile').val();
	        $$.post(SERVER_ADS + "/addUser", { usrName: subname, usrPwd: subpwd, usrMobi: submobile }, function (result) {
	            if (result) {}
	        });
	    };
	
	    this.userAuth = function () {
	        return new Promise(function (resolve, reject) {
	            var usrName = $$('#txtUsrName').val();
	
	            var usrPwd = $$('#txtUsrPwd').val();
	
	            $$.post(SERVER_ADS + "/userAuth", { usrName: usrName, usrPwd: usrPwd }, function (result) {
	                if (JSON.parse(result).success == 1) {
	                    console.log('login success');
	
	                    resolve();
	                } else {
	                    reject();
	                }
	            });
	        });
	    };
	
	    this.getAllGroup = function () {
	        return new Promise(function (resolve, reject) {
	            $$.get(SERVER_ADS + "/allGroup", function (data) {
	                resolve(data);
	            });
	        });
	    };
	
	    this.allMerchant = function () {
	
	        $$.get(SERVER_ADS + "/allMerchant", function (data) {
	            allMerchantList = data;
	        });
	    };
	
	    this.merchantById = function (id) {
	        console.log(id);
	        $$.get(SERVER_ADS + "/merchantById" + id, function (data) {
	            merchant = data;
	        });
	    };
	
	    this.group = function () {
	
	        //$$.post("http://localhost:3000/group",{grpHostId:,[],metId:,addr:,gorTime:,minAmount:},function(){
	        //
	        //});
	    };
	
	    this.joinGroup = function () {
	        //$$.post("http://localhost:3000/joinGroup",{usrId:,[],grpId:},function(){
	        //
	        //});
	    };
	};
	
	module.exports = new AjaxMethods();

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map