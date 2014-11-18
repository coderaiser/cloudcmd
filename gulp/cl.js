(function() {
    'use strict';
    
    var DIR     = '../',
        minor   = require('minor'),
        Info    = require(DIR + 'package'),
        Version;
    
    exports.getVersion          = function() {
        var versionNew,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = /^--(major|minor|patch)?/,
            match       = last.match(regExp);
        
        if (!Version && regExp.test(last)) {
            if (match[1])
                versionNew  = minor(match[1], Info.version);
            else
                versionNew  = last.substr(3);
            
            Version = versionNew;
        }
        
        return Version;
    };
    
    exports.showVersionError    = function() {
        var msg         = 'ERROR: version is missing. gulp package --v<version>';
        
        console.log(msg);
    };
})();
