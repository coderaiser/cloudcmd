(function() {
    'use strict';
    
    var DIR     = '../',
        minor   = require('minor'),
        Info    = require(DIR + 'package');
    
    exports.getVersion          = function() {
        var versionNew,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = /^--(major|minor|patch)?/,
            match       = last.match(regExp);
            
        if (regExp.test(last)) {
            if (match[1])
                versionNew  = minor(match[1], Info.version);
            else
                versionNew  = last.substr(3);
            
            console.log(versionNew);
        }
        
        return versionNew;
    };
    
    exports.showVersionError    = function() {
        var msg         = 'ERROR: version is missing. gulp package --v<version>';
        
        console.log(msg);
    };
})();
