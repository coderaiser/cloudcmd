(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# express.js'                                     + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# easy to use web server.'                        + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
             
    var main                = global.cloudcmd.main,
        express             = main.require('express'),
        httpAuth            = main.require('http-auth'),
        logger              = main.require('morgan'),
        Util                = main.util,
        crypto              = require('crypto'),
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
