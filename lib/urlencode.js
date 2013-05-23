if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var uribraces = encodeURIComponent('[]');

    exports.encode = function encode(obj) {
        var params = [];

        if (!(obj instanceof Object)) {
            return encodeURIComponent(obj);
        }

        for (var name in obj) {
            var value = obj[name];

            if (value instanceof Array) {
                value.forEach(function(item) {
                    params.push(encodeURIComponent(name) + uribraces + '=' + encode(item));
                });
            } else {
                params.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            }
        }

        return params.length ? '?' + params.sort().join('&') : '';
    };
});

