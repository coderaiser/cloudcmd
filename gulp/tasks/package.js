(function() {
    'use strict';
    
    var version     = require('version-io'),
        cl          = require('../cl');
        
    module.exports = function(callback) {
        cl(function(error, versionNew) {
            var fn = function(data, error) {
                    var msg;
                    
                    if (!error)
                        msg = data + ': done';
                    
                    callback(error, msg);
                },
                
                fnPackage   = fn.bind(null, 'package'),
                fnBower     = fn.bind(null, 'bower');
            
            version(versionNew, {name: 'package'}, fnPackage);
            version(versionNew, {name: 'bower'}, fnBower);
        });
    };
})();
