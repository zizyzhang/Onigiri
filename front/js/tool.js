'use strict';
/**
 * Created by Zizy on 4/5/16.
 */
let $$ = Dom7;


class Tool {

    //把一个返回值为Json类型的Promise通过page对应的template加载到page中,当Json为Array时自动把该Array放入data中.
    loadTemplateFromJsonPromise(promise, page, callback) {

        promise.then((data)=> {
            $$.get(page.url, (template)=> {
                console.log(data);
                let compiledTemplate = Template7.compile(template.substring(template.indexOf('>') + 1, template.lastIndexOf('<')));
                let html = '';
                if (Array.isArray(data)) {
                    html = compiledTemplate({data});
                } else {
                    html = compiledTemplate(data);
                }


                $$(page.container).html(html);

                if (callback) {
                    callback();
                }
            });
        });
    }

    //把一个返回值为Json类型的Promise通过page(带有可以被卷动时隐藏的navBar)对应的template加载到page中,当Json为Array时自动把该Array放入data中.
    loadTemplateWithHideNavBarFromJsonPromise(myApp, promise, page, callback) {
        this.loadTemplateFromJsonPromise(promise, page, ()=> {
            callback();
            myApp.initPageScrollToolbars(page.container);
        });
    }
}

module.exports = new Tool();
