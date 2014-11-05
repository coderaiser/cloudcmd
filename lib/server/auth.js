(function() {
    'use strict';
    
    var DIR                 = './',
        DIR_LIB             = DIR + '../',
        crypto              = require('crypto'),
        
        tryRequire          = require(DIR + 'tryRequire', {log: true}),
        config              = require(DIR + 'config'),
        Util                = require(DIR_LIB + 'util'),
        isDeprecatedShown,
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
        }, function (username, password, callback) {
            var hash,
                name    = config('username'),
                pass    = config('password'),
                equal   = username === name,
                sha     = crypto.createHash('sha512WithRSAEncryption');
            
            if (!oldPass)
                oldPass = pass;
            
            if (!oldName)
                oldName = name;
            
            if (!equal)
                username === oldName;
            
            sha.update(password);
            
            hash        = sha.digest('hex');
            equal       = pass === hash && equal;
            
            if (!equal) {
                 sha    = crypto.createHash('sha512WithRSAEncryption');
                 sha.update(oldPass);
                 hash   = sha.digest('hex');
                 equal  = pass === hash && equal;
            }
            
            if (!equal) {
                equal   = oldSha(password, pass);
                
                if (equal && !isDeprecatedShown) {
                    console.error('Change password: ssh1 is not safe. New passwords would be saved in config in ssh512+RSA');
                    isDeprecatedShown = true;
                }
            }
            
            callback(equal);
        });
        
        return auth;
    }
    
    function oldSha(password, hash) {
        var hashNew,
            sha    = crypto.createHash('sha1');
        
        sha.update(password);
        hashNew    = sha.digest('hex');
        
        return hash === hashNew;
    }
})();
