(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_SERVER  = DIR       + 'server/',
        
        server      = require(DIR           + 'server'),
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
