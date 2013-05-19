define(function (require, exports) {

    var schemes = {

        'basic': function (login, password) {
            return 'Basic ' + btoa(login + ':' + password);
        },

        'token': function (token, realm) {
            return AAF('Token', { token: token, realm: realm });
        }

    };

    /**
     * Access Authentication Framework
     * http://tools.ietf.org/html/rfc2617#section-1.2
     */
    function AAF(scheme, params) {
        var list = [],
            value;

        for (var name in params) {
            value = params[name];

            if (value !== undefined) {
                list.push(name + '="' + params[name] + '"');
            }

        }

        return scheme + (list.length ? ' ' + list.join(', ') : '');
    }

    exports.Authorizable = function () {

        var value;

        function authorize() {
            var args = Array.prototype.slice.call(arguments),
                scheme = args && args.shift(),
                params = args[0],
                predefined;

            if (!scheme) {
                return value;
            }

            predefined = schemes[scheme.toLowerCase()];

            if (predefined) {
                return value = predefined.apply(this, args);
            } else {
                return value = typeof params === 'object' ? AAF(scheme, params) : scheme;
            }

        }

        function unauthorize() {
            value = undefined;
        }

        for (var scheme in schemes) {

            authorize[scheme.toLowerCase()] = (function (scheme) {

                return function () {
                    var args = Array.prototype.slice.call(arguments);

                    args.unshift(scheme);

                    return authorize.apply(this, args);
                }

            })(scheme);

        }

        this.authorize = authorize;
        this.unauthorize = unauthorize;

    };

});
