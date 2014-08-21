(function() {
    'use strict';
    
    var DIR                 = __dirname + '/../../',
        
        crypto              = require('crypto'),
        main                = global.cloudcmd.main,
        express             = main.require('express'),
        httpAuth            = main.require('http-auth'),
        logger              = main.require('morgan'),
        Util                = main.util,
        
        basic,
        oldPass,
        oldName,
        app                 = express && express();
    
    exports.getApp          = function(middleware) {
        var isArray = Util.isArray(middleware),
            config  = main.config,
            auth    = config.auth;
        
        if (app) {
            if (logger)
                app.use(logger('dev'));
            
            if (auth && httpAuth) {
                initAuth();
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
    
    
    function initAuth() {
        basic   = httpAuth.basic({
            realm: 'Cloud Commander'
        }, function (username, password, callback) { // Custom authentication method.
            var hash,
                config  = main.config,
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
