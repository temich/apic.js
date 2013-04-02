if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    var transport = require('./transport'),
        auth = require('./auth'),
        urlencode = require('./urlencode');

    var placeholder = /^{(.+)}$/;

    function result(value) {
        if (value.indexOf('=') === -1) {
            return value;
        }

        var parts = value.split('=');

        // TODO: remove primitive type object wrapper
        value = new String(parts[0]);
        value.variable = parts[1];

        return value
    }

    return function apic(desc, options) {
        options = options || {};

        var root = {},
            base = desc.base,
            safeMethods = { 'GET': true, 'HEAD': true, 'OPTIONS': true },
            representationExpected = { 'POST': true, 'PUT': true, 'PATCH': true },
            synonyms = {
                'PUT': ['save'],
                'POST': ['add'],
                'DELETE': ['remove']
            };

        var http = 'http:';

        options.synonyms = options.synonyms || synonyms;
        options.tokenHeader = options.tokenHeader || 'X-Security-Token';
        options.authorizationHeader = options.authorizationHeader || 'Authorization';

        if (typeof window !== 'undefined') {
            http = location.protocol; // current protocol in browser
        }

        var variables = {};

        auth.Authorizaeble.apply(root);

        function last(arr) {
            return typeof arr[arr.length - 1];
        }

        function method(verb, uri, res, params, secure) {
            var safe = safeMethods[verb] || false,
                protocol = (secure = secure || !safe) ? 'https:' : http;

            // do not ever use this
            if (options.__forceProtocol) {
                protocol = options.__forceProtocol;
            }

            return function () {
                var args = Array.prototype.slice.call(arguments),
                    callback = last(args) === 'function' ? args.pop() : undefined,
                    representation = last(args) === 'object' ? args.pop() : undefined,
                    query = last(args) === 'object' ? args.pop() : {},
                    path = uri,
                    headers = {};

                if (!representationExpected[verb]) {
                    query = representation || {};
                    representation = undefined;
                }

                /*
                 Check if all necessary arguments passed in arguments or have default variable value
                 */
                if (params.reduce(function (a, b) {
                    return a - +(query[b] !== undefined || variables[b.variable] !== undefined);
                }, params.length) > args.length) {

                    throw new Error([
                        params.length, ' argument', (params.length === 1 ? '' : 's'),
                        params.length ? ' (' + params.join(', ') + ')' : '',
                        ' expected ', args.length, ' given',
                        args.length ? ' (' + args.join(', ') + ')' : ''
                    ].join(''));

                }

                params.forEach(function (name, i) {

                    if (!query[name]) {
                        query[name] = args[i] === undefined
                            ? (name.variable && variables[name.variable])
                            : args[i];
                    }

                    if (name.template) {
                        var _ = '{' + name + '}',
                            value = args[i] || query[name];

                        path.indexOf(_) === -1
                            ? (path += '/' + value)
                            : (path = path.replace(_, value));

                        delete query[name];
                    }

                });

                // cleanup
                for (var name in query) {
                    if (query[name] === undefined) {
                        delete query[name];
                    }
                }

                if (secure && root.authorize()) {
                    headers[options.authorizationHeader] = root.authorize();
                }

                transport.request({
                    uri: protocol + base + path + urlencode.encode(query),
                    method: verb,
                    headers: headers,
                    body: representation,
                    cookie: options.cookie
                }, function (err, body, xhr) {
                    var token;

                    if (err) {
                        if (err.status === 401) {
                            root.unauthorize();
                        }

                        if (callback) {
                            body = body || {};
                            body.status = err.status;

                            callback(body);
                        }

                        return;
                    }

                    res.variable && (variables[res.variable] = body[res]);

                    if (secure) {
                        token = xhr.getResponseHeader(options.tokenHeader);
                        token && root.authorize.token(token);
                    }

                    callback && callback(null, body);
                });
            };
        }

        return function generate(map, uri, res) {
            var key,
                value,
                parts,
                secure,
                transparent,
                tree,
                _;

            res = res || {};

            for (key in map) {
                if (map.hasOwnProperty(key) && key !== '@') {
                    value = map[key];

                    transparent = key.match(placeholder);

                    key = (parts = key.split('#')).shift();

                    parts = parts.map(function (name) {
                        var template, variable, match;

                        if (name.charAt(0) === '/') {
                            template = true;
                            name = name.substr(1);
                        }

                        if (match = name.match(placeholder)) {
                            _ = match[1].split('=');

                            name = _[0];
                            variable = _[1];
                        }

                        // monkey code
                        // TODO: remove primitive type object wrapper
                        name = new String(name);
                        name.template = template;
                        name.variable = variable;

                        return name;
                    });

                    if (key.charAt(key.length - 1) === '*')
                        secure = !!(key = key.substring(0, key.length - 1));

                    if (key.charAt(0) !== ':') {
                        _ = key.toLowerCase();

                        tree = typeof value === 'string'
                            ? method(key, uri || '/', result(value), parts, secure)
                            : generate(value, (uri || '') + '/' + (value['@'] || key), transparent && res);

                        transparent || (res[_] = tree);

                        options.synonyms[key] && options.synonyms[key].forEach(function (alias) {
                            res[alias] || (res[alias] = res[_]);
                        });
                    } else
                        res[key.substr(1)] = res[value.toLowerCase()];
                }
            }

            return res;
        }(desc.resources, undefined, root);
    };

});
