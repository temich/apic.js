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

    exports.request = function(options, callback) {
        if (!ready) {
            buffer.push({options: options, callback: callback});
            return;
        }

        var xhr = new Request();

        defaults(options);

        xhr.open(options.method, options.uri);

        if (options.headers) {
            for (var name in options.headers) {
                xhr.setRequestHeader(name, options.headers[name]);
            }
        }

        xhr.onload = function(e) {
            if (e) {
                return callback(e, xhr);
            }

            callback(null, xhr, JSON.parse(xhr.responseText));
        };

        xhr.send(options.representation);
    };
});