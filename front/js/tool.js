'use strict';
/**
 * Created by Zizy on 4/5/16.
 */
let $$ = Dom7;


class Tool {

    //把一个返回值为Json类型的Promise通过page对应的template加载到page中,当Json为Array时自动把该Array放入data中.
    loadTemplateFromJsonPromise(myApp, promise, page, callback) {

        promise.then((data)=> {
            console.log(data);

            let template = $$(page.container).html()
            $$(page.container).html('');

            let html = '';
            let compiledTemplate = Template7.compile(template);
            if (Array.isArray(data)) {
                html = compiledTemplate({data});
            } else {
                html = compiledTemplate(data);
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


}

module.exports = new Tool();
