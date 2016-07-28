(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new Jonny();
    else
        global.jonny    = new Jonny();
    
    function Jonny() {
        this.parse      = function() {
            var ret,
                args = arguments;
            
            tryCatch(function() {
                ret = JSON.parse.apply(JSON, args);
            });
            
            return ret;
        };
        
        this.stringify  = function() {
            var ret,
                args = arguments;
            
            tryCatch(function() {
                ret = JSON.stringify.apply(JSON, args);
            });
            
            return ret;
        };
        
        function tryCatch(fn) {
            var error;
            
            try {
                fn();
            } catch(e) {
                error = e;
            }
            
            return error;
        }
    }
    
})(this);
