/**
 * Thrown exception
 */
define(function () {
    "use strict";

    function Exception(err, res) {
        for (var name in res) {
            this[name] = res[name];
        }

        err && (this.status = err.status);
    }

    Exception.prototype = new Error();
    Exception.prototype.constructor = Exception;

    return Exception;
});