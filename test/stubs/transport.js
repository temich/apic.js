if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define('transport', function(require, exports) {

    console.log('stub1234');

    exports.request = function(options, callback) {
		console.log('j');
    };

});