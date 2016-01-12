/**
 * Base64 encoding/decoding
 */
if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function () {
    "use strict";

    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = [],
                c1, c2, c3, e1, e2, e3, e4,
                i = 0
                ;

            input = unescape(encodeURIComponent(input));

            while (i < input.length) {

                c1 = input.charCodeAt(i++);
                c2 = input.charCodeAt(i++);
                c3 = input.charCodeAt(i++);

                e1 = c1 >> 2;
                e2 = ((c1 & 3) << 4) | (c2 >> 4);
                e3 = ((c2 & 15) << 2) | (c3 >> 6);
                e4 = c3 & 63;

                if (isNaN(c2)) {
                    e3 = e4 = 64;
                } else if (isNaN(c3)) {
                    e4 = 64;
                }

                output.push(charset.charAt(e1));
                output.push(charset.charAt(e2));
                output.push(charset.charAt(e3));
                output.push(charset.charAt(e4));
            }

            return output.join('');
        }
    }

});