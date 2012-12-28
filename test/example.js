var requirejs = require('requirejs');

var context = requirejs.config({
    context: Math.floor(Math.random() * 1000000),
    baseUrl: __dirname,
    nodeRequire: require,
    packages: [
        {
            "name": "transport",
            "location": "../test/stubs",
            "main": "transport.js"
        }
    ]
});

if (typeof define !== 'function') {
    define = require('amdefine')(module);
}

exports.testSomethig = function(test) {
    var apic = context('../lib/apic'),
        t = context('transport');

    t.request();

    console.log(apic);
};

