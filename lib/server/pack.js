(function() {
    'use strict';
    
    var DIR     = './',
        pipe    = require(DIR + 'pipe');
    
    exports.gzip    = function(from, to, callback) {
        var options = {
            gzip    : true
        };
            
        pipe.create(from, to, options, callback);
    };
    
    exports.gunzip  = function(from, to, callback) {
        var options = {
            gunzip    : true
        };
            
        pipe.create(from, to, options, callback);
    };
})();
