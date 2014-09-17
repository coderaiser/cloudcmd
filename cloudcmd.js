(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_LIB     = DIR       + 'lib/',
        DIR_SERVER  = DIR       + 'lib/server/',
        
        server      = require(DIR_LIB       + 'server'),
        config      = require(DIR_SERVER    + 'config');
        
        
    module.exports = function(params) {
        var keys;
        
        if (params) {
            keys = Object.keys(params);
            
            keys.forEach(function(name) {
                config(name, params[name]);
            });
        }
        
        server();
    };
})();
