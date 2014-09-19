(function() {
    'use strict';
    
    var crypto              = require('crypto'),
        
        tryRequire          = require('./tryRequire'),
        oldPass,
        oldName;
        
    module.exports = function(config) {
        var type, httpAuth,
            
            middle = function(req, res, next) {
                next();
            };
        
        if (!config)
            config = {
                auth: false
            };
        
        if (config.auth) {
            httpAuth = tryRequire('http-auth');
            
            if (httpAuth) {
                type        = init(httpAuth, config);
                middle      = httpAuth.connect(type);
            }
        }
        
        return middle;
    };
    
    function init(httpAuth, config) {
        var auth   = httpAuth.basic({
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
        
        return auth;
    }
})();
