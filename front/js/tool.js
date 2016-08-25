'use strict';

/**
 * Created by Zizy on 4/5/16.
 */

let $$ = Dom7;
let _ = require('lodash');
let Vue = require('vue');


class Tool {


    isNumeric(str) {
        var numeric = /^[-+]?[0-9]+$/;
        return numeric.test(str);
    }

    //把一个返回值为Json类型的Promise通过page对应的template加载到page中,当Json为Array时自动把该Array放入data中.
    loadTemplateFromJsonPromise(myApp, promise, page, callback) {
        let template = $$(page.container).html();
        $$(page.container).html(_.replace(template, /\{\{[^\}\{]*\}\}/gi, ' '));

        promise.then((data)=> {
            console.log(data);

            let html = '';
            let compiledTemplate = Template7.compile(template);
            if (Array.isArray(data)) {
                html = _.replace(compiledTemplate({data}), /(<img .*)(srcUrl)/gi, '$1src');
            } else {
                html = _.replace(compiledTemplate(data), /(<img .*)(srcUrl)/gi, '$1src');
            }


            $$(page.container).html(html);
            myApp.initPage(page.container);

            if (callback) {
                if (Array.isArray(data)) {
                    callback({data});
                } else {
                    callback(data);
                }
            }


        });
    }


    // 包裝loadPage和load, 先得到數據, 再跳轉, 回傳data放置在query.ajaxResult裡面
    /*
     url: 需要跳轉的URL
     ajaxPromise : option 數據
     */
    loadPage(target, mainView, ajaxPromise) {
        let loadFunc = function (data) {
            if (typeof target === 'string') {
                mainView.router.load({url:target,query:{ajaxResult:data}});
            } else {

                if(!target.query){
                    target.query={};
                }

                target.query.ajaxResult=data;

                mainView.router.load(target);
            }
         };

        if (ajaxPromise) {
            ajaxPromise.then((data)=> {
                console.log('ajaxPromise in toll.js',data);
                loadFunc(data);

            });
        } else {
            loadFunc();
        }

    }


}

module.exports = new Tool();
