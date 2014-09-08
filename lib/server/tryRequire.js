(function() {
    'use strict';
    
    var Util = require('../util');
    
    module.exports = function(name, callback) {
        var module,
            isFunc  = typeof callback === 'function',
            
            error   = Util.exec.try(function() {
                module = require(name);
            });
        
        if (error && isFunc)
            callback(error);
        
        return module;
    };
})();
