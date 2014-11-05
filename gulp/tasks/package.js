(function() {
    'use strict';
    
    var version     = require('version-io'),
        cl          = require('../cl');
        
    module.exports = function() {
        var versionNew  = cl.getVersion();
        
        if (!versionNew)
            cl.showVersionError();
        else
            version(versionNew, function(error) {
                if (error)
                    console.error(error.message);
                else
                    console.log('package: done');
            });
    };
})();
