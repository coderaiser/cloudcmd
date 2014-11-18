(function() {
    'use strict';
    
    var changelog   = require('changelog-io'),
        cl          = require('../cl');
    
    module.exports = function(callback) {
        cl(function(error, versionNew) {
            if (error)
                callback(error);
            else
                changelog(versionNew, callback);
        });
    };
})();
