(function() {
    'use strict';
    
    var Util = require('../util');
    
    module.exports  = function tryRequire(name, options) {
        var module,
            o       = options || {},
            
            error   = Util.exec.try(function() {
                module = require(name);
            });
        
        if (error && o.log)
            Util.log(error.message);
        
        return module;
    };
})();
