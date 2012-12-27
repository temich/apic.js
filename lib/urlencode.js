define(function (require, exports) {
    var uribraces = encodeURIComponent('[]');

    exports.encode = function encode(obj) {
        var params = [];

        if (typeof obj === 'string') {
            return encodeURIComponent(obj);
        }

        for (var name in obj) {
            var value = obj[name];

            if (typeof value === 'string') {
                params.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
            }

            if (value instanceof Array) {
                value.forEach(function(item) {
                    params.push(encodeURIComponent(name) + uribraces + '=' + encode(item));
                });
            }
        }

        return params.length ? '?' + params.join('&') : '';
    };
});

