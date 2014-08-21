(function() {
    'use strict';
    
    var Util                = require('../util'),
        minify              = tryRequire('minify');
    
    module.exports          = function(name, params, callback) {
        var ret = middle;
        
        if (minify)
            ret = minify(name, params, callback);
        else if (callback)
            callback();
       
       return ret;
    };
    
    function middle(req, res, next) {
        next();
    }

    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
})();
