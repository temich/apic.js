/*
TODO: independent module
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {

    var Request,
        buffer = [],
        ready = false;

    var mime = {
        json: 'application/json'
    };

    if (typeof XMLHttpRequest !== 'function') {
        throw Error('Unimplemented');
    }

    if ('withCredentials' in new XMLHttpRequest()) {
        Request = XMLHttpRequest;
        ready = true;
    } else {
        throw new Error('Unimplemented');

        /*
        require('./ie-request', function(ie) {
            Request = ie;
            flush();
        });
         */
    }

    function flush() {
        ready = true;

        buffer.forEach(function(req) {
            exports.request(req.options, req.callback);
        });

        buffer = undefined;
    }

    function defaults(options) {
        function def(name, value) {
            options[name] || (options[name] = value);
        }

        def('method', 'GET');
        def('headers', {});

        options.headers['Accept'] = mime.json;
        options.headers['Content-Type'] = mime.json;
    }

    function parse(str) {
        try {
            return JSON.parse(str);
        } catch(e) {
            return null;
        }
    }

    function stringify(obj) {
        try {
            return JSON.stringify(obj);
        } catch(e) {
            return '';
        }
    }

    exports.request = function(options, callback) {
        if (!ready) {
            buffer.push({options: options, callback: callback});
            return;
        }

        var xhr = new Request();

        xhr.withCredentials = !!options.cookie;

        defaults(options);

        xhr.open(options.method, options.uri);

        if (options.headers) {
            for (var name in options.headers) {
                xhr.setRequestHeader(name, options.headers[name]);
            }
        }

        xhr.onload = function() {
            var xx = Math.floor(xhr.status / 100),
                err = null;

            if (xx == 4 || xx == 5) {
                err = { status: xhr.status };
            }

            var data = xhr.responseText ? parse(xhr.responseText) : null;

            callback(err, data, xhr);
        };

        xhr.onerror = function(e) {
            e.status = 0;
            callback(e, null, xhr);
        }

        xhr.send(stringify(options.representation));
    };
});