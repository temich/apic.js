/**
 * Base64 tests
 */
if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    "use strict";

    var base64 = require('../lib/base64');

    exports['sould encode'] = function (test) {
        test.equals(base64.encode('test'), 'dGVzdA==');
        test.done();
    };

    exports['sould encode UTF'] = function (test) {
        test.equals(base64.encode('проверка'), '0L/RgNC+0LLQtdGA0LrQsA==');
        test.done();
    };

});