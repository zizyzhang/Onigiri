var assert = require('chai').assert;
var server = require ('./../server');



describe('Server', function () {
    describe('#usrAuth()', function () {
        it('should return 1 when given right usrName&usrPwd', function (done) {
            server.userAuth('a','123',function(data) {
                assert.equal(1, data.success);
                done();
            })
        });

        it('should return 0 when given wrong usrName&usrPwd', function (done) {
            server.userAuth('ab','123',function(data) {
                assert.equal(0, data.success);
                done();
            })
        });
    });

});
