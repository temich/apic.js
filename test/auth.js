/**
 * Authorization tests
 */
if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    "use strict";

    var auth = require('../lib/auth');

    var api;

    exports.setUp = function (done) {
        api = {};
        auth.apply(api);

        done();
    };

    exports.common = {};

    exports.common['raw authorization should be supported'] = function (test) {
        var authorization = 'SomeScheme some-token';

        api.authorize(authorization);

        test.equals(api.authorize(), authorization);
        test.done();
    };

    exports.common['auth-params should be supported'] = function (test) {
        api.authorize('SomeScheme', { token: '123'});

        test.equals(api.authorize(), 'SomeScheme token="123"');
        test.done();
    };

    exports.common['realm should be set'] = function (test) {
        api.authorize('SomeScheme', { token: '123'});
        api.authorize.realm('realm-name');

        test.equals(api.authorize(), 'SomeScheme token="123", realm="realm-name"');
        test.done();
    };

    exports.common['realm setting order should not matter'] = function (test) {
        api.authorize.realm('realm-name');
        api.authorize('SomeScheme', { token: '123'});

        test.equals(api.authorize(), 'SomeScheme realm="realm-name", token="123"');
        test.done();
    };

    exports.common['unauthorize should clear authorization'] = function (test) {
        api.authorize('SomeScheme some-token');

        test.equals(api.authorize(), 'SomeScheme some-token');

        api.unauthorize();

        test.equals(api.authorize(), undefined);
        test.done();
    };

    exports.basic = {};

    exports.basic['login/password authorization sould be supported'] = function (test) {
        api.authorize.basic('test', 'test');

        test.equals(api.authorize(), 'Basic dGVzdDp0ZXN0'); // base64 encoded 'test:test'
        test.done();
    };

    exports.token = {};

    exports.token['token authorization should be supported'] = function (test) {
        api.authorize.token('token-value');

        test.equals(api.authorize(), 'Token token="token-value"');
        test.done();
    };

    exports.token['realm argument should be supported'] = function (test) {
        api.authorize.token('token-value', 'realm-name');

        test.equals(api.authorize(), 'Token token="token-value", realm="realm-name"');
        test.done();
    };

    exports.facebook = {};

    exports.facebook['facebook authorization should be supported'] = function (test) {
        api.authorize.facebook('token-value');

        test.equals(api.authorize(), 'Facebook token="token-value"');
        test.done();
    };

});