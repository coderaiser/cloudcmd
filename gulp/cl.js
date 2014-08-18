(function() {
    'use strict';
    
    exports.getVersion          = function() {
        var versionNew,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = new RegExp('^--'),
            isMatch     = last.match(regExp);
            
        if (isMatch)
            versionNew  = last.substr(3);
        
        return versionNew;
    };
    
    exports.showVersionError    = function() {
        var msg         = 'ERROR: version is missing. gulp package --v<version>';
        
        console.log(msg);
    };
})();
