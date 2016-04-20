/**
 * Cross-Origin requests for IE 8—9
 * Uses iframe and Cross Document Messaging
 */
define(function() {

    var processing = {};

    function guid() {
        return +new Date() + '' + Math.ceil(Math.random() * 10000);
    }

    function getCORURI(request, options) {
        // TODO: always ssl
        var uri = request.uri,
            host,
            scheme = '',
            cor = '',
            _;

        _ = uri.split('//');

        if (_.length > 1) {
            if (_[0].substr(_[0].length - 1)  === ':') {
                scheme = _[0];
            }

            _ = _[1].split('/');
            host = _[0];
        }

        if (host) {
            cor = scheme + '//' + host
        }

        cor += options.cor;

        return cor;
    }


    function getProxy(uri, callback) {
        if (!getProxy.mems) {
            getProxy.mems = {};
        }

        if (getProxy.mems[uri]) {
            callback(getProxy.mems[uri]);
            return;
        }

        var div = document.createElement('div'),
            id = 'i' + guid(),
            onload = 'f' + guid();

        div.style.width = div.style.height = '0px';
        div.style.visibility = div.style.overflow = 'hidden';
        div.innerHTML = '<iframe id="' + id + '" src="' + uri + '" style="" onload="' + onload + '()" />';

        window[onload] = function() {
            getProxy.mems[uri] = document.getElementById(id).contentWindow;
            callback(getProxy.mems[uri]);
        };

        document.body.appendChild(div);
    }

    function handle(e) {
        e = e || event;

        var message,
            xhr;

        try {
            message = JSON.parse(e.data);
        } catch (e) {
            return;
        }

        if (message.type !== 'cor'
            || !processing[message.id]) {

            return;
        }

        xhr = processing[message.id];
        processing[message.id] = undefined;
        delete processing[message.id];

        // Normalize IE 1223 error to 204 response
        if (message.status === 1223) {
            message.status = 204;
            message.statusText = 'No Content';
        }

        // Normalize IE errors to 0 response
        // https://msdn.microsoft.com/en-us/library/windows/desktop/aa385465(v=vs.85).aspx
        if (message.status > 12000) {
            message.status = 0;
        }

        // IE send status 2 when Windows/IE is set to "Work offline" and the resource is not in the offline cache.
        // https://msdn.microsoft.com/en-us/library/windows/desktop/aa384247(v=vs.85).aspx
        if (message.status === 2) {
            message.status = 0;
        }

        xhr.status = message.status;
        xhr.responseText = message.response;
        xhr.headers = message.headers;

        message.status
            ? xhr.onload()
            : xhr.onerror({});
    }

    function send(request, options, xhr) {
        var uri = getCORURI(request, options),
            id = guid();

        processing[id] = xhr;

        getProxy(uri, function(proxy) {
            proxy.postMessage(JSON.stringify({
                id: id,
                req: request
            }), '*');
        });
    }

    if (typeof window !== 'undefined') {
        if (window.addEventListener) {
            window.addEventListener('message', handle, false);
        } else if (window.attachEvent)  {
            window.attachEvent('onmessage', handle);
        }
    }

    return function(options) {

        var request = { headers: {} };

        this.headers = {};
        this.onload = null;
        this.onerror = null;
        this.withCredentials = false;

        this.open = function(method, uri) {
            request.method = method;
            request.uri = uri;
        };

        this.setRequestHeader = function(name, value) {
            request.headers[name] = value;
        };

        this.getResponseHeader = function(name) {
            return this.headers[name.toLowerCase()];
        };

        this.send = function(body) {
            request.body = body;

            send(request, options, this);
        };

    }

});