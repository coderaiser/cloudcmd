(function() {
    'use strict';
    
    var changelog   = require('changelog-io'),
        prepend     = require('prepend'),
        cl          = require('../cl');
    
    module.exports = function(callback) {
        cl(function(error, versionNew) {
            var e = function(error) {
                if (error)
                    callback(error);
                
                return error;
            };
            
            e(error) || changelog(versionNew, function(error, data) {
                e(error) || prepend('ChangeLog', data, callback);
            });
        });
    };
})();
