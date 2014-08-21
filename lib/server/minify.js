(function() {
    'use strict';
    
    var Util                = require('../util'),
        Minify              = tryRequire('minify');
    
    exports.optimize        = function(name, params, callback) {
        Util.checkArgs(arguments, ['name', 'callback']);
        
        if (!callback)
            callback = params;
        
        if (Minify)
            Minify.optimize(name, params, callback);
        else
            callback();
    };
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
})();
