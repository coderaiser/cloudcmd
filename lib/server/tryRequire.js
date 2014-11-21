(function() {
    'use strict';
    
    module.exports  = function tryRequire(name, options) {
        var result,
            o       = options || {},
            
            error   = tryCatch(function() {
                result = require(name);
            });
        
        if (error) {
            if (o.log)
                console.error([
                    module.parent.filename + ':',
                    error.code,
                    '\'' + name + '\'',
                ].join(' '));
            else if (o.callback)
                result = exec.bind(null, error);
            
            if (o.exit)
                process.exit(1);
        }
        
        return result;
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
