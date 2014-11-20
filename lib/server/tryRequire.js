(function() {
    'use strict';
    
    module.exports  = function tryRequire(name, options) {
        var module,
            o       = options || {},
            
            error   = tryCatch(function() {
                module = require(name);
            });
        
        if (error) {
            if (o.log)
                console.error(error.message);
            else if (o.callback)
                module = exec.bind(null, error);
            
            if (o.exit)
                process.exit(1);
        }
        
        return module;
    };
    
    function exec(error, callback) {
        callback(error);
    }
    
    function tryCatch(fn) {
        var error;
        
        try {
            fn();
        } catch(err) {
            error = err;
        }
        
        return error;
    }
})();
