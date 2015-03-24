(function() {
    'use strict';
    
    var DIR                 = './',
        
        tryRequire          = require('tryrequire'),
        config              = require(DIR + 'config'),
        cryptPassword       = require(DIR + 'password'),
        
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
                algo    = config('algo');
            
            if (!oldPass)
                oldPass = pass;
            
            if (!oldName)
                oldName = name;
            
            if (!equal)
                username === oldName;
            
            hash        = cryptPassword(algo, password);
            equal       = pass === hash && equal;
            
            if (!equal) {
                hash = cryptPassword(algo, oldPass);
                equal  = pass === hash && equal;
            }
            
            callback(equal);
        });
        
        return auth;
    }
})();
