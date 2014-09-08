(function() {
    'use strict';
    
    var tryRequire          = require('./tryRequire'),
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
    
})();
