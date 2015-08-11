(function() {
    'use strict';
    
    var DIR                 = './',
        
        httpAuth            = require('http-auth'),
        config              = require(DIR + 'config'),
        cryptPassword       = require(DIR + 'password'),
        
        oldPass,
        oldName;
        
    module.exports = function() {
        var auth   = httpAuth.basic({
            realm: 'Cloud Commander'
        }, check);
        
        return middle(auth);
    };
    
    function middle(authentication) {
        return function(req, res, next) {
            var is = config('auth');
            
            if (!is)
                next();
            else
                authentication.check(req, res, function(/* success */) {
                    next();
                });
        };
    }
    
    function check(username, password, callback) {
        var hash,
            name    = config('username'),
            pass    = config('password'),
            algo    = config('algo'),
            equal   = username === name;
        
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
    }
})();
