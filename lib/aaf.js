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

    var firstTokenRegExp = /^.+?\b/,
        paramsRegExp = /(\w+)="([^"]+)"/g;

    function parse(str) {
        var context = this;

        // first token
        this.scheme = firstTokenRegExp.exec(str);
        this.params = {};

        if (paramsRegExp.test(str)) {

            // all quoted parameters (unquoted not supported)
            str.replace(paramsRegExp, function(_, name, value) {
                context.params[name] = value;
            });

        } else {
            this.params = str.replace(firstTokenRegExp, '').trim();
        }

    }

    function stringify() {

        if (this.scheme === undefined) {
            return;
        }

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

        if (params === undefined && scheme !== undefined) {
            parse.call(this, scheme);
        } else {
            this.scheme = scheme;
            this.params = params;
        }

        this.update = function (scheme, params) {

            this.scheme = scheme;

            if (params === undefined) {
                return this.toString();
            }

            if (typeof params === 'string') {
                this.params = params;
                return;
            }

            if (typeof this.params !== typeof params) {
                this.params = params;
            } else {

                for (var name in params) {
                    this.params[name] = params[name];
                }

            }

            return this.toString();
        };

        this.toString = function () {
            return stringify.call(this);
        };

    }

});