(function() {
    'use strict';
    
    var DIR         = '../../',
        fs          = require('fs'),
        
        cl          = require('../cl'),
        Info        = require(DIR + 'package');
        
    module.exports = function() {
        var data,
            version     = Info.version,
            versionNew  = cl.getVersion();
        
        if (!versionNew) {
            cl.showVersionError();
        } else {
            Info.version    = versionNew;
            data            = JSON.stringify(Info, 0, 2) + '\n';
            Info.version    = version;
            
            fs.writeFile('package.json', data, function(error) {
                var msg = 'package: done';
                
                console.log(error || msg);
            });
        }
    };
})();
