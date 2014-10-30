(function() {
    'use strict';
    
    var DIR         = '../../',
        changelog   = require('changelog-io'),
        cl          = require('../cl'),
        Info        = require(DIR + 'package');
    
    module.exports = function() {
        var version     = 'v' + Info.version,
            versionNew  = cl.getVersion();
        
        if (versionNew)
            versionNew  = 'v' + versionNew;
        else
            versionNew  = version + '?';
        
        changelog(versionNew, function(error, msg) {
            if (error)
                console.error(error.message);
            else
                console.log(msg);
        });
    };
})();
