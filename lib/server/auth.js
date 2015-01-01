(function() {
    'use strict';
    
    var DIR                 = './',
        
        crypto              = require('crypto'),
        
        tryRequire          = require('tryrequire'),
        config              = require(DIR + 'config'),
        
        oldPass,
        oldName;
        
    module.exports = function() {
        var type, httpAuth,
            
            middle = function(req, res, next) {
                next();
            };
        
        httpAuth = tryRequire('http-auth', {log: true});
        
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
            
            callback(equal);
        });
        
        return auth;
    }
})();
