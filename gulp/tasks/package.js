(function() {
    'use strict';
    
    var version     = require('version-io'),
        cl          = require('../cl');
        
    module.exports = function(callback) {
        cl(function(error, versionNew) {
            version(versionNew, function(error) {
                if (error)
                    callback(error);
                else
                    callback(null, 'package: done');
            });
            
            version(versionNew, {name: 'bower'}, function(error) {
                if (error)
                    callback(error);
                else
                    callback(null, 'bower: done');
            });
        });
    };
})();
