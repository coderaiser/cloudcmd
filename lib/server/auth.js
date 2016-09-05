(function() {
    'use strict';
    
    var DIR         = './',
        
        httpAuth    = require('http-auth'),
        criton      = require('criton'),
        config      = require(DIR + 'config');
        
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
        var sameName,
            samePass,
            name    = config('username'),
            pass    = config('password'),
            algo    = config('algo');
        
        sameName    = username === name;
        samePass    =    (password.length > 0) 
                      && (pass === criton(password, algo));
        
        callback(sameName && samePass);
    }
})();
