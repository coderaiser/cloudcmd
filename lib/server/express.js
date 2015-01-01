(function() {
    'use strict';
    
    var DIR                 = __dirname + '/../../',
        DIR_LIB             = DIR + 'lib/',
        
        Util                = require(DIR_LIB + 'util'),
        
        tryRequire          = require('tryrequire'),
        
        express             = tryRequire('express'),
        logger              = tryRequire('morgan'),
        
        app                 = express && express();
    
    exports.getApp          = function(middleware) {
        var isArray = Util.type.array(middleware);
        
        if (app) {
            if (logger)
                app.use(logger('dev'));
            
            if (isArray)
                middleware.forEach(function(middle) {
                    app.use(middle);
                });
            
            app.use(express.static(DIR));
        }
        
        return app;
    };
})();
