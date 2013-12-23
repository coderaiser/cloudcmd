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
        crypto              = main.crypto,
        basic,
        app                 = express && express();
    
    exports.getApp          = function(controller) {
        var config = main.config,
            auth    = config.auth;
        
        if (app) {
            app.use(express.logger('dev'));
            
            if (auth && httpAuth) {
                initAuth();
                app.use(httpAuth.connect(basic));
            }
            
            app.all('*', controller);
        }
        
        return app;
    };
    
    
    function initAuth() {
        basic   = httpAuth.basic({
            realm: "Cloud Commander"
        }, function (username, password, callback) { // Custom authentication method.
            var hash,
                config  = main.config,
                name    = config.username,
                passwd  = config.password,
                equal   = username === name,
                sha     = crypto.createHash('sha1');
            
            sha.update(password);
            hash        = sha.digest('hex');
            equal       = passwd === hash && equal;
            
            callback(equal);
        });
    }
})();
