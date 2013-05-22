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
        api.authorize('SomeScheme', { token: 'token-value'});

        test.equals(api.authorize(), 'SomeScheme token="token-value"');
        test.done();
    };

    exports.common['realm should be set'] = function (test) {
        api.authorize('SomeScheme', { token: 'token-value'});
        api.authorize.realm('realm-name');

        test.equals(api.authorize(), 'SomeScheme token="token-value", realm="realm-name"');
        test.done();
    };

    exports.common['realm method should without arguments return current realm value'] = function (test) {
        api.authorize('SomeScheme', { token: 'token-value', realm: 'realm-name'});

        test.equals(api.authorize.realm(), 'realm-name');
        test.done();
    };

    exports.common['realm method should return undefined when no realm set'] = function (test) {
        test.equals(api.authorize.realm(), undefined, 'no auth-param');

        api.authorize('SomeScheme', { token: 'token-value'});
        test.equals(api.authorize.realm(), undefined, 'auth-params object');

        api.authorize('SomeScheme', 'token-value');
        test.equals(api.authorize.realm(), undefined, 'auth-params string');

        test.done();
    };

    exports.common['unauthorize should clear authorization'] = function (test) {
        api.authorize('SomeScheme some-token');

        test.equals(api.authorize(), 'SomeScheme some-token');

        api.unauthorize();

        test.equals(api.authorize(), undefined);
        test.done();
    };

    exports.common['scheme update should reset auth-params'] = function (test) {
        api.authorize('SomeScheme', { token: 'token-value', realm: 'realm-name' });
        api.authorize('Token', { token: 'new-value' });

        test.equals(api.authorize(), 'Token token="new-value"');
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