(function() {
    'use strict';
    
    var DIR                 = './',
        DIR_LIB             = DIR + '../',
        crypto              = require('crypto'),
        
        tryRequire          = require(DIR + 'tryRequire', {log: true}),
        config              = require(DIR + 'config'),
        Util                = require(DIR_LIB + 'util'),
        
        oldPass,
        oldName;
        
    module.exports = function() {
        var type, httpAuth,
            
            middle = function(req, res, next) {
                next();
            };
        
        httpAuth = tryRequire('http-auth', function(error) {
            if (error)
                Util.log(error.message);
        });
        
        if (httpAuth) {
            type        = init(httpAuth, config);
            middle      = httpAuth.connect(type);
        }
        
        return middle;
    };
    
    function init(httpAuth, config) {
        var auth   = httpAuth.basic({
            realm: 'Cloud Commander'
        }, function (username, password, callback) { // Custom authentication method.
            var hash,
                name    = config('username'),
                passwd  = config('password'),
                equal   = username === name,
                sha     = crypto.createHash('sha512');
            
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
                 sha    = crypto.createHash('sha512WithRSAEncryption');
                 sha.update(oldPass);
                 hash   = sha.digest('hex');
                 equal  = passwd === hash && equal;
            }
            
            callback(equal);
        });
        
        return auth;
    }
})();
