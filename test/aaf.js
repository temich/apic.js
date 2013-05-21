/**
 * AAF tests
 */

if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    "use strict";

    var AAF = require('../lib/aaf');

    var exampleScheme,
        exampleParams,
        exampleStr;

    exports.setUp = function (done) {
        exampleScheme = 'Token';
        exampleParams = { token: 'value', realm: 'test', arg: 'arg value' };
        exampleStr = exampleScheme + ' token="value", realm="test", arg="arg value"';

        done();
    };

    exports['ctor should parse parameters object'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        test.equals(aaf.toString(), exampleStr);
        test.done();
    };

    exports['ctor should parse parameters string'] = function (test) {
        var aaf = new AAF('Basic', 'dGVzdDp0ZXN0');

        test.equals(aaf.scheme, 'Basic');
        test.equals(aaf.params, 'dGVzdDp0ZXN0');
        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0');
        test.done();
    };

    exports['ctor should parse authorization string'] = function (test) {
        var aaf = new AAF(exampleStr);

        test.equals(aaf.scheme, exampleScheme, 'scheme');
        test.deepEqual(aaf.params, exampleParams, 'params');
        test.done();
    };

    exports['ctor without arguments sould be supported'] = function (test) {
        var aaf = new AAF();

        test.equal(aaf.scheme, undefined);
        test.equal(aaf.params, undefined);
        test.equal(aaf.toString(), undefined);
        test.done();
    };

    exports['update should be applied partially'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        aaf.update({ realm: 'new value'});

        test.equal(aaf.params.realm, 'new value');
        test.notEqual(aaf.toString(), exampleStr);
        test.done();
    };

    exports['update without scheme should not affect auth-scheme'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        aaf.update({ realm: 'new value'});

        test.equal(aaf.scheme, exampleScheme);
        test.done();
    };

    exports['raw authorization should be supported'] = function (test) {
        var aaf = new AAF('Basic dGVzdDp0ZXN0');

        test.equals(aaf.scheme, 'Basic', 'scheme');
        test.equals(aaf.params, 'dGVzdDp0ZXN0', 'param');
        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0', 'authorization string');
        test.done();
    };

    exports['basic authorization should be supported'] = function (test) {
        var aaf = new AAF('Basic', 'dGVzdDp0ZXN0'); // base64 encoded 'test:test'

        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0');
        test.done();
    };

    exports['update object to string parameter should be supported'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        aaf.update('Basic', 'dGVzdDp0ZXN0');

        test.equals(aaf.scheme, 'Basic');
        test.equals(aaf.params, 'dGVzdDp0ZXN0');
        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0');
        test.done();
    };

    exports['update string to object parameter should be supported'] = function (test) {
        var aaf = new AAF('Basic', 'dGVzdDp0ZXN0');

        aaf.update('Basic', { realm: 'test' });

        test.equals(aaf.params.realm, 'test');
        test.equals(aaf.toString(), 'Basic realm="test"');
        test.done();
    };

});