/**
 * Access Authentication Framework
 * http://tools.ietf.org/html/rfc2617#section-1.2
 */

if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function () {
    "use strict";

    function parse(str) {
        var context = this;

        // first token
        this.scheme = /^.+?\b/.exec(str);
        this.params = {};

        // all quoted parameters (unquoted not supported)
        str.replace(/(\w+)="([^"]+)"/g, function(_, name, value) {
            context.params[name] = value;
        });

    }

    function stringify() {

        if (typeof this.params === 'string') {
            // Basic scheme doesnt fit Framework
            // http://www.rfc-editor.org/errata_search.php?rfc=2617&eid=1959
            return this.scheme + ' ' + this.params;
        }

        var list = [],
            value;

        for (var name in this.params) {
            value = this.params[name];

            if (value !== undefined) {
                list.push(name + '="' + value + '"');
            }

        }

        return this.scheme + (list.length ? ' ' + list.join(', ') : '');
    }

    return function (scheme, params) {

        if (params === undefined) {
            parse.call(this, scheme);
        } else {
            this.scheme = scheme;
            this.params = params;
        }

        this.update = function (scheme, params) {

            this.scheme = scheme;

            if (typeof params === 'string') {
                this.params = params;
                return;
            }

            for (var name in params) {
                this.params[name] = params[name];
            }

            return this.toString();
        };

        this.toString = function () {
            return stringify.call(this);
        };
    }

});