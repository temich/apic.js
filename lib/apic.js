define(function (require) {
	/*
	 TODO: Remove jquery dependency
	 */
	var transport = require('jquery').ajax;

	function request(method, url, data, headers) {
		return transport({
			url: url,
			type: method,
			data: data,
			headers: headers,
			xhrFields: {
				withCredentials: true
			}
		});
	}

	function result(value) {
		if (value.indexOf('=') === -1)
			return value;

		parts = value.split('=');
		value = new String(parts[0]);
		value.variable = parts[1];
		return value
	}

	return function apic(desc, ssl, options) {
		options = options || {};

		var base = desc.base,
			safeMethods = { 'GET': true, 'HEAD': true, 'OPTIONS': true },
			tokenHeader = options.tokenHeader || 'X-Security-Token',
			aliases = options.aliases || {
				'PUT': ['save'],
				'POST': ['add'],
				'DELETE': ['remove']
			};

		var token, variables = {};

		function last(arr) {
			return typeof arr[arr.length - 1];
		}

		function method(verb, uri, res, params, secure) {
			var safe = safeMethods[verb] || false,
				protocol = ssl || (secure = secure || !safe) ? 'https:' : 'http:';

			return function () {
				var args = Array.prototype.slice.call(arguments),
					callback = last(args) === 'function' ? args.pop() : undefined,
					query = last(args) === 'object' ? args.pop() : {},
					path = uri,
					headers = {}
					;

				/*
				 Check if all necessary arguments passed in arguments or query object or have default variable value
				 */
				if (params.reduce(function (a, b) {
					return a - +(query.hasOwnProperty(b) || !!variables[b.variable]);
				}, params.length) > args.length)
					throw new Error([
						params.length, ' argument', (params.length === 1 ? '' : 's'),
						params.length ? ' (' + params.join(', ') + ')' : '',
						' expected ', args.length, ' given',
						args.length ? ' (' + args.join(', ') + ')' : ''
					].join(''));

				params.forEach(function (name, i) {
					if (query[name] && args[i])
						throw new Error('Duplicate key (' + name + ')');

					query[name] || (query[name] = args[i] || (name.variable && variables[name.variable]));

					if (name.template) {
						var _ = '{' + name + '}',
							value = args[i] || query[name];

						path.indexOf(_) === -1
							? (path += '/' + value)
							: (path = path.replace(_, value));

						delete query[name];
					}
				});

				secure && (headers[tokenHeader] = token);

				var err, resp;

				request(verb, protocol + base + path, query, headers)
					.done(function (data, code, xhr) {
						res.variable && (variables[res.variable] = data[res]);

						resp = data[res];

					})
					.fail(function (xhr) {
						err = {};

						if (xhr.responseText) {
							try {
								err = JSON.parse(xhr.responseText)['error'] || {};
							}
							catch (e) {
							}
						}

						err.status = xhr.status;
					})
					.always(function(a, status, b) {
						var xhr = status === 'success' ? b : a; // WTF

						secure && (token = xhr.getResponseHeader(tokenHeader) || token);

						callback && (callback.length > 1
							? callback(err, resp)
							: (err || callback(resp))
							);
					});
			};
		}

		return function generate(map, url) {
			var res = { },
				key,
				value,
				parts,
				secure,
				_;

			for (key in map)
				if (map.hasOwnProperty(key) && key !== '@') {
					value = map[key];

					key = (parts = key.split('#')).shift();

					parts = parts.map(function (name) {
						var template, variable, match;

						if (name.charAt(0) === '/') {
							template = true;
							name = name.substr(1);
						}

						if (match = name.match(/^{(.+)}$/)) {
							parts = match[1].split('=');

							name = parts[0];
							variable = parts[1];
						}

						name = new String(name);
						name.template = template;
						name.variable = variable;

						return name;
					});

					if (key.charAt(key.length - 1) === '*')
						secure = !!(key = key.substring(0, key.length - 1));

					if (key.charAt(0) !== ':') {
						res[_ = key.toLowerCase()] = typeof value === 'string'
							? method(key, url || '/', result(value), parts, secure)
							: generate(value, (url || '') + '/' + (value['@'] || key));

						aliases[key] && aliases[key].forEach(function (alias) {
							res[alias] || (res[alias] = res[_]);
						});
					} else
						res[key.substr(1)] = res[value.toLowerCase()];
				}

			return res;
		}(desc.resources);
	};
});