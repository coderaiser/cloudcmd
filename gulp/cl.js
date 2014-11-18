(function() {
    'use strict';
    
    var DIR     = '../',
        minor   = require('minor'),
        Info    = require(DIR + 'package'),
        ERROR   = Error('ERROR: version is missing. gulp package --v<version> or --major --minor --patch'),
        
        Version;
    
    module.exports  = function(callback) {
        var versionNew, error,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = /^--(major|minor|patch)?/,
            match       = last.match(regExp);
        
        if (!Version)
            if (!regExp.test(last)) {
                error = ERROR;
            } else {
                if (match[1])
                    versionNew  = minor(match[1], Info.version);
                else
                    versionNew  = last.substr(3);
                
                Version = versionNew;
            }
        
        callback(error, Version);
    };
})();
