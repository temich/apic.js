if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {

    console.log('stub');

    exports.request = function(options, callback) {
		console.log('j');
    };

});