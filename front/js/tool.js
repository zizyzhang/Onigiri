/**
 * Created by Zizy on 4/5/16.
 */
let $$ = Dom7;


let Tool = function () {
    //把一个返回值为Json类型的Promise通过page对应的template加载到page中,当Json为Array时自动把该Array放入data中.
    this.loadTemplateFromJsonPromise = function (promise, page, callback) {
        promise().then((data)=> {
            $$.get(page.url, (template)=> {
                let compiledTemplate = Template7.compile(template);
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
    };
};

module.exports = new Tool();
