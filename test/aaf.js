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

    exports['ctor should parse authorization string'] = function (test) {
        var aaf = new AAF(exampleStr);

        test.equals(aaf.scheme, exampleScheme, 'scheme');
        test.deepEqual(aaf.params, exampleParams, 'params');
        test.done();
    };

    exports['update should be applied partially'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        aaf.update({ realm: 'new value'});
        exampleParams.realm = 'new value';

        test.deepEqual(aaf.params, exampleParams);
        test.notEqual(aaf.toString(), exampleStr);
        test.done();
    };

    exports['basic authorization should be supported'] = function (test) {
        var aaf = new AAF('Basic', 'dGVzdDp0ZXN0'); // btoa('test:test')

        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0');
        test.done();
    };

    exports['update to basic authorization should be supported'] = function (test) {
        var aaf = new AAF(exampleScheme, exampleParams);

        aaf.update('Basic', 'dGVzdDp0ZXN0');

        test.equals(aaf.scheme, 'Basic');
        test.equals(aaf.params, 'dGVzdDp0ZXN0');
        test.equals(aaf.toString(), 'Basic dGVzdDp0ZXN0');
        test.done();
    };

});