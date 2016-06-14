if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function (require) {

    var AAF = require('./aaf'),
        base64 = require('./base64');

    return function () {

        var value = new AAF(),
            headers = {};

        var schemes = {

            'basic': function (login, password) {
                return authorize('Basic', base64.encode(login + ':' + password));
            },

            'token': function (token, realm) {
                return authorize('Token', { token: token, realm: realm });
            },

            'facebook': function (token) {
                return authorize('Facebook', { token: token });
            }

        };

        function authorize(scheme, params) {

            if (scheme === undefined) {
                return value.toString();
            }

            if (params === undefined) {
                // raw authentification header
                return value = new AAF(scheme);
            }

            return value.update(scheme, params);
        }

        for (var scheme in schemes) {
            authorize[scheme] = schemes[scheme];
        }

        authorize.realm = function (realm) {

            return realm === undefined
                ? value && value.params && value.params.realm // slicky code but it works (params can be a string)
                : value.update(value.scheme, { realm: realm });

        };
        
        authorize.headers = function (h) {

            if (h) {
                headers = h;
            }

            return headers;

        };

        this.authorize = authorize;

        this.unauthorize = function () {
            value = new AAF();
            headers = {};
        };

    };

});
