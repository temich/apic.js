if (typeof define !== 'function') {
    //noinspection JSUnresolvedVariable
    var define = require('amdefine')(module);
}

define(function (require) {
    var transport = require('./transport'),
        auth = require('./auth'),
        urlencode = require('./urlencode'),
        Exception = require('./exception');

    var placeholder = /^{(.+)}$/,
        safeMethods = { 'GET': true, 'HEAD': true, 'OPTIONS': true },
        synonyms;

    synonyms = {
        'PUT': ['save', 'replace'],
        'POST': ['add'],
        'DELETE': ['remove']
    };

    function result(value) {

        if (value.indexOf('=') === -1) {
            return value;
        }

        var parts = value.split('=');

        // TODO: remove primitive type object wrapper
        value = new String(parts[0]);
        value.variable = parts[1];

        return value;
    }

    function last(arr, except) {
        except || (except = 0);
        return typeof arr[arr.length - except - 1];
    }

    function merge() {
        var ret = {},
            len = arguments.length;

        for (var i = 0; i < len; i++) {

            for (var p in arguments[i]) {

                if (arguments[i].hasOwnProperty(p)) {
                    ret[p] = arguments[i][p];
                }

            }

        }

        return ret;
    }

    return function apic(desc, options) {
        options = options || {};

        var root = {},
            base = desc.base,
            variables = {},
            augments = {},
            language,
            lastResponse;

        var scheme = 'http:';

        options.synonyms = options.synonyms || synonyms;
        options.tokenHeader = options.tokenHeader || 'X-Security-Token';
        options.authorizationHeader = options.authorizationHeader || 'Authorization';

        if (typeof location !== 'undefined') {
            scheme = location.protocol; // current URI scheme
        }

        auth.apply(root);

        root.augment = function (name, value) {

            if (value === undefined) {
                return augments[name];
            }

            augments[name] = value;
        };

        root.localize = function (value) {

            if (value !== undefined) {
                language = value;
            }

            return language;
        };

        root.variable = function (name, value) {

            if (value !== undefined) {
                variables[name] = value;
            }

            return variables[name];
        };

        root.getLastResponse = function () {
            return lastResponse;
        };
        
        root.getBaseHost = function () {
            return base;
        };

        root.setBaseHost = function (host) {
            if (!host || host === root.getBaseHost()) return;

            base = host;
            return base;
        };

        function method(verb, uri, res, params, secure) {
            var safe = safeMethods[verb] || false,
                protocol = (secure = secure || !safe) ? 'https:' : scheme;

            // do not ever use this
            if (options.__forceProtocol) {
                protocol = options.__forceProtocol;
            }

            return function () {
                var args = Array.prototype.slice.call(arguments),
                    headers = last(args) === 'object' && last(args, 1) === 'function' ? args.pop() : {},
                    callback = (last(args) === 'function' || last(args) === 'undefined') ? args.pop() : undefined,
                    representation = last(args) === 'object' ? args.pop() : undefined,
                    query = last(args) === 'object' ? args.pop() : {},
                    path = uri,
                    _;

                if (safeMethods[verb]) {
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
                for (_ in query) {

                    if (query[_] === undefined) {
                        delete query[_];
                    }

                }

                if (secure && root.authorize()) {
                    headers = merge(headers, root.authorize.headers());
                    headers[options.authorizationHeader] = root.authorize();
                }

                if (language) {

                    if (safe) {
                        headers['Accept-Language'] = language;
                    } else if (representation) {
                        headers['Content-Language'] = language;
                    }

                }

                for (_ in augments) {

                    if (augments[_] !== null) {
                        headers[_] = augments[_];
                    }

                }

                transport.request({
                    uri: protocol + base + path + urlencode.encode(query),
                    method: verb,
                    headers: headers,
                    body: representation,
                    cookie: options.cookie
                }, function (err, body, xhr) {
                    var token;

                    function cb(err) {

                        if (!callback) {
                            return;
                        }

                        var args = [err, body];

                        /**
                         * Pass xhr object only if explicitly expected
                         * otherwise some libraries using 'arguments' object
                         * can work incorrectly
                         */
                        callback.length === 3 && args.push(xhr);
                        callback.apply(this, args);
                    }

                    lastResponse = xhr;

                    if (err) {

                        if (err.status === 401) {
                            root.unauthorize();
                        }

                        cb(new Exception(err, body));

                        return;
                    }

                    res.variable && (variables[res.variable] = body && body[res]);

                    if (secure) {
                        token = xhr.getResponseHeader(options.tokenHeader);
                        token && root.authorize.token(token, root.authorize.realm());
                    }

                    cb(null);
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
