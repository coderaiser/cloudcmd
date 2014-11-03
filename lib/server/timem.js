(function () {
    'use strict';
    
    var fs          = require('fs'),
        Util        = require('../util');
    
    exports.get  = function(filename, option, callback) {
        var isRaw = option === 'raw';
        
        if (!callback)
            callback = option;
        
        Util.check(arguments, ['filename', 'callback']);
        
        fs.stat(filename, function(error, stat) {
            var time, timeRet;
            
            if (!error) {
                time = stat.mtime;
                
                if (isRaw)
                    timeRet = time.getTime();
                else
                    timeRet = time;
            }
            
            callback(error, timeRet);
        });
    };
    
})();
