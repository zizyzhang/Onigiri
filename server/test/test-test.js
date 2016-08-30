/**
 * Created by Zizy on 8/30/16.
 */


const assert = require('chai').assert;
describe('TEST', function () {
    after(function () {
        console.log('before');
    });
    before(function () {
        console.log('before');
    });
    describe('test01',function(){
        console.log('test');
    })
});