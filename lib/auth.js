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
                scheme = args && (args.shift() || '').toLowerCase();

            if (!scheme) {
                return value;
            }

            if (schemes[scheme]) {
                return value = schemes[scheme].apply(this, args);
            } else {
                // plain authorization 'Scheme credentials'
                scheme = scheme.charAt(0).toUpperCase() + scheme.substr(1); // uppercase first
                return value = scheme + (args[0] ? ' ' + args[0] : '');
            }
        }

        for (var scheme in schemes) {
            authorize[scheme] = (function(scheme) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);

                    args.unshift(scheme);

                    return authorize.apply(this, args);
                }
            })(scheme);
        }

        this.authorize = authorize;

    };

});
