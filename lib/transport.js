/*
TODO: independent module
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {

    // TODO: async load for IE only
    var COR = require('./cor');

    var Request,
        buffer = [],
        ready = false;

    var media = {
        json: 'application/json'
    };

    if (typeof XMLHttpRequest === 'undefined') {
        // node
        throw Error('Not implemented');
    }

    if ('withCredentials' in new XMLHttpRequest()) {
        Request = XMLHttpRequest;
        ready = true;
    } else {
        // TODO: async with flush()
        Request = COR;
        ready = true;
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
        def('xhr', {});

        options.media || (options.media = media.json);
        options.xhr.cor || (options.xhr.cor = '/cor.html');
        options.xhr.timeout || (options.xhr.timeout = 30000);
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

        defaults(options);

        var req = new Request(options.xhr);

        options.headers['Accept'] = options.media;

        if (options.body !== undefined) {
            options.headers['Content-Type'] = options.media;
        }

        req.open(options.method, options.uri);
        req.withCredentials = !!options.cookie;

        if (options.headers) {
            for (var name in options.headers) {
                req.setRequestHeader(name, options.headers[name]);
            }
        }

        req.onload = function() {
            var xx = Math.floor(req.status / 100),
                err = null;

            if (xx == 4 || xx == 5) {
                err = { status: req.status };
            }

            var res = req.responseText ? parse(req.responseText) : null;

            callback(err, res, req);
        };

        req.onerror = function(e) {
            e.status = 0;
            callback(e, null, req);
        };

        req.send(stringify(options.body));
    };
});