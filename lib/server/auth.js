(function() {
    'use strict';
    
    var DIR                 = './',
        
        httpAuth            = require('http-auth'),
        config              = require(DIR + 'config'),
        cryptPassword       = require(DIR + 'password'),
        
        oldPass,
        oldName;
        
    module.exports = function() {
        var middle, type;
    
        type        = init(config);
        middle      = httpAuth.connect(type);
        
        return middle;
    };
    
    function init(config) {
        var auth   = httpAuth.basic({
            realm: 'Cloud Commander'
        }, function (username, password, callback) {
            var hash,
                is      = config('auth'),
                name    = config('username'),
                pass    = config('password'),
                equal   = username === name,
                algo    = config('algo');
            
            if (!is) {
                equal = true;
            } else {
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
            }
            
            callback(equal);
        });
        
        return auth;
    }
})();
