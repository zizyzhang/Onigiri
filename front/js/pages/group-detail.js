/**
 * Created by Zizy on 4/6/16.
 */
let ajaxMethod = require('../ajaxMethods.js');
let $$ = Dom7;
let myApp = null, mainView = null;
let tool = require('../tool.js');
let cookies = require('js-cookie');


class GroupDetailPage {
    constructor(_myApp, _mainView) {
        myApp = _myApp;
        mainView = _mainView;

    }

    bind() {

        myApp.onPageBeforeInit('group-detail', (page) => {
            this.grpId = page.query.grpId || this.grpId;
            let usrId = cookies.getJSON('user').usrId;

            let that = this;

            console.log('group-detail onPageBeforeInit');

            tool.loadTemplateFromJsonPromise(myApp,ajaxMethod.getGroupById(this.grpId), page, (group)=> {
                console.log('group',JSON.stringify(group));
                $$('#btnJoin').on('click', function () {

                    tool.loadPage('order.html', mainView, ajaxMethod.getGroupById(that .grpId));
                });

                $$('.js-btn-host').on('click',function(){
                    // ajaxMethod.getFollowStatus(usrId, group.grpId).then((followed)=> {
                    console.log('group.grpHost.usrId',group.grpHost.usrId);
                    ajaxMethod.getFollowStatus(usrId, group.grpHost.usrId).then((followed)=> {
                        let buttons1 = [
                            {
                                text: '關注或取消關注此團主 (關注後,該團主再次開團您將會收到通知)',
                                label: true,
                            },
                            {
                                text: followed?'取消關注':'關注並接收通知',
                                onClick: function () {
                                    // let grpId = group.grpId;
                                    let grpHostId = group.grpHost.usrId;
                                    ajaxMethod.follow(usrId, grpHostId).then(()=>{
                                        myApp.alert('已關注');
                                    }).catch(e=>{
                                        myApp.alert(e.toString());
                                    });
                                }
                            }
                        ];
                        let buttons2 = [
                            {
                                text: '取消',
                                color: 'red'
                            }
                        ];
                        myApp.actions([buttons1,buttons2]);
                    });

                });

            });
        });

        myApp.onPageInit('group-detail', (page) => {

            console.log('group-detail Init');
        });
    }

}

module.exports = GroupDetailPage;
