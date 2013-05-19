define(function (require, exports) {

    var AAF = require('./aaf');

    exports.Authorizable = function () {

        var value = new AAF();

        var schemes = {

            'basic': function (login, password) {
                return authorize('Basic ', btoa(unescape(encodeURIComponent(login + ':' + password))));
            },

            'token': function (token, realm) {
                return authorize('Token', { token: token, realm: realm });
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

            return value.update(params);
        }

        for (var scheme in schemes) {
            authorize[scheme] = schemes[scheme];
        }

        this.authorize = authorize;

        this.realm = function (realm) {
            value.update({ realm: realm});
        };

        this.unauthorize = function () {
            value = new AAF();
        };

    };

});
