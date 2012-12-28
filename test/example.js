/*if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var requirejs = require('requirejs');

var map = {};

map['transport'] = './stubs/transport';

var context = requirejs.config({
    context: Math.floor(Math.random() * 1000000),
    baseUrl: 'lib',
    nodeRequire: require,
    map: {
        "*": map
    }
});

exports.testSomethig = function(test) {
    var t = context('transport');
    console.log(t);

    test.ok(true, 'all ok');
    test.done();
}; */
