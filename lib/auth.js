define(function (require, exports) {

    var schemes = {

        'basic': function(login, password) {
            return 'Basic ' + btoa(login + ':' + password);
        },

        'token': function(token) {
            return 'Token ' + token;
        }

    };

    exports.Authorizaeble = function() {

        var value;

        function authorize() {
            var args = Array.prototype.slice.call(arguments),
                scheme = args && args.shift(),
                predefined;

            if (!scheme) {
                return value;
            }

            predefined = schemes[scheme.toLowerCase()];

            if (predefined) {
                return value = predefined.apply(this, args);
            } else {
                // plain authorization 'Scheme credentials'
                return value = scheme + (args[0] ? ' ' + args[0] : '');
            }

        }

        function unauthorize() {
            value = undefined;
        }

        for (var scheme in schemes) {

            authorize[scheme.toLowerCase()] = (function(scheme) {

                return function() {
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
