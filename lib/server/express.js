(function() {
    'use strict';
    
    var DIR                 = __dirname + '/../../',
        DIR_LIB             = DIR + 'lib/',
        
        Util                = require(DIR_LIB + 'util'),
        crypto              = require('crypto'),
        
        tryRequire          = require('./tryRequire'),
        
        express             = tryRequire('express'),
        httpAuth            = tryRequire('http-auth'),
        logger              = tryRequire('morgan'),
        
        basic,
        oldPass,
        oldName,
        app                 = express && express();
    
    exports.getApp          = function(middleware, config) {
        var isArray = Util.isArray(middleware);
        
        if (!config)
            config = {
                auth: false
            };
        
        if (app) {
            if (logger)
                app.use(logger('dev'));
            
            if (config.auth && httpAuth) {
                initAuth(config);
                app.use(httpAuth.connect(basic));
            }
            
            if (isArray)
                middleware.forEach(function(middle) {
                    app.use(middle);
                });
            
            app.use(express.static(DIR));
        }
        
        return app;
    };
    
    
    function initAuth(config) {
        basic   = httpAuth.basic({
            realm: 'Cloud Commander'
        }, function (username, password, callback) { // Custom authentication method.
            var hash,
                name    = config.username,
                passwd  = config.password,
                equal   = username === name,
                sha     = crypto.createHash('sha1');
            
            if (!oldPass)
                oldPass = passwd;
            
            if (!oldName)
                oldName = name;
            
            if (!equal)
                username === oldName;
            
            sha.update(password);
            hash        = sha.digest('hex');
            equal       = passwd === hash && equal;
            
            if (!equal) {
                 sha    = crypto.createHash('sha1');
                 sha.update(oldPass);
                 hash   = sha.digest('hex');
                 equal  = passwd === hash && equal;
            }
            
            callback(equal);
        });
    }
})();
